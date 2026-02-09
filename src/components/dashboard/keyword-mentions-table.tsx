import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_NAMES } from "@/lib/constants";
import type { QueryData } from "@/types/scan";

interface KeywordMentionsTableProps {
  queries: QueryData[];
}

interface KeywordStats {
  keyword: string;
  totalQueries: number;
  platformMentions: Record<string, { mentioned: number; total: number }>;
  bestMentionType: string | null;
}

export function KeywordMentionsTable({ queries }: KeywordMentionsTableProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Analysis</CardTitle>
        <CardDescription>
          Which keywords trigger AI mentions of your brand
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
              {keywords.map((kw) => (
                <tr key={kw.keyword} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 font-medium">{kw.keyword}</td>
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
              ))}
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
  );
}
