/* MSV Consulting - Footer Component
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Dark navy, logo + tagline left, links center, contact right
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "oklch(0.16 0.06 240)" }}>
      {/* Main footer content */}
      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg font-black text-white text-lg"
                style={{ background: "oklch(0.70 0.17 162)", fontFamily: "'Outfit', sans-serif" }}
              >
                M
              </div>
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                MSV Consulting
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("footer.tagline")}
            </p>
            <a
              href="https://www.linkedin.com/in/maximilian-speiser"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "oklch(0.70 0.17 162)" }}
            >
              <Linkedin size={16} />
            </a>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-white font-bold mb-5 text-sm uppercase tracking-widest"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("nav.services")}
            </h4>
            <ul className="space-y-3">
              {["grant", "startup", "investor", "ai"].map((key) => (
                <li key={key}>
                  <a
                    href="#services"
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {t(`services.${key}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-bold mb-5 text-sm uppercase tracking-widest"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("nav.contact")}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={14} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0 }} />
                <a
                  href="mailto:Create0solutions@gmail.com"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Create0solutions@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} style={{ color: "oklch(0.70 0.17 162)", flexShrink: 0 }} />
                <a
                  href="tel:+436705555216"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  +43 670 555 5216
                </a>
              </div>
              <div
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Sebastianplatz 7/5<br />
                1030 Wien, Österreich
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            © {year} MSV Consulting. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-xs hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("footer.imprint")}
            </a>
            <a
              href="#"
              className="text-xs hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("footer.privacy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
