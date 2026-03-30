/* MSV Consulting - Hero Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Full-screen hero with dark overlay on generated bg image
 * Features: Animated headline, stat counters, dual CTA buttons
 * Image: msv-hero-bg (Vienna skyline + geometric shapes, dark blue/green)
 */

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ChevronDown } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-hero-bg-GGZh848fjN3kVCPG6J6EkH.webp";

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function HeroSection() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const raised = useCountUp(45, 1800, visible);
  const rate = useCountUp(60, 1800, visible);
  const years = useCountUp(8, 1500, visible);
  const network = useCountUp(10, 1500, visible);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(10,46,82,0.92) 0%, rgba(10,46,82,0.75) 50%, rgba(5,30,55,0.88) 100%), url(${HERO_BG}) center/cover no-repeat`,
      }}
    >
      {/* Decorative diagonal overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom right, rgba(16,185,129,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Green accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "oklch(0.70 0.17 162)" }}
      />

      <div className="container relative z-10 pt-28 pb-20">
        <div ref={ref} className="max-w-4xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 border"
            style={{
              background: "rgba(16,185,129,0.12)",
              borderColor: "rgba(16,185,129,0.35)",
              color: "oklch(0.80 0.14 162)",
              fontFamily: "'Nunito Sans', sans-serif",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.70 0.17 162)" }}
            />
            {t("hero.badge")}
          </div>

          {/* Headline */}
          <h1
            className="text-white leading-none mb-6"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 800,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}
          >
            {t("hero.headline1")}{" "}
            <span style={{ color: "oklch(0.70 0.17 162)" }}>
              {t("hero.headline2")}
            </span>
            <br />
            {t("hero.headline3")}
          </h1>

          {/* Subtext */}
          <p
            className="text-lg mb-10 max-w-2xl leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.75)",
              fontFamily: "'Nunito Sans', sans-serif",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            {t("hero.sub")}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-wrap gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                background: "oklch(0.70 0.17 162)",
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: "0.95rem",
              }}
            >
              {t("hero.cta1")}
              <ArrowRight size={18} />
            </a>
            <a
              href="/foerderungen"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:bg-white/10 border"
              style={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: "0.95rem",
              }}
            >
              {t("hero.cta2")}
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 pt-10 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.5s",
          }}
        >
          {[
            { value: `€${raised}M+`, label: t("stats.raised") },
            { value: `${rate}%`, label: t("stats.rate") },
            { value: `${years}+`, label: t("stats.years") },
            { value: `${network}+`, label: t("stats.clients") },
          ].map((stat, i) => (
            <div key={i} className="text-center lg:text-left">
              <div
                className="font-black leading-none mb-1"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "oklch(0.70 0.17 162)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm font-medium"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
      </div>

      {/* Diagonal bottom cut */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: "oklch(0.98 0.003 240)",
          clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
        }}
      />
    </section>
  );
}
