import Anthropic from "@anthropic-ai/sdk";
import type { AIPlatformAdapter, PlatformQueryResult } from "./types";

export class AnthropicPlatform implements AIPlatformAdapter {
  name = "Claude";
  platformKey = "ANTHROPIC";
  private client: Anthropic | null = null;

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }

  async query(prompt: string): Promise<PlatformQueryResult> {
    const client = this.getClient();
    const startTime = Date.now();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Claude doesn't have web search, so no URL citations from search
    // But we can still detect URLs in the response text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const citations = [...new Set(text.match(urlRegex) || [])];

    return {
      text,
      citations,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
      raw: { id: response.id },
    };
  }
}
