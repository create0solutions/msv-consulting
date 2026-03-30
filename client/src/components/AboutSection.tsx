/* MSV Consulting - About Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Split layout — text left, profile photo right with Vienna bg
 * Features: Founder bio, LinkedIn link, key credentials, profile photo
 */

import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Linkedin, Award, Briefcase, TrendingUp, Users } from "lucide-react";

const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-about-bg-YtVhVsjoWSvCRYpQaq2XZN.webp";
const PROFILE_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/maximilian-photo_4c70e22d.webp";

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function AboutSection() {
  const { t, lang } = useLanguage();
  const { ref, visible } = useIntersection();

  const credentials = [
    { icon: <Briefcase size={16} />, text: lang === "de" ? "8+ Jahre Erfahrung" : "8+ Years Experience" },
    { icon: <TrendingUp size={16} />, text: lang === "de" ? "€4,5 Mio. Förderungen gesichert" : "€4.5M+ Grants Secured" },
    { icon: <Award size={16} />, text: lang === "de" ? "Ehem. CEO, OVARTEC GmbH" : "Former CEO, OVARTEC GmbH" },
    { icon: <Users size={16} />, text: lang === "de" ? "$2,3 Mio. Finanzierung" : "$2.3M Funding Raised" },
  ];

  return (
    <section
      id="about"
      className="py-0 overflow-hidden"
      style={{ background: "oklch(0.22 0.07 240)" }}
      ref={ref}
    >
      <div className="grid lg:grid-cols-2 min-h-[640px]">
        {/* Left: Content */}
        <div
          className="flex flex-col justify-center px-8 py-20 lg:px-16 lg:py-24"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-32px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-0.5 w-12" style={{ background: "oklch(0.70 0.17 162)" }} />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("about.sub")}
            </span>
          </div>

          <h2
            className="text-4xl lg:text-5xl font-black text-white mb-2"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {t("about.title")}
          </h2>
          <p
            className="text-xl font-semibold mb-6"
            style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Outfit', sans-serif" }}
          >
            Maximilian Speiser-Villarroel
          </p>

          <p
            className="text-base leading-relaxed mb-4"
            style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            {t("about.bio")}
          </p>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            {t("about.bio2")}
          </p>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {credentials.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-3 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0 }}>{c.icon}</span>
                <span
                  className="text-xs font-semibold text-white"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>

          {/* Key achievement highlight */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <Award size={20} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div
                className="text-sm font-bold text-white"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {lang === "de" ? "Ehemaliger CEO, OVARTEC GmbH" : "Former CEO, OVARTEC GmbH"}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {lang === "de" ? "$2,3 Mio. Finanzierung gesichert · Internationale Expansion" : "$2.3M funding raised · International expansion"}
              </div>
            </div>
          </div>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/maximilian-speiser"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 w-fit"
            style={{
              background: "oklch(0.70 0.17 162)",
              color: "white",
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            <Linkedin size={16} />
            {t("about.linkedin")}
          </a>
        </div>

        {/* Right: Profile photo over Vienna bg */}
        <div
          className="relative min-h-[400px] lg:min-h-0 flex items-end justify-center overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(32px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          {/* Vienna background */}
          <img
            src={ABOUT_BG}
            alt="Vienna skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(10,46,82,0.85) 0%, rgba(10,46,82,0.3) 50%, rgba(10,46,82,0.15) 100%)",
            }}
          />
          {/* Profile photo — bottom-anchored, natural portrait crop */}
          <div className="relative z-10 w-full flex justify-center items-end" style={{ maxWidth: 380, margin: "0 auto" }}>
            <img
              src={PROFILE_PHOTO}
              alt="Maximilian Speiser-Villarroel"
              className="w-full object-cover object-top"
              style={{
                maxHeight: 580,
                objectPosition: "top center",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -8px 48px rgba(10,46,82,0.4)",
              }}
            />
          </div>
          {/* Name tag at bottom */}
          <div
            className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(10,46,82,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "oklch(0.70 0.17 162)" }}
            />
            <div>
              <div className="text-white font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Maximilian Speiser-Villarroel
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Nunito Sans', sans-serif" }}>
                {lang === "de" ? "Gründer & Geschäftsführer, MSV Consulting" : "Founder & Managing Director, MSV Consulting"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
