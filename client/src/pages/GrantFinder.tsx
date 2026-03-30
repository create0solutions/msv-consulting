/* MSV Consulting - Grant Finder Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Step-by-step wizard + results grid
 * Features: 5-step filter wizard, grant cards with details, deadline badges
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChevronRight, ChevronLeft, Search, Calendar, Euro,
  ExternalLink, CheckCircle2, Clock, TrendingUp, Building2,
  Sparkles, Filter, ArrowRight
} from "lucide-react";

// ─── Step definitions ─────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  { id: "startup", labelDe: "Startup / Gründer", labelEn: "Startup / Founder", icon: "🚀" },
  { id: "sme", labelDe: "KMU (Klein- & Mittelunternehmen)", labelEn: "SME (Small & Medium Enterprise)", icon: "🏢" },
  { id: "corporate", labelDe: "Großunternehmen", labelEn: "Large Corporation", icon: "🏭" },
  { id: "research", labelDe: "Forschungseinrichtung", labelEn: "Research Institution", icon: "🔬" },
];

const INDUSTRIES = [
  { id: "tech", labelDe: "Technologie & Software", labelEn: "Technology & Software", icon: "💻" },
  { id: "green", labelDe: "Green Tech & Nachhaltigkeit", labelEn: "Green Tech & Sustainability", icon: "🌱" },
  { id: "health", labelDe: "Gesundheit & Life Sciences", labelEn: "Health & Life Sciences", icon: "🏥" },
  { id: "manufacturing", labelDe: "Produktion & Industrie", labelEn: "Manufacturing & Industry", icon: "⚙️" },
  { id: "services", labelDe: "Dienstleistungen", labelEn: "Services", icon: "🤝" },
  { id: "all", labelDe: "Alle Branchen", labelEn: "All Industries", icon: "🌐" },
];

const PROJECT_TYPES = [
  { id: "r&d", labelDe: "Forschung & Entwicklung", labelEn: "Research & Development", icon: "🔭" },
  { id: "digitalization", labelDe: "Digitalisierung", labelEn: "Digitalization", icon: "📱" },
  { id: "ai", labelDe: "KI / Artificial Intelligence", labelEn: "AI / Artificial Intelligence", icon: "🤖" },
  { id: "founding", labelDe: "Unternehmensgründung", labelEn: "Company Founding", icon: "🌱" },
  { id: "growth", labelDe: "Wachstum & Skalierung", labelEn: "Growth & Scaling", icon: "📈" },
  { id: "internationalization", labelDe: "Internationalisierung", labelEn: "Internationalization", icon: "🌍" },
];

const REGIONS = [
  { id: "vienna", labelDe: "Wien", labelEn: "Vienna", icon: "🏛️" },
  { id: "austria", labelDe: "Österreich (national)", labelEn: "Austria (national)", icon: "🇦🇹" },
  { id: "eu", labelDe: "EU-weit", labelEn: "EU-wide", icon: "🇪🇺" },
];

const FUNDING_RANGES = [
  { min: 0, max: 50000, labelDe: "Bis €50.000", labelEn: "Up to €50,000" },
  { min: 50000, max: 200000, labelDe: "€50.000 – €200.000", labelEn: "€50,000 – €200,000" },
  { min: 200000, max: 1000000, labelDe: "€200.000 – €1 Mio.", labelEn: "€200,000 – €1M" },
  { min: 1000000, max: 5000000, labelDe: "€1 Mio. – €5 Mio.", labelEn: "€1M – €5M" },
  { min: 5000000, max: 0, labelDe: "Über €5 Mio.", labelEn: "Over €5M" },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "oklch(0.70 0.17 162)",
  medium: "oklch(0.75 0.15 60)",
  hard: "oklch(0.65 0.2 25)",
};

const DIFFICULTY_LABEL: Record<string, { de: string; en: string }> = {
  easy: { de: "Einfach", en: "Easy" },
  medium: { de: "Mittel", en: "Medium" },
  hard: { de: "Komplex", en: "Complex" },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GrantFinder() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [companyType, setCompanyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [projectType, setProjectType] = useState("");
  const [region, setRegion] = useState("");
  const [fundingRange, setFundingRange] = useState<{ min: number; max: number } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedGrant, setExpandedGrant] = useState<string | null>(null);

  const { data, isLoading } = trpc.grants.findGrants.useQuery(
    {
      companyType,
      industry,
      projectType,
      region,
      fundingMin: fundingRange?.min ?? 0,
      fundingMax: fundingRange?.max ?? 0,
    },
    { enabled: showResults }
  );

  const steps = [
    { key: "type", titleDe: "Unternehmenstyp", titleEn: "Company Type" },
    { key: "industry", titleDe: "Branche", titleEn: "Industry" },
    { key: "project", titleDe: "Projektart", titleEn: "Project Type" },
    { key: "region", titleDe: "Standort", titleEn: "Location" },
    { key: "funding", titleDe: "Förderhöhe", titleEn: "Funding Amount" },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setCompanyType("");
    setIndustry("");
    setProjectType("");
    setRegion("");
    setFundingRange(null);
    setShowResults(false);
    setExpandedGrant(null);
  };

  const canProceed = () => {
    if (step === 0) return !!companyType;
    if (step === 1) return !!industry;
    if (step === 2) return !!projectType;
    if (step === 3) return !!region;
    if (step === 4) return !!fundingRange;
    return true;
  };

  const formatAmount = (n: number) =>
    n >= 1000000 ? `€${(n / 1000000).toFixed(1)} Mio.` : `€${n.toLocaleString("de-AT")}`;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.004 240)" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.07 240) 0%, oklch(0.30 0.08 220) 100%)" }}
      >
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Search size={14} style={{ color: "oklch(0.70 0.17 162)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
              {lang === "de" ? "Förderungen finden" : "Find Grants"}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {lang === "de" ? "Welche Förderungen passen zu Ihrem Unternehmen?" : "Which grants fit your company?"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}>
            {lang === "de"
              ? "Beantworten Sie 5 kurze Fragen und erhalten Sie eine personalisierte Liste passender Förderungen aus Österreich und der EU."
              : "Answer 5 short questions and receive a personalized list of matching grants from Austria and the EU."}
          </p>
        </div>
      </section>

      {/* Wizard / Results */}
      <section className="py-16">
        <div className="container max-w-4xl">
          {!showResults ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}>
              {/* Progress bar */}
              <div className="h-1.5" style={{ background: "oklch(0.92 0.006 240)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "oklch(0.70 0.17 162)" }}
                />
              </div>

              {/* Step header */}
              <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? `Schritt ${step + 1} von ${steps.length}` : `Step ${step + 1} of ${steps.length}`}
                  </span>
                </div>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                  {lang === "de" ? steps[step].titleDe : steps[step].titleEn}
                </h2>
              </div>

              {/* Step content */}
              <div className="px-8 py-8">
                {/* Step 0: Company type */}
                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {COMPANY_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCompanyType(t.id)}
                        className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          border: companyType === t.id ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                          background: companyType === t.id ? "rgba(16,185,129,0.06)" : "white",
                        }}
                      >
                        <span className="text-3xl">{t.icon}</span>
                        <span className="font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? t.labelDe : t.labelEn}
                        </span>
                        {companyType === t.id && <CheckCircle2 size={18} className="ml-auto flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1: Industry */}
                {step === 1 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.id}
                        onClick={() => setIndustry(ind.id)}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          border: industry === ind.id ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                          background: industry === ind.id ? "rgba(16,185,129,0.06)" : "white",
                        }}
                      >
                        <span className="text-2xl">{ind.icon}</span>
                        <span className="font-semibold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? ind.labelDe : ind.labelEn}
                        </span>
                        {industry === ind.id && <CheckCircle2 size={16} className="ml-auto flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Project type */}
                {step === 2 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROJECT_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => setProjectType(pt.id)}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          border: projectType === pt.id ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                          background: projectType === pt.id ? "rgba(16,185,129,0.06)" : "white",
                        }}
                      >
                        <span className="text-2xl">{pt.icon}</span>
                        <span className="font-semibold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? pt.labelDe : pt.labelEn}
                        </span>
                        {projectType === pt.id && <CheckCircle2 size={16} className="ml-auto flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Region */}
                {step === 3 && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {REGIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRegion(r.id)}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          border: region === r.id ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                          background: region === r.id ? "rgba(16,185,129,0.06)" : "white",
                        }}
                      >
                        <span className="text-4xl">{r.icon}</span>
                        <span className="font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? r.labelDe : r.labelEn}
                        </span>
                        {region === r.id && <CheckCircle2 size={18} style={{ color: "oklch(0.70 0.17 162)" }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4: Funding range */}
                {step === 4 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FUNDING_RANGES.map((fr, i) => (
                      <button
                        key={i}
                        onClick={() => setFundingRange(fr)}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          border: fundingRange?.min === fr.min && fundingRange?.max === fr.max ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                          background: fundingRange?.min === fr.min && fundingRange?.max === fr.max ? "rgba(16,185,129,0.06)" : "white",
                        }}
                      >
                        <Euro size={18} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0 }} />
                        <span className="font-semibold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? fr.labelDe : fr.labelEn}
                        </span>
                        {fundingRange?.min === fr.min && fundingRange?.max === fr.max && (
                          <CheckCircle2 size={16} className="ml-auto flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-8 pb-8 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30"
                  style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.45 0.02 240)" }}
                >
                  <ChevronLeft size={16} />
                  {lang === "de" ? "Zurück" : "Back"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                  style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {step === steps.length - 1
                    ? (lang === "de" ? "Förderungen anzeigen" : "Show Grants")
                    : (lang === "de" ? "Weiter" : "Continue")}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              {/* Results header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                    {isLoading
                      ? (lang === "de" ? "Suche läuft..." : "Searching...")
                      : lang === "de"
                        ? `${data?.total ?? 0} passende Förderungen gefunden`
                        : `${data?.total ?? 0} matching grants found`}
                  </h2>
                  <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? "Basierend auf Ihren Angaben — sortiert nach Relevanz" : "Based on your inputs — sorted by relevance"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
                    style={{ background: "white", border: "1px solid oklch(0.88 0.006 240)", color: "oklch(0.45 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    <Filter size={14} />
                    {lang === "de" ? "Filter ändern" : "Change Filters"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 text-white"
                    style={{ background: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {lang === "de" ? "Neu starten" : "Start Over"}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
                      style={{ borderColor: "oklch(0.70 0.17 162)", borderTopColor: "transparent" }} />
                    <p style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                      {lang === "de" ? "Förderungen werden geladen..." : "Loading grants..."}
                    </p>
                  </div>
                </div>
              ) : data?.grants.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 4px 24px rgba(10,46,82,0.08)" }}>
                  <Search size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.22 0.07 240)" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                    {lang === "de" ? "Keine direkten Treffer" : "No direct matches"}
                  </h3>
                  <p className="mb-6" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de"
                      ? "Für Ihre spezifische Kombination konnten wir keine Förderungen finden. Nutzen Sie unsere KI-Analyse für eine tiefere Suche."
                      : "We couldn't find grants for your specific combination. Use our AI analysis for a deeper search."}
                  </p>
                  <a href="/foerdercheck"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 hover:opacity-90"
                    style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    <Sparkles size={16} />
                    {lang === "de" ? "KI-Analyse starten" : "Start AI Analysis"}
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.grants.map((grant) => (
                    <div
                      key={grant.id}
                      className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ boxShadow: "0 4px 24px rgba(10,46,82,0.08)", border: "1px solid oklch(0.92 0.006 240)" }}
                    >
                      {/* Card header */}
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedGrant(expandedGrant === grant.id ? null : grant.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                              >
                                {grant.provider}
                              </span>
                              <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{
                                  background: `${DIFFICULTY_COLOR[grant.difficulty]}20`,
                                  color: DIFFICULTY_COLOR[grant.difficulty],
                                  fontFamily: "'Nunito Sans', sans-serif",
                                }}
                              >
                                {lang === "de" ? DIFFICULTY_LABEL[grant.difficulty].de : DIFFICULTY_LABEL[grant.difficulty].en}
                              </span>
                              {grant.isRolling ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                                  style={{ background: "rgba(16,185,129,0.1)", color: "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  <Clock size={10} />
                                  {lang === "de" ? "Laufend" : "Rolling"}
                                </span>
                              ) : grant.deadline ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                                  style={{ background: "rgba(245,158,11,0.1)", color: "oklch(0.65 0.15 60)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  <Calendar size={10} />
                                  {new Date(grant.deadline).toLocaleDateString("de-AT")}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="text-lg font-black mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                              {lang === "de" ? grant.name : grant.nameEn}
                            </h3>
                            <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {lang === "de" ? grant.description : grant.descriptionEn}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.70 0.17 162)" }}>
                              {formatAmount(grant.maxAmount)}
                            </div>
                            <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {lang === "de" ? "max. Förderung" : "max. grant"}
                            </div>
                            <div className="text-sm font-bold mt-1" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {grant.fundingRate}% {lang === "de" ? "Förderquote" : "funding rate"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedGrant === grant.id && (
                        <div className="px-6 pb-6 pt-0 border-t" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                          <div className="grid sm:grid-cols-3 gap-4 mt-4 mb-5">
                            <div className="flex items-center gap-2">
                              <Euro size={16} style={{ color: "oklch(0.70 0.17 162)" }} />
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {lang === "de" ? "Mindestbetrag" : "Min. Amount"}
                                </div>
                                <div className="text-sm font-bold" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {formatAmount(grant.minAmount)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} style={{ color: "oklch(0.70 0.17 162)" }} />
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {lang === "de" ? "Bearbeitungszeit" : "Processing Time"}
                                </div>
                                <div className="text-sm font-bold" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {grant.processingTime}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp size={16} style={{ color: "oklch(0.70 0.17 162)" }} />
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {lang === "de" ? "Förderquote" : "Funding Rate"}
                                </div>
                                <div className="text-sm font-bold" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {grant.fundingRate}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {grant.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                                style={{ background: "oklch(0.94 0.006 240)", color: "oklch(0.45 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <a
                              href={grant.providerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                              style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              <ExternalLink size={14} />
                              {lang === "de" ? "Zur Förderstelle" : "Visit Funder"}
                            </a>
                            <a
                              href="/foerdercheck"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                              style={{ background: "rgba(16,185,129,0.1)", color: "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              <Sparkles size={14} />
                              {lang === "de" ? "KI-Analyse starten" : "Start AI Analysis"}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CTA to AI Analysis */}
              {!isLoading && (data?.grants?.length ?? 0) > 0 && (
                <div
                  className="mt-10 p-8 rounded-2xl text-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.22 0.07 240), oklch(0.30 0.08 220))" }}
                >
                  <Sparkles size={32} className="mx-auto mb-3" style={{ color: "oklch(0.70 0.17 162)" }} />
                  <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {lang === "de" ? "Möchten Sie eine tiefere Analyse?" : "Want a deeper analysis?"}
                  </h3>
                  <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de"
                      ? "Unser KI-Fördercheck analysiert Ihr Unternehmen im Detail und gibt Ihnen einen umfassenden Bericht über Ihre Förderfähigkeit."
                      : "Our AI grant check analyzes your company in detail and gives you a comprehensive report on your funding eligibility."}
                  </p>
                  <a
                    href="/foerdercheck"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                    style={{ background: "oklch(0.70 0.17 162)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {lang === "de" ? "KI-Fördercheck starten" : "Start AI Grant Check"}
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
