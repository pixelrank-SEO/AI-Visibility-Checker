"use client";

import { VisibilityScoreCard } from "./visibility-score-card";
import { PlatformBreakdown } from "./platform-breakdown";
import { RegionalHeatmap } from "./regional-heatmap";
import { KeywordMentionsTable } from "./keyword-mentions-table";
import { CitationDetails } from "./citation-details";
import { PlatformBarChart } from "@/components/charts/platform-bar-chart";
import { KeywordFrequencyChart } from "@/components/charts/keyword-frequency-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe } from "lucide-react";
import type { ScanResult } from "@/types/scan";

interface ScanDashboardProps {
  scan: ScanResult;
}

export function ScanDashboard({ scan }: ScanDashboardProps) {
  const completedDate = scan.completedAt
    ? new Date(scan.completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="container max-w-screen-xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Visibility Report</h1>
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            {scan.domain}
          </Badge>
        </div>
        {completedDate && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Scanned on {completedDate}
          </div>
        )}
        {scan.keywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Keywords:</span>
            {scan.keywords.slice(0, 8).map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs">
                {kw}
              </Badge>
            ))}
            {scan.keywords.length > 8 && (
              <span className="text-xs text-muted-foreground">
                +{scan.keywords.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Score + Platform Cards */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <VisibilityScoreCard
          score={scan.overallScore || 0}
          domain={scan.domain}
          industry={scan.industry}
        />
        <PlatformBreakdown platformResults={scan.platformResults} />
      </div>

      {/* Charts + Tables */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PlatformBarChart platformResults={scan.platformResults} />
            <KeywordFrequencyChart queries={scan.queries} />
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="mt-6">
          <KeywordMentionsTable queries={scan.queries} />
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <RegionalHeatmap queries={scan.queries} />
        </TabsContent>

        <TabsContent value="citations" className="mt-6">
          <CitationDetails queries={scan.queries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
