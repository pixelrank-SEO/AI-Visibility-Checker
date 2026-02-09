export const REGIONS = [
  { code: "global", label: "Worldwide", suffix: "" },
  { code: "us", label: "United States", suffix: "in the United States" },
  { code: "uk", label: "United Kingdom", suffix: "in the UK" },
  { code: "de", label: "Germany", suffix: "in Germany" },
  { code: "fr", label: "France", suffix: "in France" },
  { code: "au", label: "Australia", suffix: "in Australia" },
  { code: "ca", label: "Canada", suffix: "in Canada" },
  { code: "in", label: "India", suffix: "in India" },
  { code: "jp", label: "Japan", suffix: "in Japan" },
  { code: "br", label: "Brazil", suffix: "in Brazil" },
] as const;

export type Region = (typeof REGIONS)[number];

export const PLATFORM_NAMES: Record<string, string> = {
  OPENAI: "ChatGPT",
  ANTHROPIC: "Claude",
  GEMINI: "Gemini",
  PERPLEXITY: "Perplexity",
};

export const PLATFORM_COLORS: Record<string, string> = {
  OPENAI: "#10A37F",
  ANTHROPIC: "#D4A574",
  GEMINI: "#4285F4",
  PERPLEXITY: "#20808D",
};

export const MENTION_WEIGHTS: Record<string, number> = {
  DIRECT_CITATION: 1.0,
  RECOMMENDATION: 0.8,
  BRAND_MENTION: 0.6,
  PASSING_REFERENCE: 0.3,
  NOT_MENTIONED: 0.0,
};

export const PLATFORM_WEIGHTS: Record<string, number> = {
  PERPLEXITY: 0.30,
  OPENAI: 0.25,
  GEMINI: 0.25,
  ANTHROPIC: 0.20,
};

export const SCAN_STEPS = [
  { key: "SCRAPING", label: "Analyzing website", icon: "Globe" },
  { key: "GENERATING_QUERIES", label: "Generating queries", icon: "Sparkles" },
  { key: "QUERYING_PLATFORMS", label: "Querying AI platforms", icon: "Send" },
  { key: "ANALYZING", label: "Analyzing responses", icon: "BarChart" },
  { key: "COMPLETED", label: "Complete", icon: "CheckCircle" },
] as const;
