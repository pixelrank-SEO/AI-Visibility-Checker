import { db } from "@/lib/db";
import { scrapeWebsite } from "@/lib/scraper";
import { generateQueries } from "@/lib/query-generator";
import { getConfiguredPlatforms } from "@/lib/ai-platforms";
import { detectMention, calculatePlatformScore, calculateOverallScore } from "@/lib/analyzer";
import type { AIPlatform, ScanStatus } from "@prisma/client";

async function updateProgress(
  scanId: string,
  status: ScanStatus,
  progress: number,
  currentStep: string
) {
  await db.scan.update({
    where: { id: scanId },
    data: { status, progress, currentStep },
  });
}

export async function runScanEngine(scanId: string): Promise<void> {
  try {
    const scan = await db.scan.findUniqueOrThrow({ where: { id: scanId } });

    await db.scan.update({
      where: { id: scanId },
      data: { startedAt: new Date() },
    });

    // Step 1: Scrape the website
    await updateProgress(scanId, "SCRAPING", 5, "Analyzing website content...");
    const scrapedData = await scrapeWebsite(scan.url);

    await db.scan.update({
      where: { id: scanId },
      data: {
        websiteTitle: scrapedData.title,
        websiteDescription: scrapedData.description,
        industry: scrapedData.industry,
        keywords: scrapedData.keywords,
      },
    });

    // Step 2: Generate queries
    await updateProgress(scanId, "GENERATING_QUERIES", 15, "Generating search queries...");
    const selectedRegions = scan.selectedRegions.length > 0 ? scan.selectedRegions : undefined;
    const generatedQueries = generateQueries(scrapedData, 10, selectedRegions);

    if (generatedQueries.length === 0) {
      throw new Error("Could not generate any queries from website content");
    }

    // Bulk create queries in DB
    await db.query.createMany({
      data: generatedQueries.map((q) => ({
        scanId,
        text: q.text,
        keyword: q.keyword,
        region: q.region,
        regionLabel: q.regionLabel,
        category: q.category,
      })),
    });

    // Step 3: Query all AI platforms
    await updateProgress(scanId, "QUERYING_PLATFORMS", 20, "Querying AI platforms...");
    const platforms = getConfiguredPlatforms();

    if (platforms.length === 0) {
      throw new Error(
        "No AI platforms configured. Please add at least one API key to .env.local"
      );
    }

    const dbQueries = await db.query.findMany({ where: { scanId } });
    let completedPairs = 0;
    const totalPairs = dbQueries.length * platforms.length;

    for (const query of dbQueries) {
      const platformPromises = platforms.map(async (platform) => {
        try {
          const result = await platform.query(query.text);

          await db.platformResponse.create({
            data: {
              queryId: query.id,
              platform: platform.platformKey as AIPlatform,
              responseText: result.text,
              tokensUsed: result.tokensUsed,
              latencyMs: result.latencyMs,
              rawResponse: JSON.parse(JSON.stringify({ ...result.raw, citations: result.citations })),
            },
          });
        } catch (error) {
          // Log error but don't fail the entire scan
          console.error(
            `Error querying ${platform.name} for query "${query.text}":`,
            error
          );

          await db.platformResponse.create({
            data: {
              queryId: query.id,
              platform: platform.platformKey as AIPlatform,
              responseText: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              mentioned: false,
              mentionType: "NOT_MENTIONED",
              confidence: 0,
            },
          });
        }

        completedPairs++;
        const progress = 20 + Math.round((completedPairs / totalPairs) * 55);
        await updateProgress(
          scanId,
          "QUERYING_PLATFORMS",
          progress,
          `Queried ${completedPairs}/${totalPairs} platform responses...`
        );
      });

      // Query all platforms in parallel for each query
      await Promise.allSettled(platformPromises);
    }

    // Step 4: Analyze all responses
    await updateProgress(scanId, "ANALYZING", 80, "Analyzing AI responses...");
    const allResponses = await db.platformResponse.findMany({
      where: { query: { scanId } },
      include: { query: true },
    });

    for (const response of allResponses) {
      if (response.responseText.startsWith("Error:")) continue;

      // Extract citations stored during platform query step
      const raw = response.rawResponse as Record<string, unknown> | null;
      const citations = Array.isArray(raw?.citations) ? (raw.citations as string[]) : [];
      const analysis = detectMention(
        response.responseText,
        scan.url,
        scan.domain,
        citations
      );

      await db.platformResponse.update({
        where: { id: response.id },
        data: {
          mentioned: analysis.mentioned,
          mentionType: analysis.mentionType,
          mentionExcerpt: analysis.excerpt,
          citationUrl: analysis.citationUrl,
          confidence: analysis.confidence,
        },
      });
    }

    // Step 5: Calculate aggregate scores
    await updateProgress(scanId, "ANALYZING", 90, "Calculating visibility scores...");

    const platformKeys = [...new Set(allResponses.map((r) => r.platform))];
    const platformScores: { platform: string; score: number }[] = [];

    for (const platformKey of platformKeys) {
      // Re-fetch to get updated mention data
      const updatedResponses = await db.platformResponse.findMany({
        where: {
          query: { scanId },
          platform: platformKey,
        },
      });

      const score = calculatePlatformScore(updatedResponses);

      await db.platformResult.create({
        data: {
          scanId,
          platform: platformKey,
          score: score.score,
          totalQueries: score.totalQueries,
          mentionCount: score.mentionCount,
          citationCount: score.citationCount,
        },
      });

      platformScores.push({ platform: platformKey, score: score.score });
    }

    const overallScore = calculateOverallScore(platformScores);

    // Step 6: Mark as completed
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        progress: 100,
        currentStep: "Scan complete",
        overallScore,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error);
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        currentStep: "Scan failed",
      },
    });
  }
}
