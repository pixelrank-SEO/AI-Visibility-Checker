"use client";

import { useEffect, useState, useCallback } from "react";

interface ScanProgressData {
  status: string;
  progress: number;
  currentStep: string | null;
  overallScore: number | null;
  errorMessage: string | null;
}

export function useScanProgress(scanId: string) {
  const [data, setData] = useState<ScanProgressData | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const eventSource = new EventSource(`/api/scan/${scanId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const parsed: ScanProgressData = JSON.parse(event.data);
        setData(parsed);

        if (parsed.status === "COMPLETED" || parsed.status === "FAILED") {
          setIsComplete(true);
          if (parsed.errorMessage) {
            setError(parsed.errorMessage);
          }
          eventSource.close();
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // If not yet complete, set an error
      setError("Connection lost. Please refresh the page.");
    };

    return eventSource;
  }, [scanId]);

  useEffect(() => {
    const eventSource = connect();
    return () => eventSource.close();
  }, [connect]);

  return { data, isComplete, error };
}
