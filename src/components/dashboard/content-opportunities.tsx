"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { analyzeOpportunities, type ContentOpportunity } from "@/lib/analyzer/opportunities";
import type { QueryData } from "@/types/scan";

interface ContentOpportunitiesProps {
  queries: QueryData[];
  domain: string;
  scrapedKeywords: string[];
}

const priorityConfig: Record<string, {
  variant: "destructive" | "secondary" | "outline";
  icon: typeof AlertTriangle;
  label: string;
}> = {
  high: { variant: "destructive", icon: AlertTriangle, label: "High Priority" },
  medium: { variant: "secondary", icon: Target, label: "Medium" },
  low: { variant: "outline", icon: Lightbulb, label: "Suggestion" },
};

function OpportunityCard({ opportunity }: { opportunity: ContentOpportunity }) {
  const config = priorityConfig[opportunity.priority];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={config.variant}>{config.label}</Badge>
            <span className="font-medium text-sm">{opportunity.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{opportunity.description}</p>
          <div className="rounded-md bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">{opportunity.suggestedAction}</p>
          </div>
          {opportunity.competitors && opportunity.competitors.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Competitors visible:</span>
              {opportunity.competitors.map((c) => (
                <Badge key={c} variant="outline" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContentOpportunities({ queries, domain, scrapedKeywords }: ContentOpportunitiesProps) {
  const opportunities = analyzeOpportunities(queries, domain, scrapedKeywords);

  const highCount = opportunities.filter((o) => o.priority === "high").length;
  const mediumCount = opportunities.filter((o) => o.priority === "medium").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Content Opportunities
        </CardTitle>
        <CardDescription>
          {opportunities.length > 0 ? (
            <>
              {opportunities.length} opportunities found
              {highCount > 0 && ` (${highCount} high priority)`}
              {mediumCount > 0 && `, ${mediumCount} medium`}
            </>
          ) : (
            "No gaps detected - your AI visibility is strong!"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {opportunities.length > 0 ? (
          <div className="space-y-4">
            {opportunities.map((opp, i) => (
              <OpportunityCard key={i} opportunity={opp} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            Your site is well-represented across AI platforms. Keep creating quality content!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
