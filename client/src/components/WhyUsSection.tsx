/* MSV Consulting - Why Us Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Light background, 2x2 grid of feature cards with icon + text
 * Features: Scroll-triggered fade-up animation
 */

import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, UserCheck, Network, Layers } from "lucide-react";

function useIntersection(threshold = 0.1) {
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

export default function WhyUsSection() {
  const { t } = useLanguage();
  const { ref, visible } = useIntersection();

  const items = [
    { key: "1", icon: <TrendingUp size={24} /> },
    { key: "2", icon: <UserCheck size={24} /> },
    { key: "3", icon: <Network size={24} /> },
    { key: "4", icon: <Layers size={24} /> },
  ];

  return (
    <section
      className="py-24"
      style={{ background: "oklch(0.96 0.006 240)" }}
      ref={ref}
    >
      <div className="container">
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-0.5 w-12" style={{ background: "oklch(0.70 0.17 162)" }} />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("why.sub")}
            </span>
            <div className="h-0.5 w-12" style={{ background: "oklch(0.70 0.17 162)" }} />
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black"
            style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}
          >
            {t("why.title")}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div
              key={item.key}
              className="bg-white rounded-2xl p-8 msv-card-hover"
              style={{
                boxShadow: "0 2px 16px rgba(10,46,82,0.07)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, box-shadow 0.25s ease`,
              }}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                style={{
                  background: "oklch(0.22 0.07 240)",
                  color: "oklch(0.70 0.17 162)",
                }}
              >
                {item.icon}
              </div>

              {/* Number */}
              <div
                className="text-6xl font-black leading-none mb-3 select-none"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "oklch(0.92 0.006 240)",
                }}
              >
                0{item.key}
              </div>

              <h3
                className="text-lg font-bold mb-3"
                style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.22 0.07 240)" }}
              >
                {t(`why.${item.key}.title`)}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.45 0.02 240)", fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {t(`why.${item.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
