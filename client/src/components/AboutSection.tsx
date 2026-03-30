/* MSV Consulting - About Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Split layout — text left, Vienna image right with dark overlay
 * Features: Founder bio, education, LinkedIn link, key credentials
 */

import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, Linkedin, Award } from "lucide-react";

const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-about-bg-YtVhVsjoWSvCRYpQaq2XZN.webp";

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
  const { t } = useLanguage();
  const { ref, visible } = useIntersection();

  const credentials = [
    { icon: <Award size={18} />, text: "8+ Years Experience" },
    { icon: <Award size={18} />, text: "€4.5M+ Grants Secured" },
    { icon: <Award size={18} />, text: "Former CEO, OVARTEC GmbH" },
    { icon: <Award size={18} />, text: "$2.3M Funding Raised" },
  ];

  return (
    <section
      id="about"
      className="py-0 overflow-hidden"
      style={{ background: "oklch(0.22 0.07 240)" }}
      ref={ref}
    >
      <div className="grid lg:grid-cols-2 min-h-[600px]">
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
                <span style={{ color: "oklch(0.70 0.17 162)" }}>{c.icon}</span>
                <span
                  className="text-xs font-semibold text-white"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>

          {/* Education */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <GraduationCap size={20} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div
                className="text-sm font-bold text-white"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {t("about.edu.degree")}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {t("about.edu.school")}
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

        {/* Right: Vienna image */}
        <div
          className="relative min-h-[400px] lg:min-h-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(32px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          <img
            src={ABOUT_BG}
            alt="Vienna skyline"
            className="w-full h-full object-cover"
            style={{ minHeight: "400px" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(10,46,82,0.7) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
