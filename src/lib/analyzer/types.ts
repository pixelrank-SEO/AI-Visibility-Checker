export interface MentionAnalysis {
  mentioned: boolean;
  mentionType: "DIRECT_CITATION" | "BRAND_MENTION" | "RECOMMENDATION" | "PASSING_REFERENCE" | "NOT_MENTIONED";
  confidence: number;
  excerpt: string | null;
  citationUrl: string | null;
}

export interface PlatformScore {
  score: number;
  totalQueries: number;
  mentionCount: number;
  citationCount: number;
}
