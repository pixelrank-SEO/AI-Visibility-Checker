import type { QueryData } from "@/types/scan";

export interface ContentOpportunity {
  type: "keyword_gap" | "competitor_present" | "low_visibility_region" | "partial_platform" | "content_suggestion";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  keyword?: string;
  region?: string;
  competitors?: string[];
  suggestedAction: string;
}

/**
 * Analyze scan results to find content opportunities for improving AI visibility.
 */
export function analyzeOpportunities(
  queries: QueryData[],
  domain: string,
  scrapedKeywords: string[]
): ContentOpportunity[] {
  const opportunities: ContentOpportunity[] = [];
  const domainLower = domain.toLowerCase();

  // 1. KEYWORD GAPS — keywords with 0 mentions across all platforms
  const keywordStats = new Map<string, { total: number; mentioned: number }>();
  for (const q of queries) {
    if (!keywordStats.has(q.keyword)) {
      keywordStats.set(q.keyword, { total: 0, mentioned: 0 });
    }
    const stats = keywordStats.get(q.keyword)!;
    for (const r of q.responses) {
      if (r.responseText.startsWith("Error:")) continue;
      stats.total++;
      if (r.mentioned) stats.mentioned++;
    }
  }

  for (const [keyword, stats] of keywordStats) {
    if (keyword === domain) continue; // Skip domain-as-keyword
    if (stats.total > 0 && stats.mentioned === 0) {
      opportunities.push({
        type: "keyword_gap",
        priority: "high",
        title: `Not visible for "${keyword}"`,
        description: `AI platforms were asked ${stats.total} queries about "${keyword}" and never mentioned your site.`,
        keyword,
        suggestedAction: `Create in-depth content targeting "${keyword}" — a comprehensive guide, comparison, or resource page.`,
      });
    }
  }

  // 2. COMPETITOR DETECTION — extract domains from responses where we weren't mentioned
  const competitorCounts = new Map<string, { count: number; keywords: Set<string> }>();
  const urlRegex = /https?:\/\/([a-z0-9][-a-z0-9]*\.)+[a-z]{2,}/gi;
  const domainRegex = /\b([a-z0-9][-a-z0-9]*\.(com|io|org|net|co|ai|app|dev|xyz))\b/gi;

  for (const q of queries) {
    for (const r of q.responses) {
      if (r.mentioned || r.responseText.startsWith("Error:")) continue;

      // Extract URLs
      const urls = r.responseText.match(urlRegex) || [];
      for (const url of urls) {
        try {
          const hostname = new URL(url).hostname.replace(/^www\./, "");
          if (hostname === domainLower || hostname.endsWith("." + domainLower)) continue;
          if (!competitorCounts.has(hostname)) {
            competitorCounts.set(hostname, { count: 0, keywords: new Set() });
          }
          const entry = competitorCounts.get(hostname)!;
          entry.count++;
          entry.keywords.add(q.keyword);
        } catch { /* ignore invalid URLs */ }
      }

      // Extract domain-like patterns from text
      const domainMatches = r.responseText.match(domainRegex) || [];
      for (const match of domainMatches) {
        const d = match.toLowerCase();
        if (d === domainLower || d.endsWith("." + domainLower)) continue;
        if (!competitorCounts.has(d)) {
          competitorCounts.set(d, { count: 0, keywords: new Set() });
        }
        const entry = competitorCounts.get(d)!;
        entry.count++;
        entry.keywords.add(q.keyword);
      }
    }
  }

  // Top competitors by frequency
  const topCompetitors = Array.from(competitorCounts.entries())
    .filter(([, data]) => data.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (topCompetitors.length > 0) {
    const competitorDomains = topCompetitors.map(([d]) => d);
    const topKeywords = [...new Set(topCompetitors.flatMap(([, d]) => Array.from(d.keywords)))].slice(0, 5);

    opportunities.push({
      type: "competitor_present",
      priority: "high",
      title: "Competitors are visible where you're not",
      description: `These competitors appear in AI responses for your keywords: ${competitorDomains.join(", ")}. They're being mentioned for topics like "${topKeywords.join('", "')}".`,
      competitors: competitorDomains,
      suggestedAction: "Analyze what content these competitors have that earns AI mentions, and create better, more comprehensive content on the same topics.",
    });
  }

  // 3. LOW VISIBILITY REGIONS
  const regionStats = new Map<string, { total: number; mentioned: number; label: string }>();
  for (const q of queries) {
    if (!regionStats.has(q.region)) {
      regionStats.set(q.region, { total: 0, mentioned: 0, label: q.regionLabel });
    }
    const stats = regionStats.get(q.region)!;
    for (const r of q.responses) {
      if (r.responseText.startsWith("Error:")) continue;
      stats.total++;
      if (r.mentioned) stats.mentioned++;
    }
  }

  const regionScores = Array.from(regionStats.entries())
    .filter(([, s]) => s.total > 0)
    .map(([region, s]) => ({
      region,
      label: s.label,
      rate: s.mentioned / s.total,
    }));

  const avgRate = regionScores.length > 0
    ? regionScores.reduce((sum, r) => sum + r.rate, 0) / regionScores.length
    : 0;

  for (const rs of regionScores) {
    if (rs.rate < avgRate * 0.5 && avgRate > 0.1) {
      opportunities.push({
        type: "low_visibility_region",
        priority: "medium",
        title: `Low visibility in ${rs.label}`,
        description: `Your mention rate in ${rs.label} is ${Math.round(rs.rate * 100)}%, compared to the average of ${Math.round(avgRate * 100)}%.`,
        region: rs.region,
        suggestedAction: `Create region-specific content for ${rs.label} — local case studies, pricing pages, or service pages targeting this market.`,
      });
    }
  }

  // 4. PARTIAL PLATFORM VISIBILITY
  const platformStats = new Map<string, { mentioned: number; total: number }>();
  for (const q of queries) {
    for (const r of q.responses) {
      if (r.responseText.startsWith("Error:")) continue;
      if (!platformStats.has(r.platform)) {
        platformStats.set(r.platform, { mentioned: 0, total: 0 });
      }
      const stats = platformStats.get(r.platform)!;
      stats.total++;
      if (r.mentioned) stats.mentioned++;
    }
  }

  const platformScores = Array.from(platformStats.entries())
    .filter(([, s]) => s.total > 0)
    .map(([platform, s]) => ({ platform, rate: s.mentioned / s.total }));

  const avgPlatformRate = platformScores.length > 0
    ? platformScores.reduce((sum, p) => sum + p.rate, 0) / platformScores.length
    : 0;

  for (const ps of platformScores) {
    if (ps.rate < avgPlatformRate * 0.3 && avgPlatformRate > 0.1) {
      const platformNames: Record<string, string> = {
        OPENAI: "ChatGPT",
        ANTHROPIC: "Claude",
        GEMINI: "Gemini",
        PERPLEXITY: "Perplexity",
      };
      const name = platformNames[ps.platform] || ps.platform;
      opportunities.push({
        type: "partial_platform",
        priority: "medium",
        title: `Low visibility on ${name}`,
        description: `${name} mentions your site ${Math.round(ps.rate * 100)}% of the time, compared to the average of ${Math.round(avgPlatformRate * 100)}% across platforms.`,
        suggestedAction: `Ensure your content is well-structured with clear headings, facts, and citations that ${name} can easily reference.`,
      });
    }
  }

  // 5. CONTENT TYPE SUGGESTIONS based on failed query categories
  const categoryStats = new Map<string, { total: number; mentioned: number }>();
  for (const q of queries) {
    const cat = q.category || "general";
    if (!categoryStats.has(cat)) {
      categoryStats.set(cat, { total: 0, mentioned: 0 });
    }
    const stats = categoryStats.get(cat)!;
    for (const r of q.responses) {
      if (r.responseText.startsWith("Error:")) continue;
      stats.total++;
      if (r.mentioned) stats.mentioned++;
    }
  }

  const categorySuggestions: Record<string, string> = {
    brand_comparison: "Create detailed comparison pages showing how you stack up against alternatives.",
    brand_evaluation: "Build a reviews/testimonials page and encourage third-party reviews on authoritative sites.",
    recommendation: "Publish case studies and success stories that demonstrate your expertise.",
    problem_solving: "Create how-to guides and solution-focused content addressing common problems.",
    tool_discovery: "List your product on directories and build integration pages with popular tools.",
  };

  for (const [category, stats] of categoryStats) {
    if (stats.total > 0 && stats.mentioned === 0 && categorySuggestions[category]) {
      opportunities.push({
        type: "content_suggestion",
        priority: "low",
        title: `No visibility in "${category.replace(/_/g, " ")}" queries`,
        description: `${stats.total} queries in the "${category.replace(/_/g, " ")}" category returned no mentions of your site.`,
        suggestedAction: categorySuggestions[category],
      });
    }
  }

  // Sort: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
