import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ScanProgress } from "@/components/scan/scan-progress";
import { ScanDashboard } from "@/components/dashboard/scan-dashboard";
import type { ScanResult } from "@/types/scan";

export const dynamic = "force-dynamic";

interface ScanPageProps {
  params: Promise<{ scanId: string }>;
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { scanId } = await params;

  const scan = await db.scan.findUnique({
    where: { id: scanId },
    include: {
      platformResults: true,
      queries: {
        include: {
          responses: {
            select: {
              id: true,
              platform: true,
              responseText: true,
              mentioned: true,
              mentionType: true,
              mentionExcerpt: true,
              citationUrl: true,
              confidence: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!scan) {
    notFound();
  }

  if (scan.status === "COMPLETED") {
    // Serialize for client component
    const serialized: ScanResult = {
      id: scan.id,
      url: scan.url,
      domain: scan.domain,
      status: scan.status,
      progress: scan.progress,
      currentStep: scan.currentStep,
      websiteTitle: scan.websiteTitle,
      websiteDescription: scan.websiteDescription,
      industry: scan.industry,
      keywords: scan.keywords,
      overallScore: scan.overallScore,
      errorMessage: scan.errorMessage,
      startedAt: scan.startedAt?.toISOString() || null,
      completedAt: scan.completedAt?.toISOString() || null,
      createdAt: scan.createdAt.toISOString(),
      platformResults: scan.platformResults.map((r) => ({
        id: r.id,
        platform: r.platform,
        score: r.score,
        totalQueries: r.totalQueries,
        mentionCount: r.mentionCount,
        citationCount: r.citationCount,
      })),
      queries: scan.queries.map((q) => ({
        id: q.id,
        text: q.text,
        keyword: q.keyword,
        region: q.region,
        regionLabel: q.regionLabel,
        category: q.category,
        responses: q.responses.map((r) => ({
          id: r.id,
          platform: r.platform,
          responseText: r.responseText,
          mentioned: r.mentioned,
          mentionType: r.mentionType,
          mentionExcerpt: r.mentionExcerpt,
          citationUrl: r.citationUrl,
          confidence: r.confidence,
        })),
      })),
    };

    return <ScanDashboard scan={serialized} />;
  }

  // Show progress for pending/in-progress/failed scans
  return <ScanProgress scanId={scanId} />;
}
