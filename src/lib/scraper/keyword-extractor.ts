import type { ParsedHtml } from "./html-parser";

interface ExtractedData {
  industry: string;
  keywords: string[];
  services: string[];
}

/**
 * Extracts keywords using word frequency analysis from the parsed HTML.
 * This is the fallback when no AI API is configured.
 */
export function extractKeywordsFromContent(parsed: ParsedHtml, domain: string): ExtractedData {
  const allText = [
    parsed.title,
    parsed.description,
    ...parsed.headings,
    parsed.bodyText.slice(0, 2000),
  ]
    .join(" ")
    .toLowerCase();

  // Common stop words to filter out
  const stopWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "are", "is", "was", "has", "more",
    "been", "were", "being", "had", "did", "does", "very", "may",
    "should", "must", "much", "own", "too", "here", "where", "why",
    "let", "keep", "still", "might", "while", "each", "every",
    "both", "such", "those", "since", "same", "through",
    "home", "contact", "about", "menu", "page", "click", "read",
    "learn", "more", "view", "see", "privacy", "policy", "terms",
    "cookie", "cookies", "accept", "close", "search", "sign",
    "login", "register", "subscribe", "share", "follow",
  ]);

  // Extract words, filter stop words, count frequency
  const words = allText.match(/\b[a-z]{3,20}\b/g) || [];
  const wordCount = new Map<string, number>();

  for (const word of words) {
    if (!stopWords.has(word) && !domain.includes(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }

  // Extract 2-word phrases from headings and description
  const phrases: string[] = [];
  const phraseSource = [parsed.title, parsed.description, ...parsed.headings].join(". ");
  const phraseWords = phraseSource.toLowerCase().split(/\s+/);
  for (let i = 0; i < phraseWords.length - 1; i++) {
    const w1 = phraseWords[i].replace(/[^a-z]/g, "");
    const w2 = phraseWords[i + 1].replace(/[^a-z]/g, "");
    if (w1.length > 2 && w2.length > 2 && !stopWords.has(w1) && !stopWords.has(w2)) {
      phrases.push(`${w1} ${w2}`);
    }
  }

  // Sort by frequency and take top keywords
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  // Combine single words and phrases, deduplicate
  const allKeywords = [...new Set([...parsed.metaKeywords.map(k => k.toLowerCase()), ...phrases, ...sortedWords])];
  const keywords = allKeywords.slice(0, 20);

  // Simple industry inference from keywords and title
  const industry = inferIndustry(allText);

  // Services from headings
  const services = parsed.headings
    .filter((h) => h.length > 5 && h.length < 100)
    .slice(0, 10);

  return { industry, keywords, services };
}

function inferIndustry(text: string): string {
  const industryPatterns: [string, string[]][] = [
    ["Digital Marketing", ["marketing", "seo", "sem", "ppc", "advertising", "campaign"]],
    ["Software Development", ["software", "development", "programming", "code", "developer", "app"]],
    ["E-commerce", ["shop", "store", "ecommerce", "product", "buy", "cart", "checkout"]],
    ["Healthcare", ["health", "medical", "doctor", "patient", "clinic", "hospital"]],
    ["Finance", ["finance", "banking", "investment", "insurance", "loan", "credit"]],
    ["Education", ["education", "learning", "course", "training", "school", "university"]],
    ["Real Estate", ["real estate", "property", "house", "apartment", "rent", "mortgage"]],
    ["Technology", ["technology", "tech", "digital", "cloud", "data", "ai", "automation"]],
    ["Consulting", ["consulting", "consultant", "advisory", "strategy", "management"]],
    ["Design", ["design", "creative", "branding", "graphic", "ui", "ux"]],
    ["SaaS", ["saas", "platform", "tool", "subscription", "dashboard", "analytics"]],
    ["Agency", ["agency", "services", "solutions", "partner", "client"]],
  ];

  let bestMatch = "General Business";
  let bestScore = 0;

  for (const [industry, keywords] of industryPatterns) {
    const score = keywords.reduce((sum, kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      const matches = text.match(regex);
      return sum + (matches ? matches.length : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = industry;
    }
  }

  return bestMatch;
}
