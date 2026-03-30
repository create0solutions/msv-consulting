/* MSV Consulting - AI Grant Analysis Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Multi-step form + AI analysis output + follow-up chat
 * Features: Company info, document upload, AI analysis, follow-up Q&A
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Streamdown } from "streamdown";
import {
  Sparkles, Upload, Building2, Users, TrendingUp, FileText,
  Send, ChevronRight, ChevronLeft, CheckCircle2, Loader2,
  MessageSquare, X, RefreshCw, ArrowRight, Euro, Clock
} from "lucide-react";

type ConversationMessage = { role: "user" | "assistant"; content: string };

const STAGES = [
  { id: "pre-seed", labelDe: "Pre-Seed (Idee/Konzept)", labelEn: "Pre-Seed (Idea/Concept)" },
  { id: "seed", labelDe: "Seed (Frühphase)", labelEn: "Seed (Early Stage)" },
  { id: "series-a", labelDe: "Series A (Wachstum)", labelEn: "Series A (Growth)" },
  { id: "growth", labelDe: "Wachstumsphase", labelEn: "Growth Stage" },
  { id: "established", labelDe: "Etabliertes Unternehmen", labelEn: "Established Company" },
];

const INDUSTRIES_LIST = [
  "Technologie & Software", "KI / Artificial Intelligence", "Green Tech & Nachhaltigkeit",
  "Gesundheit & Life Sciences", "Fintech", "E-Commerce & Retail", "Produktion & Industrie",
  "Medien & Kreativwirtschaft", "Bildung & EdTech", "Mobilität & Transport",
  "Agritech & Food", "Dienstleistungen", "Sonstige",
];

export default function GrantAnalysis() {
  const { lang } = useLanguage();
  const [formStep, setFormStep] = useState(0);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [companyContext, setCompanyContext] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    stage: "",
    description: "",
    projectDescription: "",
    employees: "",
    revenue: "",
    location: "Wien",
    previousGrants: "",
  });

  const analysisMutation = trpc.grants.analyzeCompany.useMutation();
  const chatMutation = trpc.grants.chatFollowUp.useMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, analysisMutation.data]);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep = () => {
    if (formStep === 0) return form.companyName.trim() && form.industry && form.stage;
    if (formStep === 1) return form.description.trim().length >= 30;
    return true;
  };

  const handleStartAnalysis = async () => {
    setAnalysisStarted(true);
    const ctx = `${form.companyName} | ${form.industry} | ${form.stage} | ${form.location}`;
    setCompanyContext(ctx);
    await analysisMutation.mutateAsync({
      companyName: form.companyName,
      industry: form.industry,
      stage: form.stage,
      description: form.description,
      projectDescription: form.projectDescription,
      employees: form.employees ? parseInt(form.employees) : undefined,
      revenue: form.revenue,
      location: form.location,
      previousGrants: form.previousGrants,
    });
    setAnalysisComplete(true);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatMutation.isPending) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory: ConversationMessage[] = [...conversation, { role: "user", content: userMsg }];
    setConversation(newHistory);

    const result = await chatMutation.mutateAsync({
      userMessage: userMsg,
      conversationHistory: newHistory,
      companyContext,
    });
    setConversation([...newHistory, { role: "assistant", content: String(result.reply ?? "") }]);
  };

  const formatAmount = (n: number) =>
    n >= 1000000 ? `€${(n / 1000000).toFixed(1)} Mio.` : `€${n.toLocaleString("de-AT")}`;

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border focus:ring-2 focus:ring-emerald-400";
  const inputStyle = { fontFamily: "'Nunito Sans', sans-serif", borderColor: "oklch(0.88 0.006 240)", color: "oklch(0.22 0.07 240)" };

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
            <Sparkles size={14} style={{ color: "oklch(0.70 0.17 162)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
              {lang === "de" ? "KI-Förderanalyse" : "AI Grant Analysis"}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {lang === "de" ? "Ihr persönlicher KI-Förderberater" : "Your Personal AI Grant Advisor"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}>
            {lang === "de"
              ? "Beschreiben Sie Ihr Unternehmen und erhalten Sie eine detaillierte KI-Analyse Ihrer Förderfähigkeit — inklusive konkreter Empfehlungen und Fristen."
              : "Describe your company and receive a detailed AI analysis of your funding eligibility — including concrete recommendations and deadlines."}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          {!analysisStarted ? (
            /* ─── Form ─────────────────────────────────────────────────── */
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}>
              {/* Progress */}
              <div className="h-1.5" style={{ background: "oklch(0.92 0.006 240)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${((formStep + 1) / 3) * 100}%`, background: "oklch(0.70 0.17 162)" }}
                />
              </div>

              <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                  {lang === "de" ? `Schritt ${formStep + 1} von 3` : `Step ${formStep + 1} of 3`}
                </span>
                <h2 className="text-2xl font-black mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                  {formStep === 0 && (lang === "de" ? "Grundinformationen" : "Basic Information")}
                  {formStep === 1 && (lang === "de" ? "Unternehmensbeschreibung" : "Company Description")}
                  {formStep === 2 && (lang === "de" ? "Zusätzliche Details (optional)" : "Additional Details (optional)")}
                </h2>
              </div>

              <div className="px-8 py-8 space-y-5">
                {/* Step 0: Basic info */}
                {formStep === 0 && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Unternehmensname *" : "Company Name *"}
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        style={inputStyle}
                        value={form.companyName}
                        onChange={(e) => handleFormChange("companyName", e.target.value)}
                        placeholder={lang === "de" ? "z.B. TechVision GmbH" : "e.g. TechVision GmbH"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Branche *" : "Industry *"}
                      </label>
                      <select
                        className={inputClass}
                        style={inputStyle}
                        value={form.industry}
                        onChange={(e) => handleFormChange("industry", e.target.value)}
                      >
                        <option value="">{lang === "de" ? "Branche wählen..." : "Select industry..."}</option>
                        {INDUSTRIES_LIST.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Unternehmensphase *" : "Company Stage *"}
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {STAGES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleFormChange("stage", s.id)}
                            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                            style={{
                              border: form.stage === s.id ? "2px solid oklch(0.70 0.17 162)" : "2px solid oklch(0.90 0.006 240)",
                              background: form.stage === s.id ? "rgba(16,185,129,0.06)" : "white",
                            }}
                          >
                            <span className="text-sm font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                              {lang === "de" ? s.labelDe : s.labelEn}
                            </span>
                            {form.stage === s.id && <CheckCircle2 size={16} className="ml-auto" style={{ color: "oklch(0.70 0.17 162)" }} />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Standort" : "Location"}
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          style={inputStyle}
                          value={form.location}
                          onChange={(e) => handleFormChange("location", e.target.value)}
                          placeholder="Wien"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Mitarbeiteranzahl" : "Number of Employees"}
                        </label>
                        <input
                          type="number"
                          className={inputClass}
                          style={inputStyle}
                          value={form.employees}
                          onChange={(e) => handleFormChange("employees", e.target.value)}
                          placeholder="z.B. 5"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 1: Description */}
                {formStep === 1 && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Unternehmensbeschreibung *" : "Company Description *"}
                      </label>
                      <p className="text-xs mb-3" style={{ color: "oklch(0.60 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de"
                          ? "Beschreiben Sie Ihr Unternehmen, Ihr Produkt/Ihre Dienstleistung, Ihre Zielgruppe und Ihren Wettbewerbsvorteil. Je mehr Details, desto besser die Analyse."
                          : "Describe your company, product/service, target audience, and competitive advantage. The more details, the better the analysis."}
                      </p>
                      <textarea
                        className={inputClass}
                        style={{ ...inputStyle, resize: "none" }}
                        rows={6}
                        value={form.description}
                        onChange={(e) => handleFormChange("description", e.target.value)}
                        placeholder={lang === "de"
                          ? "z.B. Wir entwickeln eine KI-gestützte Plattform für die Automatisierung von Buchhaltungsprozessen für KMUs. Unsere Software reduziert den Zeitaufwand für Buchhaltung um 70%..."
                          : "e.g. We develop an AI-powered platform for automating accounting processes for SMEs. Our software reduces accounting time by 70%..."}
                      />
                      <div className="text-xs mt-1" style={{ color: form.description.length < 30 ? "oklch(0.65 0.15 25)" : "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {form.description.length} {lang === "de" ? "Zeichen (min. 30)" : "characters (min. 30)"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Geplantes Projekt / Vorhaben (optional)" : "Planned Project / Initiative (optional)"}
                      </label>
                      <textarea
                        className={inputClass}
                        style={{ ...inputStyle, resize: "none" }}
                        rows={4}
                        value={form.projectDescription}
                        onChange={(e) => handleFormChange("projectDescription", e.target.value)}
                        placeholder={lang === "de"
                          ? "z.B. Wir planen die Entwicklung eines neuen KI-Moduls für die automatische Steueroptimierung..."
                          : "e.g. We plan to develop a new AI module for automatic tax optimization..."}
                      />
                    </div>
                  </>
                )}

                {/* Step 2: Optional details */}
                {formStep === 2 && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Jahresumsatz (optional)" : "Annual Revenue (optional)"}
                      </label>
                      <select
                        className={inputClass}
                        style={inputStyle}
                        value={form.revenue}
                        onChange={(e) => handleFormChange("revenue", e.target.value)}
                      >
                        <option value="">{lang === "de" ? "Umsatz wählen..." : "Select revenue..."}</option>
                        <option value="pre-revenue">{lang === "de" ? "Noch kein Umsatz" : "Pre-revenue"}</option>
                        <option value="<100k">{lang === "de" ? "Unter €100.000" : "Under €100,000"}</option>
                        <option value="100k-500k">€100.000 – €500.000</option>
                        <option value="500k-2m">€500.000 – €2 Mio.</option>
                        <option value="2m-10m">€2 Mio. – €10 Mio.</option>
                        <option value=">10m">{lang === "de" ? "Über €10 Mio." : "Over €10M"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {lang === "de" ? "Bisherige Förderungen (optional)" : "Previous Grants (optional)"}
                      </label>
                      <textarea
                        className={inputClass}
                        style={{ ...inputStyle, resize: "none" }}
                        rows={3}
                        value={form.previousGrants}
                        onChange={(e) => handleFormChange("previousGrants", e.target.value)}
                        placeholder={lang === "de"
                          ? "z.B. AWS Gründerfonds 2023 (€50.000), FFG Basisprogramm 2024 (€200.000)"
                          : "e.g. AWS Founder Fund 2023 (€50,000), FFG Base Programme 2024 (€200,000)"}
                      />
                    </div>
                    <div
                      className="p-5 rounded-2xl"
                      style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles size={18} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div className="font-bold text-sm mb-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                            {lang === "de" ? "KI-Analyse bereit" : "AI Analysis Ready"}
                          </div>
                          <p className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                            {lang === "de"
                              ? "Die KI analysiert Ihr Unternehmen anhand von 15+ österreichischen und EU-Förderprogrammen und erstellt einen detaillierten Bericht mit konkreten Empfehlungen."
                              : "The AI analyzes your company against 15+ Austrian and EU funding programs and creates a detailed report with concrete recommendations."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="px-8 pb-8 flex items-center justify-between">
                <button
                  onClick={() => formStep > 0 && setFormStep(formStep - 1)}
                  disabled={formStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30"
                  style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.45 0.02 240)" }}
                >
                  <ChevronLeft size={16} />
                  {lang === "de" ? "Zurück" : "Back"}
                </button>
                {formStep < 2 ? (
                  <button
                    onClick={() => setFormStep(formStep + 1)}
                    disabled={!canProceedStep()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                    style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {lang === "de" ? "Weiter" : "Continue"}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleStartAnalysis}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90"
                    style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    <Sparkles size={16} />
                    {lang === "de" ? "KI-Analyse starten" : "Start AI Analysis"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ─── Analysis Results ─────────────────────────────────────── */
            <div className="space-y-6">
              {/* Loading state */}
              {analysisMutation.isPending && (
                <div className="bg-white rounded-3xl p-12 text-center" style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}>
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin"
                      style={{ borderColor: "oklch(0.70 0.17 162)", borderTopColor: "transparent" }} />
                    <Sparkles size={24} className="absolute inset-0 m-auto" style={{ color: "oklch(0.70 0.17 162)" }} />
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                    {lang === "de" ? "KI analysiert Ihr Unternehmen..." : "AI is analyzing your company..."}
                  </h3>
                  <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de"
                      ? "Wir prüfen Ihre Förderfähigkeit gegen 15+ Programme. Das dauert ca. 30 Sekunden."
                      : "We're checking your eligibility against 15+ programs. This takes about 30 seconds."}
                  </p>
                </div>
              )}

              {/* Analysis result */}
              {analysisMutation.data && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                        {lang === "de" ? "Ihre Förderanalyse" : "Your Grant Analysis"}
                      </h2>
                      <p className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {form.companyName} · {form.industry}
                      </p>
                    </div>
                    <button
                      onClick={() => { setAnalysisStarted(false); setAnalysisComplete(false); setConversation([]); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
                      style={{ background: "white", border: "1px solid oklch(0.88 0.006 240)", color: "oklch(0.45 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      <RefreshCw size={14} />
                      {lang === "de" ? "Neu analysieren" : "New Analysis"}
                    </button>
                  </div>

                  {/* AI Analysis Report */}
                  <div className="bg-white rounded-3xl p-8" style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "oklch(0.22 0.07 240)" }}>
                        <Sparkles size={18} style={{ color: "oklch(0.70 0.17 162)" }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          MSV Consulting KI-Förderberater
                        </div>
                        <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Analyse basierend auf aktuellen Förderprogrammen 2025/2026" : "Analysis based on current funding programs 2025/2026"}
                        </div>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                      <Streamdown>{String(analysisMutation.data.analysis ?? "")}</Streamdown>
                    </div>
                  </div>

                  {/* Matched grants quick view */}
                  {analysisMutation.data.matchedGrants.length > 0 && (
                    <div>
                      <h3 className="text-lg font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                        {lang === "de" ? "Passende Förderungen auf einen Blick" : "Matching Grants at a Glance"}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {analysisMutation.data.matchedGrants.slice(0, 4).map((grant) => (
                          <div key={grant.id} className="bg-white rounded-2xl p-5"
                            style={{ boxShadow: "0 4px 16px rgba(10,46,82,0.08)", border: "1px solid oklch(0.92 0.006 240)" }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}>
                                {grant.provider}
                              </span>
                              {grant.isRolling ? (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ background: "rgba(16,185,129,0.1)", color: "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  <Clock size={9} /> {lang === "de" ? "Laufend" : "Rolling"}
                                </span>
                              ) : grant.deadline ? (
                                <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.15 60)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                  {new Date(grant.deadline).toLocaleDateString("de-AT")}
                                </span>
                              ) : null}
                            </div>
                            <div className="font-bold text-sm mb-1" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                              {lang === "de" ? grant.name : grant.nameEn}
                            </div>
                            <div className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.70 0.17 162)" }}>
                              {formatAmount(grant.maxAmount)}
                            </div>
                            <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {grant.fundingRate}% {lang === "de" ? "Förderquote" : "funding rate"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <a href="/foerderungen"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                          style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Alle Förderungen durchsuchen" : "Browse All Grants"}
                          <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Follow-up chat */}
                  <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}>
                    <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                      <MessageSquare size={18} style={{ color: "oklch(0.70 0.17 162)" }} />
                      <div>
                        <div className="font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? "Haben Sie weitere Fragen?" : "Have more questions?"}
                        </div>
                        <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Stellen Sie dem KI-Berater Folgefragen zu Ihrer Analyse" : "Ask the AI advisor follow-up questions about your analysis"}
                        </div>
                      </div>
                    </div>

                    {/* Suggested questions */}
                    {conversation.length === 0 && (
                      <div className="px-6 py-4 flex flex-wrap gap-2">
                        {[
                          lang === "de" ? "Welche Unterlagen brauche ich für den FFG-Antrag?" : "What documents do I need for the FFG application?",
                          lang === "de" ? "Wie lange dauert die Antragstellung?" : "How long does the application process take?",
                          lang === "de" ? "Kann ich mehrere Förderungen gleichzeitig beantragen?" : "Can I apply for multiple grants simultaneously?",
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => { setChatInput(q); }}
                            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80"
                            style={{ background: "oklch(0.94 0.006 240)", color: "oklch(0.45 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat messages */}
                    {conversation.length > 0 && (
                      <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
                        {conversation.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm"
                              style={{
                                background: msg.role === "user" ? "oklch(0.22 0.07 240)" : "oklch(0.94 0.006 240)",
                                color: msg.role === "user" ? "white" : "oklch(0.22 0.07 240)",
                                fontFamily: "'Nunito Sans', sans-serif",
                              }}
                            >
                              {msg.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none">
                                  <Streamdown>{msg.content}</Streamdown>
                                </div>
                              ) : msg.content}
                            </div>
                          </div>
                        ))}
                        {chatMutation.isPending && (
                          <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
                              style={{ background: "oklch(0.94 0.006 240)" }}>
                              <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.70 0.17 162)" }} />
                              <span className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                                {lang === "de" ? "KI antwortet..." : "AI is responding..."}
                              </span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}

                    {/* Chat input */}
                    <div className="px-6 py-4 border-t" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-emerald-400"
                          style={{ fontFamily: "'Nunito Sans', sans-serif", borderColor: "oklch(0.88 0.006 240)" }}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                          placeholder={lang === "de" ? "Frage stellen..." : "Ask a question..."}
                        />
                        <button
                          onClick={handleChatSend}
                          disabled={!chatInput.trim() || chatMutation.isPending}
                          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                          style={{ background: "oklch(0.70 0.17 162)" }}
                        >
                          <Send size={16} style={{ color: "white" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CTA to contact */}
                  <div
                    className="p-8 rounded-2xl text-center"
                    style={{ background: "linear-gradient(135deg, oklch(0.22 0.07 240), oklch(0.30 0.08 220))" }}
                  >
                    <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {lang === "de" ? "Bereit für den nächsten Schritt?" : "Ready for the next step?"}
                    </h3>
                    <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}>
                      {lang === "de"
                        ? "Maximilian begleitet Sie persönlich durch den gesamten Antragsprozess — von der Vorbereitung bis zur Einreichung."
                        : "Maximilian personally guides you through the entire application process — from preparation to submission."}
                    </p>
                    <a
                      href="/#contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                      style={{ background: "oklch(0.70 0.17 162)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {lang === "de" ? "Kostenloses Erstgespräch buchen" : "Book Free Initial Consultation"}
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
