/* MSV Consulting - Austrian & EU Grants Database
 * Curated list of grants relevant for Austrian startups and SMEs
 * Periodically updated via AI analysis
 */

export interface Grant {
  id: string;
  name: string;
  nameEn: string;
  provider: string;
  providerUrl: string;
  description: string;
  descriptionEn: string;
  maxAmount: number; // in EUR
  minAmount: number;
  fundingRate: number; // percentage (0-100)
  eligibleTypes: string[]; // "startup" | "sme" | "corporate" | "research"
  eligibleIndustries: string[]; // "tech" | "green" | "health" | "manufacturing" | "services" | "all"
  projectTypes: string[]; // "r&d" | "digitalization" | "internationalization" | "founding" | "growth" | "ai"
  regions: string[]; // "vienna" | "austria" | "eu"
  deadline: string | null; // ISO date or null for rolling
  isRolling: boolean;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  processingTime: string; // e.g. "4-8 weeks"
  successRate: number; // percentage (0-100) — historical approval rate
}

export const GRANTS_DATABASE: Grant[] = [
  // === FFG (Forschungsförderungsgesellschaft) ===
  {
    id: "ffg-basisprogramm",
    name: "FFG Basisprogramm",
    nameEn: "FFG Base Programme",
    provider: "FFG",
    providerUrl: "https://www.ffg.at/basisprogramm",
    description: "Förderung für Forschungs- und Entwicklungsprojekte österreichischer Unternehmen. Bis zu 50% der förderfähigen Kosten.",
    descriptionEn: "Funding for R&D projects of Austrian companies. Up to 50% of eligible costs.",
    maxAmount: 5000000,
    minAmount: 50000,
    fundingRate: 50,
    eligibleTypes: ["startup", "sme", "corporate"],
    eligibleIndustries: ["tech", "health", "manufacturing", "green", "all"],
    projectTypes: ["r&d"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["FFG", "F&E", "Forschung", "Innovation"],
    difficulty: "medium",
    processingTime: "3-6 Monate",
    successRate: 55,
  },
  {
    id: "ffg-startup",
    name: "FFG Startup Förderung",
    nameEn: "FFG Startup Grant",
    provider: "FFG",
    providerUrl: "https://www.ffg.at/startup",
    description: "Speziell für innovative Startups in der Frühphase. Nicht-rückzahlbare Zuschüsse für technologieorientierte Gründungen.",
    descriptionEn: "Specifically for innovative early-stage startups. Non-repayable grants for technology-oriented founders.",
    maxAmount: 200000,
    minAmount: 10000,
    fundingRate: 70,
    eligibleTypes: ["startup"],
    eligibleIndustries: ["tech", "health", "green", "all"],
    projectTypes: ["r&d", "founding"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["FFG", "Startup", "Gründung", "Technologie"],
    difficulty: "medium",
    processingTime: "2-4 Monate",
    successRate: 62,
  },
  {
    id: "ffg-comet",
    name: "COMET – Competence Centers for Excellent Technologies",
    nameEn: "COMET Programme",
    provider: "FFG",
    providerUrl: "https://www.ffg.at/comet",
    description: "Aufbau und Betrieb von Kompetenzzentren für kooperative Forschung zwischen Wissenschaft und Wirtschaft.",
    descriptionEn: "Establishment and operation of competence centers for cooperative research between science and industry.",
    maxAmount: 10000000,
    minAmount: 500000,
    fundingRate: 45,
    eligibleTypes: ["sme", "corporate", "research"],
    eligibleIndustries: ["tech", "manufacturing", "health", "all"],
    projectTypes: ["r&d"],
    regions: ["austria"],
    deadline: "2026-06-30",
    isRolling: false,
    tags: ["FFG", "COMET", "Kompetenzzentrum", "Kooperation"],
    difficulty: "hard",
    processingTime: "6-12 Monate",
    successRate: 20,
  },

  // === AWS (Austria Wirtschaftsservice) ===
  {
    id: "aws-double-equity",
    name: "AWS Double Equity",
    nameEn: "AWS Double Equity",
    provider: "AWS",
    providerUrl: "https://www.aws.at/double-equity",
    description: "Eigenkapitalfinanzierung für innovative Startups. AWS verdoppelt das eingebrachte Kapital von privaten Investoren.",
    descriptionEn: "Equity financing for innovative startups. AWS doubles the capital brought in by private investors.",
    maxAmount: 2000000,
    minAmount: 100000,
    fundingRate: 50,
    eligibleTypes: ["startup"],
    eligibleIndustries: ["tech", "green", "health", "all"],
    projectTypes: ["growth", "founding"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["AWS", "Eigenkapital", "Startup", "Investor"],
    difficulty: "medium",
    processingTime: "2-4 Monate",
    successRate: 45,
  },
  {
    id: "aws-gruenderfonds",
    name: "AWS Gründerfonds",
    nameEn: "AWS Founder Fund",
    provider: "AWS",
    providerUrl: "https://www.aws.at/gruenderfonds",
    description: "Beteiligungskapital für innovative, wachstumsorientierte Unternehmen in der Frühphase.",
    descriptionEn: "Equity capital for innovative, growth-oriented companies in the early stage.",
    maxAmount: 1500000,
    minAmount: 50000,
    fundingRate: 40,
    eligibleTypes: ["startup"],
    eligibleIndustries: ["tech", "health", "green", "all"],
    projectTypes: ["founding", "growth"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["AWS", "Gründerfonds", "Beteiligung", "Wachstum"],
    difficulty: "medium",
    processingTime: "3-5 Monate",
    successRate: 50,
  },
  {
    id: "aws-digitalisierung",
    name: "AWS Digitalisierungsförderung",
    nameEn: "AWS Digitalization Grant",
    provider: "AWS",
    providerUrl: "https://www.aws.at/digitalisierung",
    description: "Förderung für Digitalisierungsprojekte österreichischer KMUs. Zuschüsse und zinsgünstige Kredite.",
    descriptionEn: "Funding for digitalization projects of Austrian SMEs. Grants and low-interest loans.",
    maxAmount: 500000,
    minAmount: 10000,
    fundingRate: 35,
    eligibleTypes: ["sme", "startup"],
    eligibleIndustries: ["all"],
    projectTypes: ["digitalization", "ai"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["AWS", "Digitalisierung", "KMU", "Digital"],
    difficulty: "easy",
    processingTime: "4-8 Wochen",
    successRate: 68,
  },
  {
    id: "aws-eco-innovation",
    name: "AWS eco.innovation",
    nameEn: "AWS eco.innovation",
    provider: "AWS",
    providerUrl: "https://www.aws.at/eco-innovation",
    description: "Förderung für ökologische Innovationen und nachhaltige Geschäftsmodelle.",
    descriptionEn: "Funding for ecological innovations and sustainable business models.",
    maxAmount: 800000,
    minAmount: 20000,
    fundingRate: 40,
    eligibleTypes: ["startup", "sme"],
    eligibleIndustries: ["green", "manufacturing", "tech"],
    projectTypes: ["r&d", "growth"],
    regions: ["austria"],
    deadline: "2026-09-30",
    isRolling: false,
    tags: ["AWS", "Ökologie", "Nachhaltigkeit", "Green"],
    difficulty: "medium",
    processingTime: "2-4 Monate",
    successRate: 52,
  },

  // === WKO / Wirtschaftskammer ===
  {
    id: "wko-internationalisierung",
    name: "WKO Internationalisierungsoffensive",
    nameEn: "WKO Internationalization Offensive",
    provider: "WKO",
    providerUrl: "https://www.wko.at/service/aussenwirtschaft/foerderungen",
    description: "Förderung für österreichische Unternehmen, die in neue Märkte expandieren wollen.",
    descriptionEn: "Funding for Austrian companies looking to expand into new markets.",
    maxAmount: 100000,
    minAmount: 5000,
    fundingRate: 50,
    eligibleTypes: ["sme", "startup"],
    eligibleIndustries: ["all"],
    projectTypes: ["internationalization"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["WKO", "Export", "Internationalisierung", "Markterschließung"],
    difficulty: "easy",
    processingTime: "4-8 Wochen",
    successRate: 74,
  },

  // === Wien Wirtschaft / Wiener Wirtschaftsförderungsfonds ===
  {
    id: "wwff-innovationsscheck",
    name: "Wiener Innovationsscheck",
    nameEn: "Vienna Innovation Voucher",
    provider: "Wien Wirtschaft",
    providerUrl: "https://www.wienerwirtschaft.at/foerderungen/innovationsscheck",
    description: "Förderung für Wiener Unternehmen für Kooperationen mit Forschungseinrichtungen.",
    descriptionEn: "Funding for Vienna-based companies for cooperation with research institutions.",
    maxAmount: 10000,
    minAmount: 2000,
    fundingRate: 80,
    eligibleTypes: ["startup", "sme"],
    eligibleIndustries: ["all"],
    projectTypes: ["r&d", "digitalization"],
    regions: ["vienna"],
    deadline: null,
    isRolling: true,
    tags: ["Wien", "Innovation", "Forschung", "Kooperation"],
    difficulty: "easy",
    processingTime: "2-4 Wochen",
    successRate: 80,
  },
  {
    id: "wwff-gruendungsfoerderung",
    name: "Wiener Gründungsförderung",
    nameEn: "Vienna Startup Grant",
    provider: "Wien Wirtschaft",
    providerUrl: "https://www.wienerwirtschaft.at/foerderungen/gruendung",
    description: "Förderung für Neugründungen in Wien. Zuschüsse für Beratungsleistungen und erste Investitionen.",
    descriptionEn: "Funding for new businesses in Vienna. Grants for consulting services and initial investments.",
    maxAmount: 30000,
    minAmount: 3000,
    fundingRate: 50,
    eligibleTypes: ["startup"],
    eligibleIndustries: ["all"],
    projectTypes: ["founding"],
    regions: ["vienna"],
    deadline: null,
    isRolling: true,
    tags: ["Wien", "Gründung", "Startup", "Förderung"],
    difficulty: "easy",
    processingTime: "3-6 Wochen",
    successRate: 76,
  },

  // === EU / Horizon Europe ===
  {
    id: "eic-accelerator",
    name: "EIC Accelerator",
    nameEn: "EIC Accelerator",
    provider: "European Innovation Council",
    providerUrl: "https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en",
    description: "Das wichtigste EU-Förderprogramm für innovative Startups und KMUs mit globalem Potenzial. Bis zu €2,5 Mio. Zuschuss + Eigenkapital.",
    descriptionEn: "The main EU funding program for innovative startups and SMEs with global potential. Up to €2.5M grant + equity.",
    maxAmount: 17500000,
    minAmount: 500000,
    fundingRate: 70,
    eligibleTypes: ["startup", "sme"],
    eligibleIndustries: ["tech", "health", "green", "all"],
    projectTypes: ["r&d", "growth"],
    regions: ["eu"],
    deadline: "2026-10-01",
    isRolling: false,
    tags: ["EU", "EIC", "Horizon", "Deep Tech", "Scale-up"],
    difficulty: "hard",
    processingTime: "6-12 Monate",
    successRate: 12,
  },
  {
    id: "eic-pathfinder",
    name: "EIC Pathfinder",
    nameEn: "EIC Pathfinder",
    provider: "European Innovation Council",
    providerUrl: "https://eic.ec.europa.eu/eic-funding-opportunities/eic-pathfinder_en",
    description: "Förderung für visionäre Forschung mit hohem Risiko und hohem Potenzial (Deep Tech).",
    descriptionEn: "Funding for visionary research with high risk and high potential (Deep Tech).",
    maxAmount: 4000000,
    minAmount: 1000000,
    fundingRate: 100,
    eligibleTypes: ["startup", "research", "sme"],
    eligibleIndustries: ["tech", "health", "green"],
    projectTypes: ["r&d"],
    regions: ["eu"],
    deadline: "2026-09-17",
    isRolling: false,
    tags: ["EU", "EIC", "Deep Tech", "Forschung"],
    difficulty: "hard",
    processingTime: "8-14 Monate",
    successRate: 8,
  },
  {
    id: "horizon-sme",
    name: "Horizon Europe KMU-Instrument",
    nameEn: "Horizon Europe SME Instrument",
    provider: "European Commission",
    providerUrl: "https://ec.europa.eu/info/research-and-innovation/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en",
    description: "Umfangreiches EU-Forschungs- und Innovationsprogramm für KMUs.",
    descriptionEn: "Comprehensive EU research and innovation program for SMEs.",
    maxAmount: 2500000,
    minAmount: 100000,
    fundingRate: 70,
    eligibleTypes: ["sme", "startup"],
    eligibleIndustries: ["tech", "health", "green", "manufacturing"],
    projectTypes: ["r&d", "growth"],
    regions: ["eu"],
    deadline: null,
    isRolling: true,
    tags: ["EU", "Horizon", "KMU", "Forschung"],
    difficulty: "hard",
    processingTime: "6-12 Monate",
    successRate: 15,
  },

  // === BMAW / Bundesministerium ===
  {
    id: "kmu-digital",
    name: "KMU.DIGITAL",
    nameEn: "SME.DIGITAL",
    provider: "BMAW / WKO",
    providerUrl: "https://www.kmudigital.at",
    description: "Förderung für die digitale Transformation österreichischer KMUs. Beratungsförderung und Umsetzungsförderung.",
    descriptionEn: "Funding for the digital transformation of Austrian SMEs. Consulting grants and implementation grants.",
    maxAmount: 60000,
    minAmount: 5000,
    fundingRate: 50,
    eligibleTypes: ["sme"],
    eligibleIndustries: ["all"],
    projectTypes: ["digitalization", "ai"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["KMU", "Digital", "Transformation", "Beratung"],
    difficulty: "easy",
    processingTime: "4-8 Wochen",
    successRate: 70,
  },
  {
    id: "klima-investitionsfoerderung",
    name: "Klima- und Energiefonds – Investitionsförderung",
    nameEn: "Climate and Energy Fund – Investment Grant",
    provider: "Klima- und Energiefonds",
    providerUrl: "https://www.klimafonds.gv.at",
    description: "Förderung für Investitionen in erneuerbare Energien, Energieeffizienz und klimafreundliche Technologien.",
    descriptionEn: "Funding for investments in renewable energy, energy efficiency, and climate-friendly technologies.",
    maxAmount: 3000000,
    minAmount: 50000,
    fundingRate: 40,
    eligibleTypes: ["startup", "sme", "corporate"],
    eligibleIndustries: ["green", "manufacturing", "tech"],
    projectTypes: ["r&d", "growth"],
    regions: ["austria"],
    deadline: "2026-08-31",
    isRolling: false,
    tags: ["Klima", "Energie", "Green", "Nachhaltigkeit"],
    difficulty: "medium",
    processingTime: "3-6 Monate",
    successRate: 48,
  },
  {
    id: "aws-ai-foerderung",
    name: "AWS KI-Förderung",
    nameEn: "AWS AI Grant",
    provider: "AWS",
    providerUrl: "https://www.aws.at/ki-foerderung",
    description: "Neue Förderung für Unternehmen, die KI-Technologien entwickeln oder implementieren.",
    descriptionEn: "New funding for companies developing or implementing AI technologies.",
    maxAmount: 300000,
    minAmount: 15000,
    fundingRate: 45,
    eligibleTypes: ["startup", "sme"],
    eligibleIndustries: ["tech", "all"],
    projectTypes: ["ai", "digitalization", "r&d"],
    regions: ["austria"],
    deadline: null,
    isRolling: true,
    tags: ["AWS", "KI", "AI", "Technologie", "Innovation"],
    difficulty: "medium",
    processingTime: "6-10 Wochen",
    successRate: 60,
  },
];

export function matchGrants(params: {
  companyType: string;
  industry: string;
  projectType: string;
  region: string;
  fundingMin: number;
  fundingMax: number;
}): Grant[] {
  return GRANTS_DATABASE.filter((grant) => {
    // Company type filter
    if (params.companyType && !grant.eligibleTypes.includes(params.companyType)) return false;

    // Industry filter
    if (params.industry && params.industry !== "all") {
      if (!grant.eligibleIndustries.includes(params.industry) && !grant.eligibleIndustries.includes("all")) return false;
    }

    // Project type filter
    if (params.projectType && params.projectType !== "all") {
      if (!grant.projectTypes.includes(params.projectType)) return false;
    }

    // Region filter
    if (params.region) {
      if (params.region === "vienna") {
        if (!grant.regions.includes("vienna") && !grant.regions.includes("austria")) return false;
      } else if (params.region === "austria") {
        if (!grant.regions.includes("austria") && !grant.regions.includes("eu")) return false;
      }
    }

    // Funding range filter
    if (params.fundingMax > 0 && grant.minAmount > params.fundingMax) return false;
    if (params.fundingMin > 0 && grant.maxAmount < params.fundingMin) return false;

    return true;
  }).sort((a, b) => {
    // Sort by: rolling first, then by max amount desc
    if (a.isRolling && !b.isRolling) return -1;
    if (!a.isRolling && b.isRolling) return 1;
    return b.maxAmount - a.maxAmount;
  });
}
