"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_NAMES, PLATFORM_COLORS } from "@/lib/constants";
import type { PlatformResultData } from "@/types/scan";

interface PlatformBarChartProps {
  platformResults: PlatformResultData[];
}

export function PlatformBarChart({ platformResults }: PlatformBarChartProps) {
  const data = platformResults.map((r) => ({
    name: PLATFORM_NAMES[r.platform] || r.platform,
    score: Math.round(r.score),
    platform: r.platform,
    mentions: r.mentionCount,
    citations: r.citationCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Score">
                {data.map((entry) => (
                  <Cell
                    key={entry.platform}
                    fill={PLATFORM_COLORS[entry.platform] || "#888"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
