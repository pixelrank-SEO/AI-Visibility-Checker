import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getScoreColor } from "@/lib/utils";
import { Clock, ArrowRight, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const scans = await db.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      url: true,
      domain: true,
      status: true,
      overallScore: true,
      industry: true,
      createdAt: true,
      completedAt: true,
    },
  });

  const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-500",
    FAILED: "bg-red-500/10 text-red-500",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    SCRAPING: "bg-blue-500/10 text-blue-500",
    GENERATING_QUERIES: "bg-blue-500/10 text-blue-500",
    QUERYING_PLATFORMS: "bg-blue-500/10 text-blue-500",
    ANALYZING: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="container max-w-screen-lg mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Scan History</h1>
          <p className="text-muted-foreground mt-1">
            View all your previous AI visibility scans
          </p>
        </div>

        {scans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Globe className="h-12 w-12 text-muted-foreground/30" />
              <div className="text-center space-y-2">
                <p className="font-medium">No scans yet</p>
                <p className="text-sm text-muted-foreground">
                  Start by checking a website&apos;s AI visibility on the{" "}
                  <Link href="/" className="text-primary underline">
                    home page
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link key={scan.id} href={`/scan/${scan.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {scan.domain}
                          </span>
                          <Badge
                            className={cn(
                              "text-xs",
                              statusColors[scan.status] || ""
                            )}
                            variant="secondary"
                          >
                            {scan.status.toLowerCase().replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                          {scan.industry && <span>{scan.industry}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {scan.overallScore !== null && (
                        <span
                          className={cn(
                            "text-2xl font-bold",
                            getScoreColor(scan.overallScore)
                          )}
                        >
                          {Math.round(scan.overallScore)}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
