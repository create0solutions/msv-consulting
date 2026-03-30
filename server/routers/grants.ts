/**
 * tRPC procedures for Grant Finder and AI Grant Analysis
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { matchGrants, GRANTS_DATABASE } from "../grantsData";

type MsgRole = "system" | "user" | "assistant";

const grantsContext = GRANTS_DATABASE.map(
  (g) =>
    `- **${g.name}** (${g.provider}): ${g.description} | Max: €${g.maxAmount.toLocaleString()} | Förderquote: ${g.fundingRate}% | Erfolgsquote: ${g.successRate}% | Frist: ${g.isRolling ? "Laufend" : g.deadline} | Schwierigkeit: ${g.difficulty}`
).join("\n");

export const grantsRouter = router({
  // === Grant Finder: filter-based matching ===
  findGrants: publicProcedure
    .input(
      z.object({
        companyType: z.string().default(""),
        industry: z.string().default("all"),
        projectType: z.string().default("all"),
        region: z.string().default("austria"),
        fundingMin: z.number().default(0),
        fundingMax: z.number().default(0),
      })
    )
    .query(({ input }) => {
      const results = matchGrants(input);
      return {
        grants: results,
        total: results.length,
      };
    }),

  // === Get all grants (for initial display) ===
  getAllGrants: publicProcedure.query(() => {
    return {
      grants: GRANTS_DATABASE,
      total: GRANTS_DATABASE.length,
    };
  }),

  // === Conversational AI intake: checks if enough info, asks follow-up questions or produces final report ===
  conversationalIntake: publicProcedure
    .input(
      z.object({
        // The full conversation so far (user + assistant turns)
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        // Optional: URL of an uploaded business plan PDF
        businessPlanUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `Du bist ein erfahrener österreichischer Förderberater bei MSV Consulting in Wien. Deine Aufgabe ist es, Unternehmen bei der Suche nach passenden Förderungen zu helfen.

Verfügbare Förderungen in deiner Datenbank (Stand: 2026):
${grantsContext}

**Dein Vorgehen:**
1. Analysiere die bisherigen Informationen des Nutzers.
2. Wenn noch NICHT genug Informationen vorhanden sind, stelle EINE gezielte Nachfrage (nicht mehrere auf einmal). Frage nach dem, was am wichtigsten fehlt (z.B. Branche, Unternehmensphase, Standort, Projektbeschreibung, Mitarbeiterzahl, Umsatz).
3. Sobald du genug Informationen hast (Unternehmensname oder -beschreibung, Branche, Standort, Phase/Größe, und ein grobes Vorhaben), erstelle eine vollständige Förderanalyse.
4. Die vollständige Analyse enthält:
   - Kurze Zusammenfassung des Unternehmens
   - Top 3-5 passende Förderungen mit Begründung, Voraussetzungen, Erfolgsquote und nächsten Schritten
   - Realistische Einschätzung der Erfolgschancen
   - Konkrete Handlungsempfehlungen

**Wichtig:** 
- Stelle immer nur EINE Frage auf einmal
- Antworte auf Deutsch, professionell und freundlich
- Verwende Markdown-Formatierung
- Wenn ein Businessplan hochgeladen wurde, extrahiere alle relevanten Informationen daraus und stelle nur noch Fragen zu fehlenden Details
- Beginne die finale Analyse mit "## 📊 Ihre persönliche Förderanalyse"`;

      const messages: Array<{ role: MsgRole; content: string | Array<{ type: string; [key: string]: unknown }> }> = [
        { role: "system", content: systemPrompt },
      ];

      // If a business plan PDF was uploaded, include it in the first user message
      if (input.businessPlanUrl && input.conversationHistory.length === 1) {
        const firstUserMsg = input.conversationHistory[0];
        if (firstUserMsg) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: firstUserMsg.content },
              {
                type: "file_url",
                file_url: {
                  url: input.businessPlanUrl,
                  mime_type: "application/pdf",
                },
              },
            ],
          });
          // Add remaining history
          for (const msg of input.conversationHistory.slice(1)) {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      } else {
        // Normal text conversation
        for (const msg of input.conversationHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content = response.choices[0]?.message?.content ?? "Antwort konnte nicht generiert werden.";

      // Detect if this is a final analysis (contains the marker)
      const isFinalAnalysis = typeof content === "string" && content.includes("## 📊 Ihre persönliche Förderanalyse");

      // If final analysis, also return matched grants
      let matchedGrants: typeof GRANTS_DATABASE = [];
      if (isFinalAnalysis) {
        // Try to extract company info from conversation for matching
        const allText = input.conversationHistory.map((m) => m.content).join(" ").toLowerCase();
        const isStartup = allText.includes("startup") || allText.includes("gründ") || allText.includes("neu");
        const isVienna = allText.includes("wien") || allText.includes("vienna");
        const isTech = allText.includes("tech") || allText.includes("software") || allText.includes("digital") || allText.includes("ki") || allText.includes("ai");
        const isGreen = allText.includes("green") || allText.includes("klima") || allText.includes("nachhaltig") || allText.includes("energie");
        const isHealth = allText.includes("health") || allText.includes("gesund") || allText.includes("medizin");

        matchedGrants = matchGrants({
          companyType: isStartup ? "startup" : "sme",
          industry: isTech ? "tech" : isGreen ? "green" : isHealth ? "health" : "all",
          projectType: "all",
          region: isVienna ? "vienna" : "austria",
          fundingMin: 0,
          fundingMax: 0,
        }).slice(0, 6);
      }

      return {
        reply: content as string,
        isFinalAnalysis,
        matchedGrants,
      };
    }),

  // === Legacy: AI Grant Analysis (kept for backward compat) ===
  analyzeCompany: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        industry: z.string().min(1),
        stage: z.string().min(1),
        description: z.string().min(10),
        employees: z.number().optional(),
        revenue: z.string().optional(),
        projectDescription: z.string().optional(),
        location: z.string().default("Wien"),
        previousGrants: z.string().optional(),
        documentUrls: z.array(z.string()).optional(),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `Du bist ein erfahrener österreichischer Förderberater bei MSV Consulting in Wien.

Verfügbare Förderungen:
${grantsContext}

Antworte auf Deutsch, professionell und konkret. Verwende Markdown-Formatierung.`;

      const userMessage = `Analysiere folgendes Unternehmen:
**Name:** ${input.companyName}
**Branche:** ${input.industry}
**Phase:** ${input.stage}
**Standort:** ${input.location}
**Mitarbeiter:** ${input.employees ?? "k.A."}
**Umsatz:** ${input.revenue ?? "k.A."}
**Beschreibung:** ${input.description}
${input.projectDescription ? `**Vorhaben:** ${input.projectDescription}` : ""}
${input.previousGrants ? `**Bisherige Förderungen:** ${input.previousGrants}` : ""}`;

      const messages: Array<{ role: MsgRole; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
        ...(input.conversationHistory ?? []).map((m) => ({ role: m.role as MsgRole, content: m.content })),
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content = response.choices[0]?.message?.content ?? "Analyse konnte nicht erstellt werden.";

      const matchedGrants = matchGrants({
        companyType: input.stage.toLowerCase().includes("startup") ? "startup" : "sme",
        industry: input.industry.toLowerCase().includes("tech") ? "tech" :
          input.industry.toLowerCase().includes("green") ? "green" :
          input.industry.toLowerCase().includes("health") ? "health" : "all",
        projectType: "all",
        region: input.location.toLowerCase().includes("wien") ? "vienna" : "austria",
        fundingMin: 0,
        fundingMax: 0,
      });

      return {
        analysis: content as string,
        matchedGrants: matchedGrants.slice(0, 6),
      };
    }),

  // === AI Follow-up Chat ===
  chatFollowUp: publicProcedure
    .input(
      z.object({
        userMessage: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        companyContext: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `Du bist ein erfahrener österreichischer Förderberater bei MSV Consulting. Du führst ein Beratungsgespräch über Fördermöglichkeiten.

Verfügbare Förderungen: 
${grantsContext}

${input.companyContext ? `Unternehmenskontext: ${input.companyContext}` : ""}

Antworte präzise, professionell und hilfreich auf Deutsch. Verwende Markdown für Formatierung.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.userMessage },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content = response.choices[0]?.message?.content ?? "Antwort konnte nicht generiert werden.";

      return { reply: content as string };
    }),
});
