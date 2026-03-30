/**
 * tRPC procedures for Grant Finder and AI Grant Analysis
 * v2 — Critical evaluation mode with innovation scoring and realistic success rates
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { matchGrants, GRANTS_DATABASE } from "../grantsData";

type MsgRole = "system" | "user" | "assistant";

const grantsContext = GRANTS_DATABASE.map(
  (g) =>
    `- **${g.name}** (${g.provider}): ${g.description} | Max: €${g.maxAmount.toLocaleString()} | Förderquote: ${g.fundingRate}% | Durchschnittliche Erfolgsquote laut Statistik: ${g.successRate}% | Frist: ${g.isRolling ? "Laufend" : g.deadline} | Schwierigkeit: ${g.difficulty} | Voraussetzungen: ${g.eligibleTypes.join(", ")}`
).join("\n");

// ─── Critical AI system prompt ────────────────────────────────────────────────

const CRITICAL_SYSTEM_PROMPT = `Du bist ein kritischer, unabhängiger österreichischer Förderberater bei MSV Consulting in Wien. Du bist bekannt für deine ehrliche, manchmal unbequeme Einschätzung — denn nur realistische Erwartungen helfen deinen Kunden wirklich.

**Deine Kernaufgabe:** Unternehmen realistisch einschätzen, ob und welche Förderungen sie bekommen können — und warum nicht alle.

**Verfügbare Förderungen in deiner Datenbank (Stand: 2026):**
${grantsContext}

---

## PHASE 1 — INFORMATIONSSAMMLUNG

Wenn noch nicht genug Informationen vorhanden sind, stelle EINE gezielte Frage. Priorität:
1. Was macht das Unternehmen / die Idee konkret? (Produkt, Service, Technologie)
2. Was ist das INNOVATIVE an der Lösung? Gibt es vergleichbare Lösungen am Markt?
3. Unternehmensphase (Idee, MVP, erste Umsätze, etabliert)
4. Standort in Österreich
5. Mitarbeiterzahl und Umsatz (falls vorhanden)
6. Geplantes Vorhaben / Projekt für das Förderung gesucht wird

**Wichtig beim Sammeln:** Wenn der User eine vage oder allgemeine Antwort gibt (z.B. "wir haben eine innovative App"), hake KRITISCH nach: "Was genau ist das Innovative daran? Was können Sie, das andere nicht können?" Lass dich nicht mit Buzzwords abspeisen.

---

## PHASE 2 — FINALE ANALYSE

Sobald du genug Informationen hast (mindestens: Beschreibung, Innovationsgrad einschätzbar, Phase, Standort), erstelle die finale Analyse.

**Beginne die finale Analyse IMMER mit genau diesem Marker:** ## 📊 Ihre persönliche Förderanalyse (Quick-Check)

### Pflichtbestandteile der Analyse:

#### 1. 🔍 Unternehmens-Snapshot
Kurze Zusammenfassung des Unternehmens in 2-3 Sätzen.

#### 2. 💡 Innovationsbewertung (KRITISCH)
Bewerte den Innovationsgrad auf einer Skala 1–10 mit Begründung:
- **Neuheitsgrad:** Gibt es das schon? Wie differenziert ist die Lösung wirklich?
- **Technologische Tiefe:** Ist es eine echte technologische Innovation oder ein neues Geschäftsmodell?
- **Marktdifferenzierung:** Was ist der konkrete USP gegenüber bestehenden Lösungen?
- **Förderrelevanz:** Viele Förderungen (v.a. FFG) verlangen nachweisbare F&E-Aktivität — ist das gegeben?

Sei hier EHRLICH. Wenn die Innovation schwach ist, sage es klar. Beispiel: "Die beschriebene Lösung ist eine Weiterentwicklung bestehender Technologien ohne erkennbaren Forschungsanteil — das schränkt die Förderfähigkeit bei FFG und Horizon Europe erheblich ein."

#### 3. ⚠️ Risikofaktoren & Schwächen
Liste 2-4 konkrete Punkte auf, die die Förderfähigkeit gefährden:
- Fehlende Voraussetzungen (z.B. kein F&E-Anteil, zu frühe Phase, falscher Standort)
- Typische Ablehnungsgründe für ähnliche Unternehmen
- Was der Antragsteller noch aufbauen/belegen muss

#### 4. 🏆 Passende Förderungen (Top 3–5)
Für jede Förderung:
- **Name & Anbieter**
- **Warum passend** (konkrete Begründung basierend auf den Unternehmensdaten)
- **Realistischer Erfolgsquote-Schätzwert** (0–100%) — berechne dies KRITISCH:
  * Basis: Statistische Erfolgsquote der Förderung
  * Anpassung nach oben/unten basierend auf: Innovationsgrad, Phase, Vollständigkeit der Unterlagen, Wettbewerb
  * Sei konservativ: Wenn die statistische Quote 45% ist und das Unternehmen schwache Innovation hat, schreibe 20–30%, nicht 45%
- **Voraussetzungen die noch fehlen**
- **Nächste Schritte**

#### 5. 📈 Gesamteinschätzung
Ein abschließendes Urteil in 3–4 Sätzen: Wie förderfähig ist dieses Unternehmen insgesamt? Was ist der realistischste Weg zu einer Förderung?

---

## WICHTIGE REGELN:
- Antworte IMMER auf Deutsch
- Verwende Markdown-Formatierung
- Sei kritisch aber konstruktiv — kein Schönreden, aber auch kein Demotivieren
- Stelle in Phase 1 immer nur EINE Frage
- Wenn ein Businessplan hochgeladen wurde, extrahiere alle Informationen daraus und stelle nur noch Fragen zu wirklich fehlenden Details
- NIEMALS pauschal hohe Erfolgsquoten angeben — lieber 20% realistisch als 80% unrealistisch`;

// ─── Router ───────────────────────────────────────────────────────────────────

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

  // === Conversational AI intake: critical evaluation with innovation focus ===
  conversationalIntake: publicProcedure
    .input(
      z.object({
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        businessPlanUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const messages: Array<{
        role: MsgRole;
        content: string | Array<{ type: string; [key: string]: unknown }>;
      }> = [{ role: "system", content: CRITICAL_SYSTEM_PROMPT }];

      // If a business plan PDF was uploaded, attach it to the first user message
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
          for (const msg of input.conversationHistory.slice(1)) {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      } else {
        for (const msg of input.conversationHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content =
        response.choices[0]?.message?.content ??
        "Antwort konnte nicht generiert werden.";

      // Detect final analysis by the exact marker
      const isFinalAnalysis =
        typeof content === "string" &&
        content.includes("## 📊 Ihre persönliche Förderanalyse");

      // If final analysis, derive matched grants from conversation context
      let matchedGrants: typeof GRANTS_DATABASE = [];
      if (isFinalAnalysis) {
        const allText = input.conversationHistory
          .map((m) => m.content)
          .join(" ")
          .toLowerCase();

        const isStartup =
          allText.includes("startup") ||
          allText.includes("gründ") ||
          allText.includes("neu") ||
          allText.includes("idee");
        const isVienna =
          allText.includes("wien") || allText.includes("vienna");
        const isTech =
          allText.includes("tech") ||
          allText.includes("software") ||
          allText.includes("digital") ||
          allText.includes("ki") ||
          allText.includes("ai") ||
          allText.includes("app");
        const isGreen =
          allText.includes("green") ||
          allText.includes("klima") ||
          allText.includes("nachhaltig") ||
          allText.includes("energie");
        const isHealth =
          allText.includes("health") ||
          allText.includes("gesund") ||
          allText.includes("medizin") ||
          allText.includes("pharma");

        matchedGrants = matchGrants({
          companyType: isStartup ? "startup" : "sme",
          industry: isTech
            ? "tech"
            : isGreen
              ? "green"
              : isHealth
                ? "health"
                : "all",
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
      const systemPrompt = `Du bist ein kritischer österreichischer Förderberater bei MSV Consulting in Wien.

Verfügbare Förderungen:
${grantsContext}

Antworte auf Deutsch, professionell und kritisch. Verwende Markdown-Formatierung. Sei realistisch bei Erfolgsquoten.`;

      const userMessage = `Analysiere folgendes Unternehmen kritisch:
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
        ...(input.conversationHistory ?? []).map((m) => ({
          role: m.role as MsgRole,
          content: m.content,
        })),
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content =
        response.choices[0]?.message?.content ??
        "Analyse konnte nicht erstellt werden.";

      const matchedGrants = matchGrants({
        companyType: input.stage.toLowerCase().includes("startup")
          ? "startup"
          : "sme",
        industry: input.industry.toLowerCase().includes("tech")
          ? "tech"
          : input.industry.toLowerCase().includes("green")
            ? "green"
            : input.industry.toLowerCase().includes("health")
              ? "health"
              : "all",
        projectType: "all",
        region: input.location.toLowerCase().includes("wien")
          ? "vienna"
          : "austria",
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
      const systemPrompt = `Du bist ein kritischer österreichischer Förderberater bei MSV Consulting. Du führst ein Beratungsgespräch über Fördermöglichkeiten nach einer abgeschlossenen Quick-Check-Analyse.

Verfügbare Förderungen: 
${grantsContext}

${input.companyContext ? `Unternehmenskontext: ${input.companyContext}` : ""}

Antworte präzise, professionell und kritisch auf Deutsch. Verwende Markdown für Formatierung. Sei realistisch bei Erfolgseinschätzungen — kein Schönreden.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: input.userMessage },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await invokeLLM({ messages: messages as any });
      const content =
        response.choices[0]?.message?.content ??
        "Antwort konnte nicht generiert werden.";

      return { reply: content as string };
    }),
});
