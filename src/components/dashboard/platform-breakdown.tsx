import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLATFORM_NAMES, PLATFORM_COLORS } from "@/lib/constants";
import type { PlatformResultData } from "@/types/scan";

interface PlatformBreakdownProps {
  platformResults: PlatformResultData[];
}

export function PlatformBreakdown({ platformResults }: PlatformBreakdownProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {platformResults.map((result) => (
        <Card key={result.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {PLATFORM_NAMES[result.platform] || result.platform}
              </CardTitle>
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: PLATFORM_COLORS[result.platform] || "#888",
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{Math.round(result.score)}</div>
            <Progress
              value={result.score}
              className="h-2"
              indicatorClassName={
                result.score >= 70
                  ? "bg-green-500"
                  : result.score >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {result.mentionCount}/{result.totalQueries} mentions
              </Badge>
              {result.citationCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {result.citationCount} citations
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
