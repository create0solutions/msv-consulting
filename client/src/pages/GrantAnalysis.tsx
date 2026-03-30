/* MSV Consulting - KI Förderberater Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Conversational AI chat with optional business plan upload
 * Features: BP PDF upload OR free-text input, AI follow-up questions, final analysis report
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
  Target, RefreshCw
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
              {lang === "de" ? "KI-Förderberater" : "AI Grant Advisor"}
            </span>
          </div>
          <h1
            className="text-4xl lg:text-6xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {lang === "de" ? "Ihr persönlicher KI-Förderberater" : "Your Personal AI Grant Advisor"}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            {lang === "de"
              ? "Laden Sie Ihren Businessplan hoch oder beschreiben Sie Ihr Unternehmen. Die KI stellt gezielte Fragen und erstellt eine umfassende Förderanalyse."
              : "Upload your business plan or describe your company. The AI asks targeted questions and creates a comprehensive funding analysis."}
          </p>
          {/* How it works */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: "📄", textDe: "BP hochladen oder beschreiben", textEn: "Upload BP or describe" },
              { icon: "🤖", textDe: "KI stellt Fragen", textEn: "AI asks questions" },
              { icon: "📊", textDe: "Analyse erhalten", textEn: "Receive analysis" },
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
                    ? "Laden Sie Ihren Businessplan hoch ODER beschreiben Sie Ihr Unternehmen in eigenen Worten. Beides ist möglich."
                    : "Upload your business plan OR describe your company in your own words. Both options work."}
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
                          style={{
                            borderColor: "oklch(0.70 0.17 162)",
                            borderTopColor: "transparent",
                          }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                        >
                          {lang === "de" ? "Wird hochgeladen..." : "Uploading..."}
                        </span>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 size={24} style={{ color: "oklch(0.70 0.17 162)" }} />
                        <div className="text-left">
                          <div
                            className="font-semibold text-sm"
                            style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}
                          >
                            {uploadedFile.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                          >
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
                        <span
                          className="font-semibold text-sm"
                          style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.45 0.02 240)" }}
                        >
                          {lang === "de"
                            ? "PDF hierher ziehen oder klicken zum Hochladen"
                            : "Drag PDF here or click to upload"}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                        >
                          {lang === "de"
                            ? "Businessplan, Pitch Deck, Finanzplan..."
                            : "Business plan, pitch deck, financial plan..."}
                        </span>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <div
                      className="flex items-center gap-2 mt-2 text-xs"
                      style={{ color: "oklch(0.65 0.2 25)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      <AlertCircle size={14} />
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: "oklch(0.90 0.006 240)" }} />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
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
                    <span
                      className="font-bold text-sm"
                      style={{ fontFamily: "'Nunito Sans', sans-serif", color: "oklch(0.22 0.07 240)" }}
                    >
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
                        ? "Beschreiben Sie Ihr Unternehmen, Ihre Idee oder Ihr Projekt so ausführlich wie möglich. Z.B.: Branche, Unternehmensphase, Standort, Mitarbeiterzahl, geplante Vorhaben, bisherige Förderungen..."
                        : "Describe your company, idea or project as thoroughly as possible. E.g.: industry, company stage, location, number of employees, planned projects, previous grants..."
                    }
                    className="w-full p-4 rounded-2xl text-sm resize-none outline-none transition-all duration-200"
                    style={{
                      border: "2px solid oklch(0.88 0.006 240)",
                      fontFamily: "'Nunito Sans', sans-serif",
                      color: "oklch(0.22 0.07 240)",
                      background: "oklch(0.98 0.002 240)",
                      minHeight: 140,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "oklch(0.70 0.17 162)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "oklch(0.88 0.006 240)"; }}
                  />
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
                  {lang === "de" ? "KI-Förderanalyse starten" : "Start AI Grant Analysis"}
                </button>
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
                  style={{
                    background: "oklch(0.22 0.07 240)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <div
                        className="text-white font-bold text-sm"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        MSV KI-Förderberater
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                      >
                        {isFinalAnalysis
                          ? (lang === "de" ? "✓ Analyse abgeschlossen" : "✓ Analysis complete")
                          : (lang === "de" ? "Analysiert Ihr Unternehmen..." : "Analyzing your company...")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Nunito Sans', sans-serif",
                    }}
                  >
                    <RefreshCw size={12} />
                    {lang === "de" ? "Neu starten" : "Start Over"}
                  </button>
                </div>

                {/* Messages */}
                <div
                  className="p-6 space-y-6"
                  style={{ minHeight: 300, maxHeight: 600, overflowY: "auto" }}
                >
                  {/* Uploaded file indicator */}
                  {uploadedFile && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      <FileText size={14} style={{ color: "oklch(0.70 0.17 162)" }} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.55 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
                      >
                        {uploadedFile.name}
                      </span>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{
                          background:
                            msg.role === "user" ? "oklch(0.22 0.07 240)" : "oklch(0.70 0.17 162)",
                        }}
                      >
                        {msg.role === "user" ? (
                          <User size={14} className="text-white" />
                        ) : (
                          <Bot size={14} className="text-white" />
                        )}
                      </div>
                      {/* Bubble */}
                      <div
                        className="rounded-2xl px-5 py-4 max-w-[85%]"
                        style={{
                          background:
                            msg.role === "user"
                              ? "oklch(0.22 0.07 240)"
                              : "oklch(0.97 0.004 240)",
                          border:
                            msg.role === "assistant"
                              ? "1px solid oklch(0.90 0.006 240)"
                              : "none",
                        }}
                      >
                        {msg.role === "assistant" ? (
                          <div
                            className="prose prose-sm max-w-none"
                            style={{
                              fontFamily: "'Nunito Sans', sans-serif",
                              color: "oklch(0.22 0.07 240)",
                            }}
                          >
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p
                            className="text-sm text-white"
                            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                          >
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.70 0.17 162)" }}
                      >
                        <Bot size={14} className="text-white" />
                      </div>
                      <div
                        className="rounded-2xl px-5 py-4"
                        style={{
                          background: "oklch(0.97 0.004 240)",
                          border: "1px solid oklch(0.90 0.006 240)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-bounce"
                                style={{
                                  background: "oklch(0.70 0.17 162)",
                                  animationDelay: `${i * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className="text-xs"
                            style={{
                              color: "oklch(0.55 0.02 240)",
                              fontFamily: "'Nunito Sans', sans-serif",
                            }}
                          >
                            {lang === "de" ? "KI analysiert..." : "AI analyzing..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area — always visible after start */}
                <div
                  className="px-6 pb-6 pt-2 border-t"
                  style={{ borderColor: "oklch(0.92 0.006 240)" }}
                >
                  {isFinalAnalysis && (
                    <p
                      className="text-xs mb-3"
                      style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
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
                          ? (lang === "de"
                            ? "Weitere Fragen zur Förderanalyse..."
                            : "Further questions about the analysis...")
                          : (lang === "de"
                            ? "Ihre Antwort... (Enter zum Senden)"
                            : "Your reply... (Enter to send)")
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
                  <p
                    className="text-xs mt-2"
                    style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {lang === "de" ? "Shift+Enter für neue Zeile" : "Shift+Enter for new line"}
                  </p>
                </div>
              </div>

              {/* Matched grants after final analysis */}
              {isFinalAnalysis && matchedGrants.length > 0 && (
                <div>
                  <h3
                    className="text-xl font-black mb-4"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}
                  >
                    {lang === "de" ? "🎯 Passende Förderungen für Sie" : "🎯 Matching Grants for You"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {matchedGrants.map((grant) => (
                      <div
                        key={grant.id}
                        className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
                        style={{
                          boxShadow: "0 4px 16px rgba(10,46,82,0.08)",
                          border: "1px solid oklch(0.92 0.006 240)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: "oklch(0.22 0.07 240)",
                              color: "white",
                              fontFamily: "'Nunito Sans', sans-serif",
                            }}
                          >
                            {grant.provider}
                          </span>
                          <div
                            className="flex items-center gap-1"
                            style={{ color: successRateColor(grant.successRate) }}
                          >
                            <Target size={12} />
                            <span
                              className="text-xs font-bold"
                              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              {grant.successRate}%
                            </span>
                          </div>
                        </div>
                        <h4
                          className="font-black text-sm mb-1"
                          style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}
                        >
                          {lang === "de" ? grant.name : grant.nameEn}
                        </h4>
                        <p
                          className="text-xs mb-3 line-clamp-2"
                          style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                        >
                          {lang === "de" ? grant.description : grant.descriptionEn}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center">
                            <div
                              className="text-sm font-black"
                              style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Outfit', sans-serif" }}
                            >
                              {formatAmount(grant.maxAmount)}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              max.
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-sm font-black"
                              style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Outfit', sans-serif" }}
                            >
                              {grant.fundingRate}%
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              {lang === "de" ? "Quote" : "Rate"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-sm font-black"
                              style={{ color: "oklch(0.22 0.07 240)", fontFamily: "'Outfit', sans-serif" }}
                            >
                              {grant.processingTime.split("-")[0]}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "oklch(0.65 0.006 240)", fontFamily: "'Nunito Sans', sans-serif" }}
                            >
                              {lang === "de" ? "Wochen" : "Weeks"}
                            </div>
                          </div>
                        </div>
                        <a
                          href={grant.providerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
                          style={{
                            background: "oklch(0.22 0.07 240)",
                            color: "white",
                            fontFamily: "'Nunito Sans', sans-serif",
                          }}
                        >
                          <ExternalLink size={12} />
                          {lang === "de" ? "Zur Förderstelle" : "Visit Funder"}
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* CTA: Contact MSV */}
                  <div
                    className="mt-8 p-8 rounded-2xl text-center"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.22 0.07 240), oklch(0.30 0.08 220))",
                    }}
                  >
                    <h3
                      className="text-xl font-black text-white mb-2"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {lang === "de"
                        ? "Professionelle Unterstützung gewünscht?"
                        : "Want professional support?"}
                    </h3>
                    <p
                      className="text-sm mb-5"
                      style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {lang === "de"
                        ? "MSV Consulting begleitet Sie durch den gesamten Antragsprozess — von der Vorbereitung bis zur Auszahlung."
                        : "MSV Consulting guides you through the entire application process — from preparation to disbursement."}
                    </p>
                    <a
                      href="/#contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                      style={{
                        background: "oklch(0.70 0.17 162)",
                        color: "white",
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {lang === "de" ? "Kostenlose Beratung anfragen" : "Request Free Consultation"}
                      <ArrowRight size={16} />
                    </a>
                  </div>
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
