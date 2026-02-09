import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QueryData } from "@/types/scan";

interface RegionalHeatmapProps {
  queries: QueryData[];
}

interface RegionStats {
  regionLabel: string;
  totalQueries: number;
  mentions: number;
  citations: number;
  score: number;
}

export function RegionalHeatmap({ queries }: RegionalHeatmapProps) {
  // Aggregate by region
  const regionMap = new Map<string, RegionStats>();

  for (const query of queries) {
    const existing = regionMap.get(query.region) || {
      regionLabel: query.regionLabel,
      totalQueries: 0,
      mentions: 0,
      citations: 0,
      score: 0,
    };

    existing.totalQueries++;

    for (const response of query.responses) {
      if (response.mentioned) {
        existing.mentions++;
      }
      if (response.mentionType === "DIRECT_CITATION") {
        existing.citations++;
      }
    }

    regionMap.set(query.region, existing);
  }

  // Calculate scores
  const regions = Array.from(regionMap.entries()).map(([code, stats]) => {
    const totalResponses = stats.totalQueries; // approximate
    const score =
      totalResponses > 0 ? Math.round((stats.mentions / Math.max(totalResponses, 1)) * 100) : 0;
    return { code, ...stats, score };
  });

  // Sort by score descending
  regions.sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Visibility</CardTitle>
        <CardDescription>How your brand performs across different regions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground px-3 py-2">
            <div className="col-span-2">Region</div>
            <div>Queries</div>
            <div>Mentions</div>
            <div>Score</div>
          </div>
          {/* Rows */}
          {regions.map((region) => (
            <div
              key={region.code}
              className="grid grid-cols-5 gap-4 items-center rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <div className="col-span-2 font-medium text-sm">
                {region.regionLabel}
              </div>
              <div className="text-sm text-muted-foreground">
                {region.totalQueries}
              </div>
              <div className="text-sm">
                {region.mentions > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {region.mentions}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </div>
              <div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    region.score >= 70
                      ? "text-green-500"
                      : region.score >= 40
                        ? "text-yellow-500"
                        : "text-red-500"
                  )}
                >
                  {region.score}%
                </span>
              </div>
            </div>
          ))}
          {regions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No regional data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
