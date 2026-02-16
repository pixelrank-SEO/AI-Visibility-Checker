import axios from "axios";
import { parseHtml } from "./html-parser";
import { extractKeywordsFromContent } from "./keyword-extractor";
import type { ScrapedData } from "./types";
import { extractDomain } from "@/lib/utils";

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    timeout: 30000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    validateStatus: (status) => status < 400,
  });

  const html = response.data;
  const parsed = parseHtml(html);
  const domain = extractDomain(url);
  const extracted = extractKeywordsFromContent(parsed, domain);

  return {
    url,
    domain,
    title: parsed.title,
    description: parsed.description,
    headings: parsed.headings,
    bodyText: parsed.bodyText,
    metaKeywords: parsed.metaKeywords,
    industry: extracted.industry,
    keywords: extracted.keywords,
    services: extracted.services,
  };
}
