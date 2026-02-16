import type { QueryData } from "@/types/scan";

export interface DiscoveredKeyword {
  keyword: string;
  frequency: number;
  platforms: string[];
  sampleContext: string;
}

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there",
  "their", "what", "so", "up", "out", "if", "about", "who", "get",
  "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "into", "year", "your", "some",
  "could", "them", "see", "other", "than", "then", "now", "also",
  "back", "after", "use", "how", "our", "work", "first", "well",
  "way", "even", "new", "want", "any", "these", "been", "has",
  "more", "was", "were", "are", "is", "its", "most", "such",
  "here", "where", "may", "should", "does", "did", "very",
  "including", "however", "while", "both", "through", "between",
  "many", "those", "several", "various", "based", "using",
  "provide", "provides", "offering", "offers", "known", "often",
  "also", "such", "well", "being", "over", "other", "each",
]);

/**
 * Discover keywords from AI responses that mention the target domain.
 * Extracts terms AI platforms associate with the brand beyond scraped keywords.
 */
export function discoverKeywordsFromResponses(
  queries: QueryData[],
  domain: string,
  scrapedKeywords: string[]
): DiscoveredKeyword[] {
  const scrapedSet = new Set(scrapedKeywords.map((k) => k.toLowerCase()));
  const domainBase = domain.toLowerCase().replace(/\.(com|org|net|io|au|co|uk).*$/, "");

  // Track keyword frequency and context across all mentioned responses
  const keywordMap = new Map<string, { count: number; platforms: Set<string>; context: string }>();

  for (const query of queries) {
    for (const response of query.responses) {
      if (!response.mentioned || response.responseText.startsWith("Error:")) continue;

      // Get text around the mention or the full excerpt
      const text = response.mentionExcerpt || response.responseText.slice(0, 500);
      const words = text.toLowerCase().match(/\b[a-z]{3,25}\b/g) || [];

      // Extract meaningful single words
      for (const word of words) {
        if (
          STOP_WORDS.has(word) ||
          word === domainBase ||
          domain.includes(word) ||
          word.length < 4
        ) continue;

        if (!keywordMap.has(word)) {
          keywordMap.set(word, { count: 0, platforms: new Set(), context: text.slice(0, 150) });
        }
        const entry = keywordMap.get(word)!;
        entry.count++;
        entry.platforms.add(response.platform);
      }

      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i + 1];
        if (
          !STOP_WORDS.has(w1) && !STOP_WORDS.has(w2) &&
          w1.length > 2 && w2.length > 2 &&
          !domain.includes(w1) && !domain.includes(w2)
        ) {
          const phrase = `${w1} ${w2}`;
          if (!keywordMap.has(phrase)) {
            keywordMap.set(phrase, { count: 0, platforms: new Set(), context: text.slice(0, 150) });
          }
          const entry = keywordMap.get(phrase)!;
          entry.count++;
          entry.platforms.add(response.platform);
        }
      }
    }
  }

  // Filter out scraped keywords and low-frequency terms
  const discovered: DiscoveredKeyword[] = [];
  for (const [keyword, data] of keywordMap) {
    if (scrapedSet.has(keyword)) continue;
    if (data.count < 2) continue; // Must appear at least twice

    discovered.push({
      keyword,
      frequency: data.count,
      platforms: Array.from(data.platforms),
      sampleContext: data.context,
    });
  }

  // Sort by frequency descending, take top 15
  return discovered
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);
}
