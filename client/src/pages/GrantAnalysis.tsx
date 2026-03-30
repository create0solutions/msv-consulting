/**
 * MSV Consulting — KI-Fördercheck Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Conversational AI chat with optional business plan upload
 * Features: BP PDF upload OR free-text input, AI follow-up questions, final analysis report
 * v2: Quick-check disclaimer, in-depth booking CTA, critical innovation evaluation
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Streamdown } from "streamdown";
import {
  Sparkles, Upload, FileText, Send, Bot, User,
  CheckCircle2, AlertCircle, X, ArrowRight, ExternalLink,
  Target, RefreshCw, Info, Calendar, Phone, Mail
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string };

type Grant = {
  id: string;
  name: string;
  nameEn: string;
  provider: string;
  providerUrl: string;
  description: string;
  descriptionEn: string;
  maxAmount: number;
  minAmount: number;
  fundingRate: number;
  successRate: number;
  difficulty: string;
  processingTime: string;
  isRolling: boolean;
  deadline: string | null;
  tags: string[];
};

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatAmount(n: number) {
  return n >= 1000000 ? `€${(n / 1000000).toFixed(1)} Mio.` : `€${n.toLocaleString("de-AT")}`;
}

function successRateColor(rate: number) {
  if (rate >= 65) return "oklch(0.70 0.17 162)";
  if (rate >= 40) return "oklch(0.75 0.15 60)";
  return "oklch(0.65 0.2 25)";
}

// ─── Quick-Check Disclaimer Banner ────────────────────────────────────────────

function QuickCheckBanner({ lang }: { lang: string }) {
  return (
    <div
      className="rounded-2xl p-4 mb-6 flex items-start gap-3"
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
      }}
    >
      <Info size={18} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.75 0.15 60)" }} />
      <div>
        <p className="text-sm font-bold mb-0.5" style={{ color: "oklch(0.50 0.12 60)", fontFamily: "'Outfit', sans-serif" }}>
          {lang === "de" ? "Hinweis: Dies ist ein automatisierter Quick-Check" : "Note: This is an automated Quick-Check"}
        </p>
        <p className="text-xs" style={{ color: "oklch(0.50 0.10 60)", fontFamily: "'Nunito Sans', sans-serif" }}>
          {lang === "de"
            ? "Die KI-Analyse basiert auf allgemeinen Förderkriterien und gibt eine erste Orientierung. Für eine vollständige, rechtssichere Förderberatung mit Antragstellung empfehlen wir eine persönliche In-Depth Analyse mit MSV Consulting."
            : "The AI analysis is based on general grant criteria and provides initial guidance. For a complete, legally sound grant consultation including application support, we recommend a personal In-Depth Analysis with MSV Consulting."}
        </p>
      </div>
    </div>
  );
}

// ─── In-Depth Booking CTA ─────────────────────────────────────────────────────

function InDepthCTA({ lang }: { lang: string }) {
  return (
    <div
      className="mt-8 rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 8px 40px rgba(10,46,82,0.15)" }}
    >
      {/* Header */}
      <div
        className="px-8 pt-8 pb-6"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.07 240) 0%, oklch(0.28 0.09 220) 100%)" }}
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <Sparkles size={12} style={{ color: "oklch(0.70 0.17 162)" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
            {lang === "de" ? "In-Depth Analyse" : "In-Depth Analysis"}
          </span>
        </div>
        <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {lang === "de"
            ? "Bereit für eine professionelle Förderberatung?"
            : "Ready for professional grant consulting?"}
        </h3>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}>
          {lang === "de"
            ? "Der Quick-Check zeigt Ihnen die Richtung. Die In-Depth Analyse mit Maximilian Speiser-Villarroel liefert Ihnen eine vollständige Strategie, Antragsvorbereitung und persönliche Begleitung."
            : "The Quick-Check shows you the direction. The In-Depth Analysis with Maximilian Speiser-Villarroel delivers a complete strategy, application preparation, and personal guidance."}
        </p>
      </div>

      {/* What's included */}
      <div className="bg-white px-8 py-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
          {lang === "de" ? "Was die In-Depth Analyse beinhaltet:" : "What the In-Depth Analysis includes:"}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { de: "Vollständige Förderrecherche (national + EU)", en: "Complete grant research (national + EU)" },
            { de: "Detaillierte Innovationsbewertung & Positionierung", en: "Detailed innovation assessment & positioning" },
            { de: "Antragsvorbereitung & Dokumenten-Checkliste", en: "Application preparation & document checklist" },
            { de: "Persönliches Beratungsgespräch (60 Min.)", en: "Personal consultation session (60 min.)" },
            { de: "Realistische Erfolgsquoten-Einschätzung", en: "Realistic success rate assessment" },
            { de: "Begleitung bis zur Einreichung", en: "Support through to submission" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.70 0.17 162)" }} />
              <span className="text-sm" style={{ color: "oklch(0.30 0.04 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                {lang === "de" ? item.de : item.en}
              </span>
            </div>
          ))}
        </div>

        {/* Contact options */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:Create0solutions@gmail.com?subject=In-Depth Förderanalyse Anfrage"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
            style={{ background: "oklch(0.70 0.17 162)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <Mail size={16} />
            {lang === "de" ? "In-Depth Analyse anfragen" : "Request In-Depth Analysis"}
          </a>
          <a
            href="tel:+436705555216"
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-80"
            style={{
              background: "white",
              border: "2px solid oklch(0.88 0.006 240)",
              color: "oklch(0.22 0.07 240)",
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            <Phone size={16} />
            +43 670 555 5216
          </a>
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
          {lang === "de"
            ? "Erstes Gespräch kostenlos & unverbindlich · Wien, Österreich"
            : "First consultation free & non-binding · Vienna, Austria"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GrantAnalysis() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalAnalysis, setIsFinalAnalysis] = useState(false);
  const [matchedGrants, setMatchedGrants] = useState<Grant[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const conversationalIntake = trpc.grants.conversationalIntake.useMutation();
  const uploadBP = trpc.upload.uploadBusinessPlan.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = "auto";
      chatTextareaRef.current.style.height = `${Math.min(chatTextareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Upload file to S3
  const handleFileUpload = async (file: File) => {
    if (file.size > 16 * 1024 * 1024) {
      setUploadError(lang === "de" ? "Datei zu groß (max. 16 MB)" : "File too large (max. 16 MB)");
      return;
    }
    if (!file.type.includes("pdf")) {
      setUploadError(lang === "de" ? "Nur PDF-Dateien erlaubt" : "Only PDF files are allowed");
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const result = await uploadBP.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          mimeType: "application/pdf",
        });
        setUploadedFileUrl(result.url);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError(lang === "de" ? "Upload fehlgeschlagen. Bitte erneut versuchen." : "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { setUploadedFile(file); handleFileUpload(file); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); handleFileUpload(file); }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Start conversation
  const handleStart = async () => {
    if (!inputText.trim() && !uploadedFile) return;
    setStarted(true);

    let userMsg = inputText.trim();
    if (!userMsg && uploadedFile) {
      userMsg = lang === "de"
        ? `Ich habe meinen Businessplan hochgeladen. Bitte analysiere ihn und sage mir, welche Förderungen für mein Unternehmen in Frage kommen.`
        : `I have uploaded my business plan. Please analyze it and tell me which grants are suitable for my company.`;
    }

    const newMessages: Message[] = [{ role: "user", content: userMsg }];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await conversationalIntake.mutateAsync({
        conversationHistory: newMessages,
        businessPlanUrl: uploadedFileUrl ?? undefined,
      });
      const updatedMessages: Message[] = [...newMessages, { role: "assistant", content: result.reply }];
      setMessages(updatedMessages);
      if (result.isFinalAnalysis) {
        setIsFinalAnalysis(true);
        setMatchedGrants(result.matchedGrants as Grant[]);
      }
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: lang === "de" ? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." : "An error occurred. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Continue conversation
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await conversationalIntake.mutateAsync({
        conversationHistory: newMessages,
        businessPlanUrl: uploadedFileUrl ?? undefined,
      });
      const updatedMessages: Message[] = [...newMessages, { role: "assistant", content: result.reply }];
      setMessages(updatedMessages);
      if (result.isFinalAnalysis) {
        setIsFinalAnalysis(true);
        setMatchedGrants(result.matchedGrants as Grant[]);
      }
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: lang === "de" ? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." : "An error occurred. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInputText("");
    setIsLoading(false);
    setIsFinalAnalysis(false);
    setMatchedGrants([]);
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setUploadError(null);
    setStarted(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (started) handleSend();
      else handleStart();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.004 240)" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.07 240) 0%, oklch(0.30 0.08 220) 100%)" }}
      >
        <div className="container relative z-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <Sparkles size={14} style={{ color: "oklch(0.70 0.17 162)" }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {lang === "de" ? "KI-Förderberater · Quick-Check" : "AI Grant Advisor · Quick-Check"}
            </span>
          </div>
          <h1
            className="text-4xl lg:text-6xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {lang === "de" ? "Ihr persönlicher KI-Förderberater" : "Your Personal AI Grant Advisor"}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-6"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            {lang === "de"
              ? "Laden Sie Ihren Businessplan hoch oder beschreiben Sie Ihr Unternehmen. Die KI bewertet kritisch Ihren Innovationsgrad und Ihre Förderfähigkeit."
              : "Upload your business plan or describe your company. The AI critically evaluates your innovation level and funding eligibility."}
          </p>

          {/* Quick-check badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <Info size={14} style={{ color: "oklch(0.80 0.15 60)" }} />
            <span className="text-xs font-semibold" style={{ color: "oklch(0.85 0.12 60)", fontFamily: "'Nunito Sans', sans-serif" }}>
              {lang === "de"
                ? "Quick-Check: Erste Orientierung in wenigen Minuten — für eine vollständige Analyse empfehlen wir ein persönliches Gespräch"
                : "Quick-Check: First orientation in minutes — for a complete analysis we recommend a personal consultation"}
            </span>
          </div>

          {/* How it works */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: "📄", textDe: "BP hochladen oder beschreiben", textEn: "Upload BP or describe" },
              { icon: "🔍", textDe: "KI bewertet kritisch", textEn: "AI evaluates critically" },
              { icon: "📊", textDe: "Ehrliche Analyse erhalten", textEn: "Receive honest analysis" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <span>{step.icon}</span>
                  <span
                    className="text-xs font-semibold text-white"
                    style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {lang === "de" ? step.textDe : step.textEn}
                  </span>
                </div>
                {i < 2 && <ArrowRight size={14} style={{ color: "rgba(255,255,255,0.4)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container max-w-4xl">

          {/* Quick-check disclaimer — always visible */}
          <QuickCheckBanner lang={lang} />

          {!started ? (
            /* ─── Intake screen ────────────────────────────────────────────── */
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}
            >
              <div className="p-8">
                <h2
                  className="text-2xl font-black mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}
                >
                  {lang === "de" ? "Wie möchten Sie beginnen?" : "How would you like to start?"}
                </h2>
                <p
                  className="text-sm mb-8"
                  style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {lang === "de"
                    ? "Laden Sie Ihren Businessplan hoch ODER beschreiben Sie Ihr Unternehmen in eigenen Worten. Die KI wird kritische Fragen stellen — insbesondere zum innovativen Charakter Ihrer Lösung."
                    : "Upload your business plan OR describe your company in your own words. The AI will ask critical questions — especially about the innovative character of your solution."}
                </p>

                {/* Option A: Upload BP */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      A
                    </div>
                    <span
                      className="font-bold text-sm"
                      style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}
                    >
                      {lang === "de"
                        ? "Businessplan hochladen (PDF, max. 16 MB)"
                        : "Upload Business Plan (PDF, max. 16 MB)"}
                    </span>
                  </div>
                  <div
                    className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: uploadedFile ? "oklch(0.70 0.17 162)" : "oklch(0.85 0.006 240)",
                      background: uploadedFile ? "rgba(16,185,129,0.04)" : "oklch(0.98 0.002 240)",
                    }}
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => !uploadedFile && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 animate-spin"
                          style={{ borderColor: "oklch(0.70 0.17 162)", borderTopColor: "transparent" }}
                        />
                        <span className="text-sm" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Wird hochgeladen..." : "Uploading..."}
                        </span>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 size={24} style={{ color: "oklch(0.70 0.17 162)" }} />
                        <div className="text-left">
                          <div className="font-semibold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                            {uploadedFile.name}
                          </div>
                          <div className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                            {uploadedFileUrl
                              ? (lang === "de" ? "✓ Erfolgreich hochgeladen" : "✓ Successfully uploaded")
                              : (lang === "de" ? "Wird hochgeladen..." : "Uploading...")}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(); }}
                          className="ml-auto p-1 rounded-full hover:bg-red-50"
                        >
                          <X size={16} style={{ color: "oklch(0.65 0.2 25)" }} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} style={{ color: "oklch(0.75 0.006 240)" }} />
                        <span className="font-semibold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.45 0.02 240)" }}>
                          {lang === "de" ? "PDF hierher ziehen oder klicken zum Hochladen" : "Drag PDF here or click to upload"}
                        </span>
                        <span className="text-xs" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? "Businessplan, Pitch Deck, Finanzplan..." : "Business plan, pitch deck, financial plan..."}
                        </span>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "oklch(0.65 0.2 25)", fontFamily: "'Nunito Sans', sans-serif" }}>
                      <AlertCircle size={14} />
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: "oklch(0.90 0.006 240)" }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? "ODER" : "OR"}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "oklch(0.90 0.006 240)" }} />
                </div>

                {/* Option B: Free text */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "oklch(0.22 0.07 240)" }}
                    >
                      B
                    </div>
                    <span className="font-bold text-sm" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                      {lang === "de" ? "Unternehmen beschreiben" : "Describe your company"}
                    </span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      lang === "de"
                        ? "Beschreiben Sie Ihr Unternehmen, Ihre Idee oder Ihr Projekt so ausführlich wie möglich. Besonders wichtig: Was ist das Innovative an Ihrer Lösung? Was können Sie, das andere nicht können? Branche, Phase, Standort, Mitarbeiterzahl, geplante Vorhaben..."
                        : "Describe your company, idea or project as thoroughly as possible. Most important: What is innovative about your solution? What can you do that others cannot? Industry, stage, location, employees, planned projects..."
                    }
                    className="w-full p-4 rounded-2xl text-sm resize-none outline-none transition-all duration-200"
                    style={{
                      border: "2px solid oklch(0.88 0.006 240)",
                      fontFamily: "'Nunito Sans', sans-serif",
                      color: "oklch(0.22 0.07 240)",
                      background: "oklch(0.98 0.002 240)",
                      minHeight: 160,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "oklch(0.70 0.17 162)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "oklch(0.88 0.006 240)"; }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de"
                      ? "Tipp: Je mehr Details Sie angeben, desto präziser und kritischer kann die KI Ihre Förderfähigkeit einschätzen."
                      : "Tip: The more details you provide, the more precisely the AI can assess your funding eligibility."}
                  </p>
                </div>

                {/* Start button */}
                <button
                  onClick={handleStart}
                  disabled={(!inputText.trim() && !uploadedFile) || isUploading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                  style={{
                    background: "oklch(0.70 0.17 162)",
                    fontFamily: "'Nunito Sans', sans-serif",
                    fontSize: "1rem",
                  }}
                >
                  <Sparkles size={18} />
                  {lang === "de" ? "Quick-Check starten" : "Start Quick-Check"}
                </button>
              </div>

              {/* Bottom: In-depth teaser */}
              <div
                className="px-8 py-5 flex items-center gap-4"
                style={{ background: "oklch(0.97 0.004 240)", borderTop: "1px solid oklch(0.92 0.006 240)" }}
              >
                <Calendar size={18} className="flex-shrink-0" style={{ color: "oklch(0.70 0.17 162)" }} />
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? "Lieber direkt eine In-Depth Analyse?" : "Prefer a direct In-Depth Analysis?"}
                  </p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de"
                      ? "Persönliche Beratung mit Maximilian Speiser-Villarroel — erstes Gespräch kostenlos."
                      : "Personal consultation with Maximilian Speiser-Villarroel — first call free."}
                  </p>
                </div>
                <a
                  href="mailto:Create0solutions@gmail.com?subject=In-Depth Förderanalyse Anfrage"
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 hover:opacity-90"
                  style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {lang === "de" ? "Anfragen" : "Inquire"}
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ) : (
            /* ─── Chat screen ──────────────────────────────────────────────── */
            <div>
              {/* Chat window */}
              <div
                className="bg-white rounded-3xl overflow-hidden mb-4"
                style={{ boxShadow: "0 8px 48px rgba(10,46,82,0.12)" }}
              >
                {/* Chat header */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ background: "oklch(0.22 0.07 240)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        MSV KI-Förderberater
                      </div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {isFinalAnalysis
                          ? (lang === "de" ? "✓ Quick-Check abgeschlossen" : "✓ Quick-Check complete")
                          : (lang === "de" ? "Analysiert Ihr Unternehmen..." : "Analyzing your company...")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    <RefreshCw size={12} />
                    {lang === "de" ? "Neu starten" : "Start Over"}
                  </button>
                </div>

                {/* Messages */}
                <div className="p-6 space-y-6" style={{ minHeight: 300, maxHeight: 600, overflowY: "auto" }}>
                  {/* Uploaded file indicator */}
                  {uploadedFile && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
                      style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <FileText size={14} style={{ color: "oklch(0.70 0.17 162)" }} />
                      <span className="text-xs font-semibold" style={{ color: "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}>
                        {uploadedFile.name}
                      </span>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: msg.role === "user" ? "oklch(0.22 0.07 240)" : "oklch(0.70 0.17 162)" }}
                      >
                        {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                      </div>
                      <div
                        className="rounded-2xl px-5 py-4 max-w-[85%]"
                        style={{
                          background: msg.role === "user" ? "oklch(0.22 0.07 240)" : "oklch(0.97 0.004 240)",
                          border: msg.role === "assistant" ? "1px solid oklch(0.90 0.006 240)" : "none",
                        }}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none" style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="text-sm text-white" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.70 0.17 162)" }}>
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="rounded-2xl px-5 py-4" style={{ background: "oklch(0.97 0.004 240)", border: "1px solid oklch(0.90 0.006 240)" }}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-bounce"
                                style={{ background: "oklch(0.70 0.17 162)", animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                            {lang === "de" ? "KI analysiert kritisch..." : "AI analyzing critically..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: "oklch(0.92 0.006 240)" }}>
                  {isFinalAnalysis && (
                    <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                      {lang === "de"
                        ? "Haben Sie noch Fragen zur Analyse? Stellen Sie sie hier:"
                        : "Have questions about the analysis? Ask them here:"}
                    </p>
                  )}
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={chatTextareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isFinalAnalysis
                          ? (lang === "de" ? "Weitere Fragen zur Förderanalyse..." : "Further questions about the analysis...")
                          : (lang === "de" ? "Ihre Antwort... (Enter zum Senden)" : "Your reply... (Enter to send)")
                      }
                      disabled={isLoading}
                      className="flex-1 p-3 rounded-xl text-sm resize-none outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        border: "2px solid oklch(0.88 0.006 240)",
                        fontFamily: "'Nunito Sans', sans-serif",
                        color: "oklch(0.22 0.07 240)",
                        background: "oklch(0.98 0.002 240)",
                        minHeight: 48,
                        maxHeight: 160,
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "oklch(0.70 0.17 162)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "oklch(0.88 0.006 240)"; }}
                      rows={1}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || isLoading}
                      className="p-3 rounded-xl flex-shrink-0 transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      <Send size={18} className="text-white" />
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                    {lang === "de" ? "Shift+Enter für neue Zeile" : "Shift+Enter for new line"}
                  </p>
                </div>
              </div>

              {/* Matched grants after final analysis */}
              {isFinalAnalysis && matchedGrants.length > 0 && (
                <div>
                  <h3 className="text-xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                    {lang === "de" ? "🎯 Passende Förderungen für Sie" : "🎯 Matching Grants for You"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {matchedGrants.map((grant) => (
                      <div
                        key={grant.id}
                        className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
                        style={{ boxShadow: "0 4px 16px rgba(10,46,82,0.08)", border: "1px solid oklch(0.92 0.006 240)" }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                          >
                            {grant.provider}
                          </span>
                          <div className="flex items-center gap-1" style={{ color: successRateColor(grant.successRate) }}>
                            <Target size={12} />
                            <span className="text-xs font-bold" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                              {grant.successRate}% {lang === "de" ? "Ø Erfolg" : "Ø success"}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-black text-sm mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}>
                          {lang === "de" ? grant.name : grant.nameEn}
                        </h4>
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                          {lang === "de" ? grant.description : grant.descriptionEn}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center">
                            <div className="text-sm font-black" style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Outfit', sans-serif" }}>
                              {formatAmount(grant.maxAmount)}
                            </div>
                            <div className="text-xs" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>max.</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-black" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Outfit', sans-serif" }}>
                              {grant.fundingRate}%
                            </div>
                            <div className="text-xs" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {lang === "de" ? "Quote" : "Rate"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-black" style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Outfit', sans-serif" }}>
                              {grant.processingTime.split("-")[0]}
                            </div>
                            <div className="text-xs" style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}>
                              {lang === "de" ? "Wochen" : "Weeks"}
                            </div>
                          </div>
                        </div>
                        <a
                          href={grant.providerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
                          style={{ background: "oklch(0.22 0.07 240)", color: "white", fontFamily: "'Nunito Sans', sans-serif" }}
                        >
                          <ExternalLink size={12} />
                          {lang === "de" ? "Zur Förderstelle" : "Visit Funder"}
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* In-Depth Booking CTA */}
                  <InDepthCTA lang={lang} />
                </div>
              )}

              {/* Show In-Depth CTA even if no matched grants, once analysis is done */}
              {isFinalAnalysis && matchedGrants.length === 0 && (
                <InDepthCTA lang={lang} />
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
