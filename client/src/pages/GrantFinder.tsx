/* MSV Consulting - Grant Finder Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Step-by-step wizard + results grid
 * Features: 5-step filter wizard with multi-select, city search, success rate on results
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChevronRight, ChevronLeft, Search, Calendar, Euro,
  ExternalLink, CheckCircle2, Clock, TrendingUp,
  Sparkles, Filter, ArrowRight, Target, MapPin, X
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
  { id: "ai", labelDe: "KI / Artificial Intelligence", labelEn: "AI / Artificial Intelligence", icon: "🤖" },
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

// All Austrian cities + EU option for location search
const ALL_LOCATIONS = [
  { id: "vienna", labelDe: "Wien", labelEn: "Vienna", region: "vienna" },
  { id: "graz", labelDe: "Graz", labelEn: "Graz", region: "austria" },
  { id: "linz", labelDe: "Linz", labelEn: "Linz", region: "austria" },
  { id: "salzburg", labelDe: "Salzburg", labelEn: "Salzburg", region: "austria" },
  { id: "innsbruck", labelDe: "Innsbruck", labelEn: "Innsbruck", region: "austria" },
  { id: "klagenfurt", labelDe: "Klagenfurt", labelEn: "Klagenfurt", region: "austria" },
  { id: "villach", labelDe: "Villach", labelEn: "Villach", region: "austria" },
  { id: "wels", labelDe: "Wels", labelEn: "Wels", region: "austria" },
  { id: "st-poelten", labelDe: "St. Pölten", labelEn: "St. Pölten", region: "austria" },
  { id: "dornbirn", labelDe: "Dornbirn", labelEn: "Dornbirn", region: "austria" },
  { id: "steyr", labelDe: "Steyr", labelEn: "Steyr", region: "austria" },
  { id: "wiener-neustadt", labelDe: "Wiener Neustadt", labelEn: "Wiener Neustadt", region: "austria" },
  { id: "feldkirch", labelDe: "Feldkirch", labelEn: "Feldkirch", region: "austria" },
  { id: "bregenz", labelDe: "Bregenz", labelEn: "Bregenz", region: "austria" },
  { id: "austria", labelDe: "Österreich (national)", labelEn: "Austria (national)", region: "austria" },
  { id: "eu", labelDe: "EU-weit", labelEn: "EU-wide", region: "eu" },
];

const FUNDING_RANGES = [
  { id: "0-50k", min: 0, max: 50000, labelDe: "Bis €50.000", labelEn: "Up to €50,000" },
  { id: "50k-200k", min: 50000, max: 200000, labelDe: "€50.000 – €200.000", labelEn: "€50,000 – €200,000" },
  { id: "200k-1m", min: 200000, max: 1000000, labelDe: "€200.000 – €1 Mio.", labelEn: "€200,000 – €1M" },
  { id: "1m-5m", min: 1000000, max: 5000000, labelDe: "€1 Mio. – €5 Mio.", labelEn: "€1M – €5M" },
  { id: "5m+", min: 5000000, max: 0, labelDe: "Über €5 Mio.", labelEn: "Over €5M" },
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

// ─── Multi-select toggle helper ───────────────────────────────────────────────

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

// ─── Success rate color ───────────────────────────────────────────────────────

function successRateColor(rate: number): string {
  if (rate >= 65) return "oklch(0.70 0.17 162)";
  if (rate >= 40) return "oklch(0.75 0.15 60)";
  return "oklch(0.65 0.2 25)";
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GrantFinder() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [companyType, setCompanyType] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [projectType, setProjectType] = useState("");
  // Location: multi-select + city search
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [fundingRangeIds, setFundingRangeIds] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedGrant, setExpandedGrant] = useState<string | null>(null);

  // Derive region for backend from selected locations
  const derivedRegion = useMemo(() => {
    if (selectedLocations.includes("eu")) return "eu";
    if (selectedLocations.includes("vienna")) return "vienna";
    if (selectedLocations.length > 0) return "austria";
    return "";
  }, [selectedLocations]);

  // Derive funding min/max from selected ranges
  const derivedFunding = useMemo(() => {
    if (fundingRangeIds.length === 0) return { min: 0, max: 0 };
    const selected = FUNDING_RANGES.filter((r) => fundingRangeIds.includes(r.id));
    const min = Math.min(...selected.map((r) => r.min));
    const max = Math.max(...selected.map((r) => r.max));
    return { min, max };
  }, [fundingRangeIds]);

  // Derive primary industry for backend (first selected, or "all")
  const primaryIndustry = industries.length > 0 ? industries[0] : "all";

  const { data, isLoading } = trpc.grants.findGrants.useQuery(
    {
      companyType,
      industry: primaryIndustry,
      projectType,
      region: derivedRegion,
      fundingMin: derivedFunding.min,
      fundingMax: derivedFunding.max,
    },
    { enabled: showResults }
  );

  const steps = [
    { key: "type", titleDe: "Unternehmenstyp", titleEn: "Company Type" },
    { key: "industry", titleDe: "Branche (Mehrfachauswahl)", titleEn: "Industry (Multi-select)" },
    { key: "project", titleDe: "Projektart", titleEn: "Project Type" },
    { key: "region", titleDe: "Standort (Mehrfachauswahl)", titleEn: "Location (Multi-select)" },
    { key: "funding", titleDe: "Förderhöhe (Mehrfachauswahl)", titleEn: "Funding Amount (Multi-select)" },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setShowResults(true);
  };

  const handleBack = () => {
    if (showResults) setShowResults(false);
    else if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setCompanyType("");
    setIndustries([]);
    setProjectType("");
    setSelectedLocations([]);
    setLocationSearch("");
    setFundingRangeIds([]);
    setShowResults(false);
    setExpandedGrant(null);
  };

  const canProceed = () => {
    if (step === 0) return !!companyType;
    if (step === 1) return industries.length > 0;
    if (step === 2) return !!projectType;
    if (step === 3) return selectedLocations.length > 0;
    if (step === 4) return fundingRangeIds.length > 0;
    return true;
  };

  const formatAmount = (n: number) =>
    n >= 1000000 ? `€${(n / 1000000).toFixed(1)} Mio.` : `€${n.toLocaleString("de-AT")}`;

  // Filtered locations for city search
  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return ALL_LOCATIONS;
    const q = locationSearch.toLowerCase();
    return ALL_LOCATIONS.filter(
      (l) => l.labelDe.toLowerCase().includes(q) || l.labelEn.toLowerCase().includes(q)
    );
  }, [locationSearch]);

  const cardStyle = (selected: boolean) => ({
    border: selected ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
    background: selected ? "rgba(16,185,129,0.06)" : "white",
  });

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
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                  {lang === "de" ? `Schritt ${step + 1} von ${steps.length}` : `Step ${step + 1} of ${steps.length}`}
                </span>
                <h2 className="text-2xl font-black mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                  {lang === "de" ? steps[step].titleDe : steps[step].titleEn}
                </h2>
                {(step === 1 || step === 3 || step === 4) && (
                  <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? "Mehrere Optionen wählbar" : "Multiple options can be selected"}
                  </p>
                )}
              </div>

              {/* Step content */}
              <div className="px-8 py-8">

                {/* Step 0: Company type — single select */}
                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {COMPANY_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCompanyType(t.id)}
                        className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={cardStyle(companyType === t.id)}
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

                {/* Step 1: Industry — MULTI-SELECT */}
                {step === 1 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INDUSTRIES.map((ind) => {
                      const sel = industries.includes(ind.id);
                      return (
                        <button
                          key={ind.id}
                          onClick={() => setIndustries(toggleItem(industries, ind.id))}
                          className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                          style={cardStyle(sel)}
                        >
                          <span className="text-2xl">{ind.icon}</span>
                          <span className="font-semibold text-sm flex-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                            {lang === "de" ? ind.labelDe : ind.labelEn}
                          </span>
                          {sel && <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step 2: Project type — single select */}
                {step === 2 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROJECT_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => setProjectType(pt.id)}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={cardStyle(projectType === pt.id)}
                      >
                        <span className="text-2xl">{pt.icon}</span>
                        <span className="font-semibold text-sm flex-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? pt.labelDe : pt.labelEn}
                        </span>
                        {projectType === pt.id && <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Location — MULTI-SELECT + city search */}
                {step === 3 && (
                  <div>
                    {/* Search box */}
                    <div className="relative mb-4">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.55 0.02 240)" }} />
                      <input
                        type="text"
                        placeholder={lang === "de" ? "Stadt oder Region suchen..." : "Search city or region..."}
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                          border: "2px solid oklch(0.90 0.006 240)",
                          fontFamily: "'Nunito Sans', sans-serif",
                          color: "oklch(0.22 0.07 240)",
                          background: "white",
                        }}
                      />
                      {locationSearch && (
                        <button onClick={() => setLocationSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <X size={14} style={{ color: "oklch(0.55 0.02 240)" }} />
                        </button>
                      )}
                    </div>
                    {/* Selected chips */}
                    {selectedLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedLocations.map((id) => {
                          const loc = ALL_LOCATIONS.find((l) => l.id === id);
                          if (!loc) return null;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                              style={{ background: "oklch(0.70 0.17 162)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              {lang === "de" ? loc.labelDe : loc.labelEn}
                              <button onClick={() => setSelectedLocations(toggleItem(selectedLocations, id))}>
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Location grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                      {filteredLocations.map((loc) => {
                        const sel = selectedLocations.includes(loc.id);
                        return (
                          <button
                            key={loc.id}
                            onClick={() => setSelectedLocations(toggleItem(selectedLocations, loc.id))}
                            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.01]"
                            style={cardStyle(sel)}
                          >
                            <MapPin size={14} style={{ color: sel ? "oklch(0.70 0.17 162)" : "oklch(0.55 0.02 240)", flexShrink: 0 }} />
                            <span className="font-semibold text-sm flex-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                              {lang === "de" ? loc.labelDe : loc.labelEn}
                            </span>
                            {sel && <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                          </button>
                        );
                      })}
                      {filteredLocations.length === 0 && (
                        <div className="col-span-3 text-center py-8" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Keine Ergebnisse" : "No results"}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Funding range — MULTI-SELECT */}
                {step === 4 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FUNDING_RANGES.map((fr) => {
                      const sel = fundingRangeIds.includes(fr.id);
                      return (
                        <button
                          key={fr.id}
                          onClick={() => setFundingRangeIds(toggleItem(fundingRangeIds, fr.id))}
                          className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                          style={cardStyle(sel)}
                        >
                          <Euro size={18} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0 }} />
                          <span className="font-semibold text-sm flex-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                            {lang === "de" ? fr.labelDe : fr.labelEn}
                          </span>
                          {sel && <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />}
                        </button>
                      );
                    })}
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
            /* ─── Results ─────────────────────────────────────────────────── */
            <div>
              {/* Results header */}
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                          {/* Right stats */}
                          <div className="text-right flex-shrink-0 space-y-2">
                            <div>
                              <div className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.70 0.17 162)" }}>
                                {formatAmount(grant.maxAmount)}
                              </div>
                              <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                {lang === "de" ? "max. Förderung" : "max. grant"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-bold" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                {grant.fundingRate}% {lang === "de" ? "Förderquote" : "funding rate"}
                              </div>
                            </div>
                            {/* Success rate badge */}
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                              style={{ background: `${successRateColor(grant.successRate)}18` }}
                            >
                              <Target size={12} style={{ color: successRateColor(grant.successRate) }} />
                              <span className="text-xs font-bold" style={{ color: successRateColor(grant.successRate), fontFamily: "'Nunito Sans', sans-serif" }}>
                                {grant.successRate}% {lang === "de" ? "Erfolgsquote" : "success rate"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedGrant === grant.id && (
                        <div className="px-6 pb-6 pt-0 border-t" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                          <div className="grid sm:grid-cols-4 gap-4 mt-4 mb-5">
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
                            <div className="flex items-center gap-2">
                              <Target size={16} style={{ color: successRateColor(grant.successRate) }} />
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {lang === "de" ? "Erfolgsquote" : "Success Rate"}
                                </div>
                                <div className="text-sm font-bold" style={{ color: successRateColor(grant.successRate), fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {grant.successRate}%
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
                          <div className="flex gap-3 flex-wrap">
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
