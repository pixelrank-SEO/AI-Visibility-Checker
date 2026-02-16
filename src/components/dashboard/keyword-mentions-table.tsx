"use client";

import { useState, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Check, X, Sparkles } from "lucide-react";
import { PLATFORM_NAMES } from "@/lib/constants";
import { discoverKeywordsFromResponses } from "@/lib/analyzer/keyword-discovery";
import type { QueryData } from "@/types/scan";

interface KeywordMentionsTableProps {
  queries: QueryData[];
  scrapedKeywords?: string[];
  domain?: string;
}

interface KeywordStats {
  keyword: string;
  totalQueries: number;
  platformMentions: Record<string, { mentioned: number; total: number }>;
  bestMentionType: string | null;
}

export function KeywordMentionsTable({ queries, scrapedKeywords = [], domain = "" }: KeywordMentionsTableProps) {
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  function toggleExpand(keyword: string) {
    setExpandedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
  }

  // Aggregate by keyword
  const keywordMap = new Map<string, KeywordStats>();

  for (const query of queries) {
    const existing = keywordMap.get(query.keyword) || {
      keyword: query.keyword,
      totalQueries: 0,
      platformMentions: {},
      bestMentionType: null,
    };

    existing.totalQueries++;

    for (const response of query.responses) {
      if (!existing.platformMentions[response.platform]) {
        existing.platformMentions[response.platform] = { mentioned: 0, total: 0 };
      }
      existing.platformMentions[response.platform].total++;
      if (response.mentioned) {
        existing.platformMentions[response.platform].mentioned++;
      }
      if (response.mentionType && response.mentionType !== "NOT_MENTIONED") {
        const mentionPriority: Record<string, number> = {
          DIRECT_CITATION: 4,
          RECOMMENDATION: 3,
          BRAND_MENTION: 2,
          PASSING_REFERENCE: 1,
        };
        const currentPriority = mentionPriority[existing.bestMentionType || ""] || 0;
        const newPriority = mentionPriority[response.mentionType] || 0;
        if (newPriority > currentPriority) {
          existing.bestMentionType = response.mentionType;
        }
      }
    }

    keywordMap.set(query.keyword, existing);
  }

  const keywords = Array.from(keywordMap.values());
  const allPlatforms = [...new Set(queries.flatMap((q) => q.responses.map((r) => r.platform)))];

  const mentionTypeLabels: Record<string, string> = {
    DIRECT_CITATION: "Cited",
    RECOMMENDATION: "Recommended",
    BRAND_MENTION: "Mentioned",
    PASSING_REFERENCE: "Passing",
  };

  const mentionTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
    DIRECT_CITATION: "default",
    RECOMMENDATION: "default",
    BRAND_MENTION: "secondary",
    PASSING_REFERENCE: "outline",
  };

  // Get queries for a specific keyword
  function getQueriesForKeyword(keyword: string) {
    return queries.filter((q) => q.keyword === keyword);
  }

  // Discover AI keywords
  const discoveredKeywords = domain
    ? discoverKeywordsFromResponses(queries, domain, scrapedKeywords)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
          <CardDescription>
            Click a keyword to see the prompts used and per-platform results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Keyword
                  </th>
                  {allPlatforms.map((p) => (
                    <th
                      key={p}
                      className="text-center py-3 px-2 font-medium text-muted-foreground"
                    >
                      {PLATFORM_NAMES[p] || p}
                    </th>
                  ))}
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                    Best Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const isExpanded = expandedKeywords.has(kw.keyword);
                  const keywordQueries = isExpanded ? getQueriesForKeyword(kw.keyword) : [];

                  return (
                    <Fragment key={kw.keyword}>
                      <tr
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleExpand(kw.keyword)}
                      >
                        <td className="py-3 px-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            )}
                            {kw.keyword}
                          </div>
                        </td>
                        {allPlatforms.map((p) => {
                          const pm = kw.platformMentions[p];
                          if (!pm) {
                            return (
                              <td key={p} className="text-center py-3 px-2 text-muted-foreground">
                                -
                              </td>
                            );
                          }
                          return (
                            <td key={p} className="text-center py-3 px-2">
                              {pm.mentioned > 0 ? (
                                <span className="text-green-500 font-medium">
                                  {pm.mentioned}/{pm.total}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  0/{pm.total}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center py-3 px-2">
                          {kw.bestMentionType ? (
                            <Badge variant={mentionTypeVariant[kw.bestMentionType] || "secondary"}>
                              {mentionTypeLabels[kw.bestMentionType] || kw.bestMentionType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not found</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={allPlatforms.length + 2} className="p-0">
                            <div className="bg-muted/30 px-4 py-3 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Prompts used for &quot;{kw.keyword}&quot;:
                              </p>
                              {keywordQueries.map((q) => (
                                <div
                                  key={q.id}
                                  className="flex items-center gap-3 text-xs"
                                >
                                  <span className="flex-1 text-muted-foreground italic truncate">
                                    &quot;{q.text}&quot;
                                  </span>
                                  <div className="flex gap-2 flex-shrink-0">
                                    {allPlatforms.map((p) => {
                                      const resp = q.responses.find((r) => r.platform === p);
                                      if (!resp) return <span key={p} className="w-6 text-center">-</span>;
                                      return (
                                        <span key={p} className="w-6 text-center">
                                          {resp.mentioned ? (
                                            <Check className="h-3.5 w-3.5 text-green-500 inline" />
                                          ) : (
                                            <X className="h-3.5 w-3.5 text-red-400 inline" />
                                          )}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {keywords.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No keyword data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {discoveredKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Discovered Keywords
            </CardTitle>
            <CardDescription>
              Terms AI platforms associate with your brand beyond your website content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {discoveredKeywords.map((dk) => (
                <div
                  key={dk.keyword}
                  className="rounded-lg border p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dk.keyword}</span>
                    <span className="text-xs text-muted-foreground">
                      {dk.frequency}x
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {dk.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {PLATFORM_NAMES[p] || p}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

