import { REGIONS } from "@/lib/constants";
import type { ScrapedData } from "@/lib/scraper/types";
import { QUERY_TEMPLATES } from "./templates";
import type { GeneratedQuery } from "./types";

export function generateQueries(
  scrapedData: ScrapedData,
  maxQueriesPerRegion: number = 7
): GeneratedQuery[] {
  const queries: GeneratedQuery[] = [];
  const topKeywords = scrapedData.keywords.slice(0, 5);

  // Use a subset of regions: global + 4 key regions to keep API costs manageable
  const activeRegions = REGIONS.slice(0, 5);

  for (const region of activeRegions) {
    let regionQueryCount = 0;

    for (const template of QUERY_TEMPLATES) {
      if (regionQueryCount >= maxQueriesPerRegion) break;

      if (template.requiresDomain && !template.requiresKeyword) {
        // Brand awareness query - only use for global
        if (region.code !== "global") continue;

        const text = template.template
          .replace("{domain}", scrapedData.domain)
          .replace("{region}", region.suffix)
          .trim();

        queries.push({
          text,
          keyword: scrapedData.domain,
          region: region.code,
          regionLabel: region.label,
          category: template.category,
        });
        regionQueryCount++;
        continue;
      }

      for (const keyword of topKeywords) {
        if (regionQueryCount >= maxQueriesPerRegion) break;

        let text = template.template
          .replace("{keyword}", keyword)
          .replace("{domain}", scrapedData.domain)
          .replace("{region}", region.suffix)
          .trim();

        // Clean up double spaces
        text = text.replace(/\s+/g, " ").trim();

        queries.push({
          text,
          keyword,
          region: region.code,
          regionLabel: region.label,
          category: template.category,
        });
        regionQueryCount++;
      }
    }
  }

  return queries;
}
