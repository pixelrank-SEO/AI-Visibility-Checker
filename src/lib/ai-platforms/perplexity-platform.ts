import type { AIPlatformAdapter, PlatformQueryResult } from "./types";

export class PerplexityPlatform implements AIPlatformAdapter {
  name = "Perplexity";
  platformKey = "PERPLEXITY";

  isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY;
  }

  async query(prompt: string): Promise<PlatformQueryResult> {
    const startTime = Date.now();

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    const text = data.choices?.[0]?.message?.content || "";

    // Extract citations from Perplexity's response
    const citations: string[] = [];
    if (data.citations && Array.isArray(data.citations)) {
      citations.push(...data.citations);
    }

    // Also extract URLs from text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const textUrls = text.match(urlRegex) || [];

    return {
      text,
      citations: [...new Set([...citations, ...textUrls])],
      tokensUsed: data.usage?.total_tokens || 0,
      latencyMs,
      raw: { id: data.id },
    };
  }
}
