/* MSV Consulting - Contact Section
 * Design: Contemporary European Corporate — Bold Geometry
 * Layout: Dark navy background, split — contact info left, form right
 * Features: Form with validation feedback, contact details, mailto link
 */

import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Linkedin, Send } from "lucide-react";

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

export default function ContactSection() {
  const { t } = useLanguage();
  const { ref, visible } = useIntersection();
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Anfrage von ${form.name}${form.company ? ` (${form.company})` : ""}`);
    const body = encodeURIComponent(`Name: ${form.name}\nE-Mail: ${form.email}\nUnternehmen: ${form.company}\n\nNachricht:\n${form.message}`);
    window.location.href = `mailto:Create0solutions@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2";
  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    fontFamily: "'Nunito Sans', sans-serif",
  };

  return (
    <section
      id="contact"
      className="py-24"
      style={{ background: "oklch(0.22 0.07 240)" }}
      ref={ref}
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-32px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-0.5 w-12" style={{ background: "oklch(0.70 0.17 162)" }} />
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "oklch(0.70 0.17 162)", fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {t("contact.sub")}
              </span>
            </div>

            <h2
              className="text-4xl lg:text-5xl font-black text-white mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {t("contact.title")}
            </h2>

            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {t("contact.sub")}
            </p>

            {/* Contact details */}
            <div className="space-y-5">
              {[
                {
                  icon: <MapPin size={18} />,
                  label: t("contact.address"),
                  value: "Sebastianplatz 7/5, 1030 Wien",
                  href: "https://maps.google.com/?q=Sebastianplatz+7,+1030+Wien",
                },
                {
                  icon: <Phone size={18} />,
                  label: t("contact.phone"),
                  value: "+43 670 555 5216",
                  href: "tel:+436705555216",
                },
                {
                  icon: <Mail size={18} />,
                  label: "E-Mail",
                  value: "Create0solutions@gmail.com",
                  href: "mailto:Create0solutions@gmail.com",
                },
                {
                  icon: <Linkedin size={18} />,
                  label: t("contact.linkedin"),
                  value: "linkedin.com/in/maximilian-speiser",
                  href: "https://www.linkedin.com/in/maximilian-speiser",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 mt-0.5 transition-all duration-200 group-hover:scale-110"
                    style={{ background: "rgba(16,185,129,0.15)", color: "oklch(0.70 0.17 162)" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-sm font-medium text-white group-hover:underline"
                      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {item.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div
            className="rounded-2xl p-8 lg:p-10"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(32px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(16,185,129,0.15)" }}
                >
                  <Send size={28} style={{ color: "oklch(0.70 0.17 162)" }} />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {t("contact.send")} ✓
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Ihr E-Mail-Client wurde geöffnet. Wir melden uns bald!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {t("contact.name")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                    >
                      {t("contact.email")} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="max@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {t("contact.company")}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Mein Startup GmbH"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {t("contact.message")} *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ ...inputStyle, resize: "none" }}
                    placeholder={t("contact.sub")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                  style={{
                    background: "oklch(0.70 0.17 162)",
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  <Send size={16} />
                  {t("contact.send")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
