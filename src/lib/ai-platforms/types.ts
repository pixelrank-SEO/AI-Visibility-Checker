export interface PlatformQueryResult {
  text: string;
  citations: string[];
  tokensUsed: number;
  latencyMs: number;
  raw: Record<string, unknown>;
}

export interface AIPlatformAdapter {
  name: string;
  platformKey: string;
  isConfigured(): boolean;
  query(prompt: string): Promise<PlatformQueryResult>;
}
