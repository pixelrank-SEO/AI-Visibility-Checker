"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAMES } from "@/lib/constants";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { QueryData } from "@/types/scan";

interface CitationDetailsProps {
  queries: QueryData[];
}

export function CitationDetails({ queries }: CitationDetailsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Collect all responses where the site was mentioned
  const mentions = queries.flatMap((query) =>
    query.responses
      .filter((r) => r.mentioned)
      .map((r) => ({
        ...r,
        queryText: query.text,
        keyword: query.keyword,
        region: query.regionLabel,
      }))
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const mentionTypeLabels: Record<string, string> = {
    DIRECT_CITATION: "Direct Citation",
    RECOMMENDATION: "Recommendation",
    BRAND_MENTION: "Brand Mention",
    PASSING_REFERENCE: "Passing Reference",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citation Details</CardTitle>
        <CardDescription>
          {mentions.length} mention{mentions.length !== 1 ? "s" : ""} found
          across all AI platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mentions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No mentions found. Your website was not referenced by any AI platform
            for the tested queries.
          </p>
        ) : (
          <div className="space-y-3">
            {mentions.map((mention) => (
              <div
                key={mention.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {PLATFORM_NAMES[mention.platform] || mention.platform}
                      </Badge>
                      <Badge variant="outline">
                        {mentionTypeLabels[mention.mentionType || ""] ||
                          mention.mentionType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {mention.region}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Query: &quot;{mention.queryText}&quot;
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(mention.id)}
                  >
                    {expandedIds.has(mention.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {mention.mentionExcerpt && (
                  <p className="text-sm bg-muted/50 rounded p-3 leading-relaxed">
                    {mention.mentionExcerpt}
                  </p>
                )}

                {mention.citationUrl && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    <span>{mention.citationUrl}</span>
                  </div>
                )}

                {expandedIds.has(mention.id) && (
                  <div className="mt-2 text-sm bg-muted/30 rounded p-3 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {mention.responseText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
