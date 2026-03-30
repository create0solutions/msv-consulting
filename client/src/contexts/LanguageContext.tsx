/* MSV Consulting - Language Context
 * Bilingual support: German (DE) and English (EN)
 * Design: Contemporary European Corporate — Bold Geometry
 */

import React, { createContext, useContext, useState } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.services": { de: "Leistungen", en: "Services" },
  "nav.about": { de: "Über uns", en: "About" },
  "nav.contact": { de: "Kontakt", en: "Contact" },
  "nav.cta": { de: "Beratung anfragen", en: "Request Consultation" },

  // Hero
  "hero.badge": { de: "Wien, Österreich", en: "Vienna, Austria" },
  "hero.headline1": { de: "Ihr Partner für", en: "Your Partner for" },
  "hero.headline2": { de: "Förderungen &", en: "Grants &" },
  "hero.headline3": { de: "Wachstum", en: "Growth" },
  "hero.sub": {
    de: "Wir helfen Startups und KMUs, die richtigen Fördermittel zu sichern, die richtigen Investoren zu finden und mit KI-gestützten Strategien zu wachsen.",
    en: "We help startups and SMEs secure the right grants, find the right investors, and grow with AI-powered strategies.",
  },
  "hero.cta1": { de: "Jetzt Beratung anfragen", en: "Request Consultation" },
  "hero.cta2": { de: "Mehr erfahren", en: "Learn More" },

  // Stats
  "stats.raised": { de: "Fördermittel gesichert", en: "in Grants Secured" },
  "stats.rate": { de: "Erfolgsquote", en: "Success Rate" },
  "stats.years": { de: "Jahre Erfahrung", en: "Years Experience" },
  "stats.clients": { de: "Stakeholder-Netzwerk", en: "Stakeholder Network" },

  // Services
  "services.title": { de: "Unsere Leistungen", en: "Our Services" },
  "services.sub": {
    de: "Maßgeschneiderte Beratung für Startups und KMUs in Österreich",
    en: "Tailored consulting for startups and SMEs in Austria",
  },
  "services.grant.title": { de: "Förderberatung", en: "Grant Consulting" },
  "services.grant.desc": {
    de: "Wir begleiten Sie durch den gesamten Antragsprozess — von der Identifikation passender Förderungen (FFG, AWS, EU) bis zur erfolgreichen Einreichung. Mit einer Erfolgsquote von 60% maximieren wir Ihre Chancen.",
    en: "We guide you through the entire application process — from identifying suitable grants (FFG, AWS, EU) to successful submission. With a 60% success rate, we maximize your chances.",
  },
  "services.startup.title": { de: "Startup Consulting", en: "Startup Consulting" },
  "services.startup.desc": {
    de: "Von der Idee zur Struktur: Wir helfen Gründern, ihr Unternehmen von Anfang an richtig aufzustellen — Businessplan, Gesellschaftsstruktur, Go-to-Market-Strategie und operative Prozesse.",
    en: "From idea to structure: We help founders set up their business the right way from the start — business plan, company structure, go-to-market strategy, and operational processes.",
  },
  "services.investor.title": { de: "Investor Matching", en: "Investor Matching" },
  "services.investor.desc": {
    de: "Wir verbinden Startups und Wachstumsunternehmen mit den richtigen Investoren. Durch unser Netzwerk aus VCs, Business Angels und Family Offices öffnen wir Türen, die sonst verschlossen bleiben.",
    en: "We connect startups and growth companies with the right investors. Through our network of VCs, business angels, and family offices, we open doors that would otherwise remain closed.",
  },
  "services.ai.title": { de: "AI Consulting", en: "AI Consulting" },
  "services.ai.desc": {
    de: "Neu: Wir helfen Unternehmen, KI-Technologien strategisch einzusetzen — von der Prozessautomatisierung bis zur datengetriebenen Entscheidungsfindung. Bleiben Sie der Konkurrenz einen Schritt voraus.",
    en: "New: We help businesses strategically implement AI technologies — from process automation to data-driven decision making. Stay one step ahead of the competition.",
  },
  "services.new": { de: "Neu", en: "New" },
  "services.learn": { de: "Mehr erfahren", en: "Learn More" },

  // About
  "about.title": { de: "Über Maximilian", en: "About Maximilian" },
  "about.sub": { de: "Ihr Ansprechpartner", en: "Your Point of Contact" },
  "about.bio": {
    de: "Maximilian Speiser-Villarroel ist ein erfahrener Unternehmer und Berater mit über 8 Jahren Erfahrung in Fundraising, Partnerschaftsmanagement und Geschäftsentwicklung. Als ehemaliger CEO von OVARTEC GmbH sicherte er $2,3 Mio. in Finanzierungen und führte das Unternehmen durch alle Wachstumsphasen.",
    en: "Maximilian Speiser-Villarroel is an experienced entrepreneur and consultant with over 8 years in fundraising, partnership management, and business development. As former CEO of OVARTEC GmbH, he secured $2.3M in funding and led the company through all growth phases.",
  },
  "about.bio2": {
    de: "Seit 2023 hilft er mit MSV Consulting Unternehmen dabei, über €4,5 Mio. an Fördermitteln zu sichern — mit einer bemerkenswerten Erfolgsquote von 60%. Sein Netzwerk und seine Expertise machen ihn zum idealen Partner für Startups und KMUs in Österreich.",
    en: "Since 2023, through MSV Consulting, he has helped companies secure over €4.5M in grants — with a remarkable 60% success rate. His network and expertise make him the ideal partner for startups and SMEs in Austria.",
  },
  "about.education": { de: "Ausbildung", en: "Education" },
  "about.edu.degree": { de: "BA Business Administration & E-Business", en: "BA Business Administration & E-Business" },
  "about.edu.school": { de: "IMC FH Krems, Österreich", en: "IMC FH Krems, Austria" },
  "about.linkedin": { de: "LinkedIn Profil", en: "LinkedIn Profile" },

  // Why Us
  "why.title": { de: "Warum MSV Consulting?", en: "Why MSV Consulting?" },
  "why.sub": {
    de: "Wir liefern messbare Ergebnisse — nicht nur Beratung",
    en: "We deliver measurable results — not just advice",
  },
  "why.1.title": { de: "Bewährte Erfolgsbilanz", en: "Proven Track Record" },
  "why.1.desc": {
    de: "Über €4,5 Mio. gesicherter Fördermittel mit 60% Erfolgsquote sprechen für sich.",
    en: "Over €4.5M in secured grants with a 60% success rate speaks for itself.",
  },
  "why.2.title": { de: "Persönliche Betreuung", en: "Personal Attention" },
  "why.2.desc": {
    de: "Als Einzelberater erhalten Sie direkte Aufmerksamkeit von Maximilian — keine Juniorberater, keine Delegation.",
    en: "As a solo consultant, you get direct attention from Maximilian — no junior consultants, no delegation.",
  },
  "why.3.title": { de: "Starkes Netzwerk", en: "Strong Network" },
  "why.3.desc": {
    de: "Über 10 Schlüssel-Stakeholder-Beziehungen, Investoren und Förderstellen in Österreich und der EU.",
    en: "Over 10 key stakeholder relationships, investors, and funding bodies across Austria and the EU.",
  },
  "why.4.title": { de: "Ganzheitlicher Ansatz", en: "Holistic Approach" },
  "why.4.desc": {
    de: "Von Förderungen über Startup-Aufbau bis zu KI-Strategie — alles aus einer Hand.",
    en: "From grants to startup setup to AI strategy — everything from one source.",
  },

  // Contact
  "contact.title": { de: "Kontakt aufnehmen", en: "Get in Touch" },
  "contact.sub": {
    de: "Bereit, Ihr Unternehmen auf das nächste Level zu bringen? Lassen Sie uns sprechen.",
    en: "Ready to take your business to the next level? Let's talk.",
  },
  "contact.name": { de: "Ihr Name", en: "Your Name" },
  "contact.email": { de: "E-Mail-Adresse", en: "Email Address" },
  "contact.company": { de: "Unternehmen (optional)", en: "Company (optional)" },
  "contact.message": { de: "Ihre Nachricht", en: "Your Message" },
  "contact.send": { de: "Nachricht senden", en: "Send Message" },
  "contact.address": { de: "Adresse", en: "Address" },
  "contact.phone": { de: "Telefon", en: "Phone" },
  "contact.linkedin": { de: "LinkedIn", en: "LinkedIn" },

  // Footer
  "footer.tagline": {
    de: "Ihr Partner für Förderungen, Wachstum und Innovation in Österreich.",
    en: "Your partner for grants, growth, and innovation in Austria.",
  },
  "footer.rights": { de: "Alle Rechte vorbehalten.", en: "All rights reserved." },
  "footer.imprint": { de: "Impressum", en: "Imprint" },
  "footer.privacy": { de: "Datenschutz", en: "Privacy" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("de");

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
