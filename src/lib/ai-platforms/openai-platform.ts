import OpenAI from "openai";
import type { AIPlatformAdapter, PlatformQueryResult } from "./types";

export class OpenAIPlatform implements AIPlatformAdapter {
  name = "ChatGPT";
  platformKey = "OPENAI";
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async query(prompt: string): Promise<PlatformQueryResult> {
    const client = this.getClient();
    const startTime = Date.now();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      tools: [{ type: "web_search" as never }],
    });

    const latencyMs = Date.now() - startTime;

    // Extract text from output items
    let text = "";
    const citations: string[] = [];

    for (const item of response.output) {
      if (item.type === "message") {
        for (const block of item.content) {
          if (block.type === "output_text") {
            text += block.text || "";
            if ("annotations" in block && Array.isArray(block.annotations)) {
              for (const ann of block.annotations) {
                if (
                  typeof ann === "object" &&
                  ann !== null &&
                  "type" in ann &&
                  ann.type === "url_citation" &&
                  "url" in ann &&
                  typeof ann.url === "string"
                ) {
                  citations.push(ann.url);
                }
              }
            }
          }
        }
      }
    }

    return {
      text,
      citations: [...new Set(citations)],
      tokensUsed: (response.usage as { total_tokens?: number })?.total_tokens || 0,
      latencyMs,
      raw: { id: response.id },
    };
  }
}
