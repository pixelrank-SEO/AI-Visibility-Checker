export interface ScanProgress {
  status: string;
  progress: number;
  currentStep: string | null;
}

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  status: string;
  progress: number;
  currentStep: string | null;
  websiteTitle: string | null;
  websiteDescription: string | null;
  industry: string | null;
  keywords: string[];
  overallScore: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  platformResults: PlatformResultData[];
  queries: QueryData[];
}

export interface PlatformResultData {
  id: string;
  platform: string;
  score: number;
  totalQueries: number;
  mentionCount: number;
  citationCount: number;
}

export interface QueryData {
  id: string;
  text: string;
  keyword: string;
  region: string;
  regionLabel: string;
  category: string | null;
  responses: ResponseData[];
}

export interface ResponseData {
  id: string;
  platform: string;
  responseText: string;
  mentioned: boolean;
  mentionType: string | null;
  mentionExcerpt: string | null;
  citationUrl: string | null;
  confidence: number | null;
}
