import { GoogleGenAI } from "@google/genai";
import type { AIPlatformAdapter, PlatformQueryResult } from "./types";

export class GeminiPlatform implements AIPlatformAdapter {
  name = "Gemini";
  platformKey = "GEMINI";
  private client: GoogleGenAI | null = null;

  isConfigured(): boolean {
    return !!process.env.GOOGLE_GEMINI_API_KEY;
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
      });
    }
    return this.client;
  }

  async query(prompt: string): Promise<PlatformQueryResult> {
    const client = this.getClient();
    const startTime = Date.now();

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const latencyMs = Date.now() - startTime;

    const text = response.text || "";

    // Extract citations from grounding metadata
    const citations: string[] = [];
    const candidates = response.candidates;
    if (candidates) {
      for (const candidate of candidates) {
        const metadata = candidate.groundingMetadata;
        if (metadata?.groundingChunks) {
          for (const chunk of metadata.groundingChunks) {
            if (chunk.web?.uri) {
              citations.push(chunk.web.uri);
            }
          }
        }
      }
    }

    // Also extract URLs from text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const textUrls = text.match(urlRegex) || [];

    return {
      text,
      citations: [...new Set([...citations, ...textUrls])],
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      latencyMs,
      raw: {},
    };
  }
}
