import { MENTION_WEIGHTS, PLATFORM_WEIGHTS } from "@/lib/constants";
import type { PlatformScore } from "./types";

interface ResponseForScoring {
  mentioned: boolean;
  mentionType: string | null;
  confidence: number | null;
}

export function calculatePlatformScore(responses: ResponseForScoring[]): PlatformScore {
  const totalQueries = responses.length;
  if (totalQueries === 0) {
    return { score: 0, totalQueries: 0, mentionCount: 0, citationCount: 0 };
  }

  const mentionCount = responses.filter((r) => r.mentioned).length;
  const citationCount = responses.filter(
    (r) => r.mentionType === "DIRECT_CITATION"
  ).length;

  const weightedSum = responses.reduce((sum, r) => {
    const weight = MENTION_WEIGHTS[r.mentionType || "NOT_MENTIONED"] || 0;
    const confidence = r.confidence ?? 1;
    return sum + weight * confidence;
  }, 0);

  const score = Math.round((weightedSum / totalQueries) * 100);

  return { score, totalQueries, mentionCount, citationCount };
}

export function calculateOverallScore(
  platformScores: { platform: string; score: number }[]
): number {
  if (platformScores.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const ps of platformScores) {
    const weight = PLATFORM_WEIGHTS[ps.platform] || 0.25;
    weightedSum += ps.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}
