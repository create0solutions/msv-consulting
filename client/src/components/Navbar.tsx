/* MSV Consulting - Navbar Component
 * Design: Contemporary European Corporate — Bold Geometry
 * Features: Sticky nav, language switcher (DE/EN), mobile hamburger menu
 * Colors: Deep Navy bg with green accent on CTA
 */

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("nav.services"), href: "#services" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10, 46, 82, 0.97)"
          : "rgba(10, 46, 82, 0.85)",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.18)" : "none",
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg font-black text-white text-lg"
              style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Outfit', sans-serif" }}
            >
              M
            </div>
            <div>
              <span
                className="text-white font-bold text-lg leading-none block"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                MSV Consulting
              </span>
              <span className="text-xs leading-none" style={{ color: "oklch(0.70 0.17 162)" }}>
                Wien · Austria
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium tracking-wide"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side: Lang switcher + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Toggle */}
            <div
              className="flex items-center rounded-full overflow-hidden border text-xs font-semibold"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <button
                onClick={() => setLang("de")}
                className="px-3 py-1.5 transition-all duration-200"
                style={{
                  background: lang === "de" ? "oklch(0.70 0.17 162)" : "transparent",
                  color: lang === "de" ? "white" : "rgba(255,255,255,0.6)",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                DE
              </button>
              <button
                onClick={() => setLang("en")}
                className="px-3 py-1.5 transition-all duration-200"
                style={{
                  background: lang === "en" ? "oklch(0.70 0.17 162)" : "transparent",
                  color: lang === "en" ? "white" : "rgba(255,255,255,0.6)",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                EN
              </button>
            </div>

            {/* CTA Button */}
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
              style={{
                background: "oklch(0.70 0.17 162)",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              {t("nav.cta")}
            </a>
          </div>

          {/* Mobile: Lang + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <div
              className="flex items-center rounded-full overflow-hidden border text-xs font-semibold"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <button
                onClick={() => setLang("de")}
                className="px-2.5 py-1 transition-all"
                style={{
                  background: lang === "de" ? "oklch(0.70 0.17 162)" : "transparent",
                  color: lang === "de" ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                DE
              </button>
              <button
                onClick={() => setLang("en")}
                className="px-2.5 py-1 transition-all"
                style={{
                  background: lang === "en" ? "oklch(0.70 0.17 162)" : "transparent",
                  color: lang === "en" ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-1"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t pb-4"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-white/80 hover:text-white px-2 py-2.5 text-sm font-medium transition-colors"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                style={{
                  background: "oklch(0.70 0.17 162)",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {t("nav.cta")}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
