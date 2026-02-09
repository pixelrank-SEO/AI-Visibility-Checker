"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScanProgress } from "@/hooks/use-scan-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SCAN_STEPS } from "@/lib/constants";
import {
  Globe,
  Sparkles,
  Send,
  BarChart3,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const STEP_ICONS: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Send: <Send className="h-5 w-5" />,
  BarChart: <BarChart3 className="h-5 w-5" />,
  CheckCircle: <CheckCircle className="h-5 w-5" />,
};

export function ScanProgress({ scanId }: { scanId: string }) {
  const { data, isComplete, error } = useScanProgress(scanId);
  const router = useRouter();

  useEffect(() => {
    if (isComplete && data?.status === "COMPLETED") {
      // Small delay then refresh to load dashboard
      const timeout = setTimeout(() => {
        router.refresh();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, data?.status, router]);

  const currentStatus = data?.status || "PENDING";
  const progress = data?.progress || 0;
  const currentStep = data?.currentStep || "Initializing scan...";

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Scanning in Progress</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{currentStep}</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {SCAN_STEPS.map((step) => {
              const stepIndex = SCAN_STEPS.findIndex((s) => s.key === step.key);
              const currentIndex = SCAN_STEPS.findIndex(
                (s) => s.key === currentStatus
              );
              const isActive = step.key === currentStatus;
              const isDone = stepIndex < currentIndex || currentStatus === "COMPLETED";
              const isPending = stepIndex > currentIndex && currentStatus !== "COMPLETED";

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                    isActive
                      ? "bg-primary/5 text-primary"
                      : isDone
                        ? "text-muted-foreground"
                        : "text-muted-foreground/40"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isDone ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="text-muted-foreground/40">
                        {STEP_ICONS[step.icon]}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isPending ? "text-muted-foreground/40" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
