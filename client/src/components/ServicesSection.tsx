/* MSV Consulting - Services Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: 2x2 grid of service cards with hover left-border accent
 * Services: Grant Consulting, Startup Consulting, Investor Matching, AI Consulting
 */

import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Rocket, Users, Brain, ArrowRight } from "lucide-react";

const GRANT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-grant-consulting-AdESuhg6mUHvvTYhzrqC5n.webp";
const STARTUP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-startup-consulting-EknPpX4BqZXDSw2j6fGBnu.webp";
const AI_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480219082/QWK7aPuE7MJsTSzET7wtRk/msv-ai-consulting-eetZx8XoQWNKgt5fWXcFw4.webp";

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

export default function ServicesSection() {
  const { t } = useLanguage();
  const { ref, visible } = useIntersection();

  const services = [
    {
      key: "grant",
      icon: <FileText size={28} />,
      image: GRANT_IMG,
      badge: null,
    },
    {
      key: "startup",
      icon: <Rocket size={28} />,
      image: STARTUP_IMG,
      badge: null,
    },
    {
      key: "investor",
      icon: <Users size={28} />,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
      badge: null,
    },
    {
      key: "ai",
      icon: <Brain size={28} />,
      image: AI_IMG,
      badge: t("services.new"),
    },
  ];

  return (
    <section id="services" className="py-24 bg-white" ref={ref}>
      <div className="container">
        {/* Section header */}
        <div
          className="mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div
            className="flex items-center gap-3 mb-4"
          >
            <div
              className="h-0.5 w-12"
              style={{ background: "oklch(0.70 0.17 162)" }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("services.sub")}
            </span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.22 0.07 240)",
            }}
          >
            {t("services.title")}
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <div
              key={service.key}
              className="group rounded-2xl overflow-hidden border msv-card-hover msv-service-card-border"
              style={{
                borderColor: "oklch(0.90 0.008 240)",
                background: "white",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, border-color 0.25s ease, box-shadow 0.25s ease`,
              }}
            >
              {/* Card image (if available) */}
              {service.image && (
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={service.image}
                    alt={t(`services.${service.key}.title`)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to bottom, transparent 40%, rgba(10,46,82,0.6) 100%)",
                    }}
                  />
                  {service.badge && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      {service.badge}
                    </div>
                  )}
                </div>
              )}

              {/* Card content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl"
                    style={{
                      background: "oklch(0.95 0.01 162)",
                      color: "oklch(0.70 0.17 162)",
                    }}
                  >
                    {service.icon}
                  </div>
                  {service.badge && !service.image && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "oklch(0.70 0.17 162)" }}
                    >
                      {service.badge}
                    </div>
                  )}
                </div>

                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "oklch(0.22 0.07 240)",
                  }}
                >
                  {t(`services.${service.key}.title`)}
                </h3>

                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{
                    color: "oklch(0.45 0.02 240)",
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {t(`services.${service.key}.desc`)}
                </p>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                  style={{
                    color: "oklch(0.70 0.17 162)",
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {t("services.learn")}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
