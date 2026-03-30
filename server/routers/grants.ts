/* MSV Consulting - Grants Router
 * tRPC procedures for Grant Finder and AI Grant Analysis
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { matchGrants, GRANTS_DATABASE } from "../grantsData";

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

  // === AI Grant Analysis: analyze company and return funding report ===
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
      // Build the grants context for the AI
      const grantsContext = GRANTS_DATABASE.map(
        (g) =>
          `- **${g.name}** (${g.provider}): ${g.description} | Max: €${g.maxAmount.toLocaleString()} | Förderquote: ${g.fundingRate}% | Frist: ${g.isRolling ? "Laufend" : g.deadline} | Schwierigkeit: ${g.difficulty}`
      ).join("\n");

      const systemPrompt = `Du bist ein erfahrener österreichischer Förderberater bei MSV Consulting in Wien. Du analysierst Unternehmen und gibst detaillierte, professionelle Empfehlungen zu passenden Förderungen.

Verfügbare Förderungen in deiner Datenbank (Stand: 2026):
${grantsContext}

Deine Aufgabe:
1. Analysiere das Unternehmen gründlich anhand der bereitgestellten Informationen
2. Identifiziere die 3-5 am besten passenden Förderungen
3. Erkläre für jede Förderung: Warum passt sie? Was sind die Voraussetzungen? Was sind die nächsten Schritte?
4. Gib eine realistische Einschätzung der Erfolgschancen
5. Weise auf mögliche Herausforderungen und Verbesserungspotenziale hin
6. Wenn Informationen fehlen, stelle gezielte Nachfragen

Antworte auf Deutsch, professionell und konkret. Verwende Markdown-Formatierung für bessere Lesbarkeit.
Beginne mit einer kurzen Zusammenfassung der Analyse, dann die Förderempfehlungen, dann Handlungsempfehlungen.`;

      const userMessage = `Bitte analysiere folgendes Unternehmen:

**Unternehmensname:** ${input.companyName}
**Branche:** ${input.industry}
**Unternehmensphase:** ${input.stage}
**Standort:** ${input.location}
**Mitarbeiter:** ${input.employees ?? "nicht angegeben"}
**Umsatz:** ${input.revenue ?? "nicht angegeben"}

**Unternehmensbeschreibung:**
${input.description}

${input.projectDescription ? `**Geplantes Projekt/Vorhaben:**\n${input.projectDescription}` : ""}

${input.previousGrants ? `**Bisherige Förderungen:**\n${input.previousGrants}` : ""}

Bitte erstelle eine detaillierte Förderanalyse mit konkreten Empfehlungen.`;

      type MsgRole = "system" | "user" | "assistant";
      const messages: Array<{ role: MsgRole; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      // Add conversation history if present
      if (input.conversationHistory && input.conversationHistory.length > 0) {
        messages.push({ role: "user", content: userMessage });
        for (const msg of input.conversationHistory) {
          messages.push({ role: msg.role as MsgRole, content: msg.content });
        }
      } else {
        messages.push({ role: "user", content: userMessage });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content = response.choices[0]?.message?.content ?? "Analyse konnte nicht erstellt werden.";

      // Also return matched grants for display
      const matchedGrants = matchGrants({
        companyType: input.stage.includes("startup") || input.stage.includes("Startup") ? "startup" : "sme",
        industry: input.industry.toLowerCase().includes("tech") ? "tech" :
                  input.industry.toLowerCase().includes("green") || input.industry.toLowerCase().includes("klima") ? "green" :
                  input.industry.toLowerCase().includes("health") || input.industry.toLowerCase().includes("gesund") ? "health" : "all",
        projectType: "all",
        region: input.location.toLowerCase().includes("wien") ? "vienna" : "austria",
        fundingMin: 0,
        fundingMax: 0,
      });

      return {
        analysis: content,
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
      const grantsContext = GRANTS_DATABASE.map(
        (g) => `- ${g.name} (${g.provider}): Max €${g.maxAmount.toLocaleString()}, ${g.fundingRate}% Förderquote`
      ).join("\n");

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

      return { reply: content };
    }),
});
