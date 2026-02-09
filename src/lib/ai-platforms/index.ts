import type { AIPlatformAdapter } from "./types";
import { OpenAIPlatform } from "./openai-platform";
import { AnthropicPlatform } from "./anthropic-platform";
import { GeminiPlatform } from "./gemini-platform";
import { PerplexityPlatform } from "./perplexity-platform";

const ALL_PLATFORMS: AIPlatformAdapter[] = [
  new OpenAIPlatform(),
  new AnthropicPlatform(),
  new GeminiPlatform(),
  new PerplexityPlatform(),
];

export function getConfiguredPlatforms(): AIPlatformAdapter[] {
  return ALL_PLATFORMS.filter((p) => p.isConfigured());
}

export function getPlatformByKey(key: string): AIPlatformAdapter | undefined {
  return ALL_PLATFORMS.find((p) => p.platformKey === key);
}

export { type AIPlatformAdapter, type PlatformQueryResult } from "./types";
