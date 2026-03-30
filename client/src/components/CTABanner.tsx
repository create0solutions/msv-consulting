/* MSV Consulting - CTA Banner Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Full-width dark green-to-navy gradient band with bold headline and CTA
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  const { t, lang } = useLanguage();

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.70 0.17 162) 0%, oklch(0.55 0.15 200) 50%, oklch(0.22 0.07 240) 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "white" }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "white" }}
      />

      <div className="container relative z-10 text-center">
        <h2
          className="text-3xl lg:text-5xl font-black text-white mb-4"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {lang === "de"
            ? "Bereit, Ihre Förderung zu sichern?"
            : "Ready to secure your funding?"}
        </h2>
        <p
          className="text-lg mb-8 max-w-2xl mx-auto"
          style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Nunito Sans', sans-serif" }}
        >
          {lang === "de"
            ? "Lassen Sie uns in einem kostenlosen Erstgespräch herausfinden, welche Förderungen für Ihr Unternehmen in Frage kommen."
            : "Let's find out in a free initial consultation which grants are available for your business."}
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 hover:shadow-2xl hover:-translate-y-0.5"
          style={{
            background: "white",
            color: "oklch(0.22 0.07 240)",
            fontFamily: "'Nunito Sans', sans-serif",
          }}
        >
          {t("hero.cta1")}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
