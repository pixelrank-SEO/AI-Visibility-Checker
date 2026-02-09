import type { MentionAnalysis } from "./types";

export function detectMention(
  responseText: string,
  targetUrl: string,
  targetDomain: string,
  citations: string[]
): MentionAnalysis {
  const text = responseText.toLowerCase();
  const domain = targetDomain.toLowerCase().replace(/^www\./, "");
  const domainWithoutTld = domain.split(".")[0];

  // Check if any citation URLs match the target domain
  const matchingCitation = citations.find((c) => {
    try {
      const citationDomain = new URL(c).hostname.toLowerCase().replace(/^www\./, "");
      return citationDomain === domain || citationDomain.endsWith("." + domain);
    } catch {
      return c.toLowerCase().includes(domain);
    }
  });

  if (matchingCitation) {
    return {
      mentioned: true,
      mentionType: "DIRECT_CITATION",
      confidence: 1.0,
      excerpt: extractExcerpt(responseText, domain) || extractExcerpt(responseText, domainWithoutTld),
      citationUrl: matchingCitation,
    };
  }

  // Check for full URL in response text
  if (text.includes(targetUrl.toLowerCase()) || text.includes(domain)) {
    const isRecommendation = checkIfRecommendation(text, domain);
    return {
      mentioned: true,
      mentionType: isRecommendation ? "RECOMMENDATION" : "DIRECT_CITATION",
      confidence: 1.0,
      excerpt: extractExcerpt(responseText, domain),
      citationUrl: null,
    };
  }

  // Check for domain name without TLD (e.g., "pixelrank" from "pixelrank.com")
  if (domainWithoutTld.length > 3 && text.includes(domainWithoutTld)) {
    // Verify it's not a common English word match
    const contextCheck = new RegExp(`\\b${escapeRegex(domainWithoutTld)}\\b`, "i");
    if (contextCheck.test(responseText)) {
      const isRecommendation = checkIfRecommendation(text, domainWithoutTld);
      return {
        mentioned: true,
        mentionType: isRecommendation ? "RECOMMENDATION" : "BRAND_MENTION",
        confidence: 0.8,
        excerpt: extractExcerpt(responseText, domainWithoutTld),
        citationUrl: null,
      };
    }
  }

  return {
    mentioned: false,
    mentionType: "NOT_MENTIONED",
    confidence: 1.0,
    excerpt: null,
    citationUrl: null,
  };
}

function checkIfRecommendation(text: string, term: string): boolean {
  const recommendationPhrases = [
    "recommend",
    "suggest",
    "top choice",
    "best option",
    "highly rated",
    "worth considering",
    "great choice",
    "good option",
    "popular choice",
    "well-known",
    "leading",
    "notable",
  ];

  // Check if recommendation phrases appear near the term
  const termIndex = text.indexOf(term.toLowerCase());
  if (termIndex === -1) return false;

  const surroundingText = text.slice(
    Math.max(0, termIndex - 200),
    Math.min(text.length, termIndex + 200)
  );

  return recommendationPhrases.some((phrase) => surroundingText.includes(phrase));
}

function extractExcerpt(text: string, searchTerm: string): string | null {
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(searchTerm.toLowerCase());
  if (index === -1) return null;

  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + searchTerm.length + 100);
  let excerpt = text.slice(start, end).trim();

  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  return excerpt;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
