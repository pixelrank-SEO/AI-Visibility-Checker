import * as cheerio from "cheerio";

export interface ParsedHtml {
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
  metaKeywords: string[];
  ogTags: Record<string, string>;
}

export function parseHtml(html: string): ParsedHtml {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, iframe, noscript").remove();

  const title = $("title").first().text().trim() || "";

  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 2 && text.length < 200) {
      headings.push(text);
    }
  });

  const metaKeywordsRaw = $('meta[name="keywords"]').attr("content") || "";
  const metaKeywords = metaKeywordsRaw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const ogTags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr("property") || "";
    const content = $(el).attr("content") || "";
    if (property && content) {
      ogTags[property.replace("og:", "")] = content;
    }
  });

  // Extract body text, clean and truncate
  let bodyText = $("body").text();
  bodyText = bodyText
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 5000);

  return {
    title,
    description,
    headings: headings.slice(0, 20),
    bodyText,
    metaKeywords: metaKeywords.slice(0, 20),
    ogTags,
  };
}
