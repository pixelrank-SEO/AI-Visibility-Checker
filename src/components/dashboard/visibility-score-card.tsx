import { Card, CardContent } from "@/components/ui/card";
import { cn, getScoreColor } from "@/lib/utils";

interface VisibilityScoreCardProps {
  score: number;
  domain: string;
  industry: string | null;
}

export function VisibilityScoreCard({
  score,
  domain,
  industry,
}: VisibilityScoreCardProps) {
  const roundedScore = Math.round(score);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
        <p className="text-sm text-muted-foreground">Overall AI Visibility Score</p>
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle
              className="text-muted/30"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
            />
            <circle
              className={cn(
                score >= 70
                  ? "text-green-500"
                  : score >= 40
                    ? "text-yellow-500"
                    : "text-red-500"
              )}
              strokeWidth="10"
              strokeDasharray={`${(roundedScore / 100) * 314} 314`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={cn("text-4xl font-bold", getScoreColor(score))}>
              {roundedScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold">{domain}</p>
          {industry && (
            <p className="text-sm text-muted-foreground">{industry}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
