"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueryData } from "@/types/scan";

interface KeywordFrequencyChartProps {
  queries: QueryData[];
}

export function KeywordFrequencyChart({ queries }: KeywordFrequencyChartProps) {
  // Count mentions per keyword
  const keywordCounts = new Map<string, { mentions: number; total: number }>();

  for (const query of queries) {
    const existing = keywordCounts.get(query.keyword) || {
      mentions: 0,
      total: 0,
    };
    for (const response of query.responses) {
      existing.total++;
      if (response.mentioned) {
        existing.mentions++;
      }
    }
    keywordCounts.set(query.keyword, existing);
  }

  const data = Array.from(keywordCounts.entries())
    .map(([keyword, stats]) => ({
      keyword,
      mentions: stats.mentions,
      total: stats.total,
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Keywords by Mentions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                type="category"
                dataKey="keyword"
                width={80}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="mentions"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                name="Mentions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
