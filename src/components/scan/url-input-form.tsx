"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REGIONS } from "@/lib/constants";

const DEFAULT_REGIONS = REGIONS.slice(0, 5).map((r) => r.code);

export function UrlInputForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(DEFAULT_REGIONS);
  const router = useRouter();

  function toggleRegion(code: string) {
    setSelectedRegions((prev) =>
      prev.includes(code)
        ? prev.filter((r) => r !== code)
        : [...prev, code]
    );
  }

  const estimatedMinutes = Math.max(1, Math.ceil((selectedRegions.length * 10 * 3) / 60));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    if (selectedRegions.length === 0) {
      setError("Please select at least one region");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), regions: selectedRegions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start scan");
      }

      const data = await response.json();
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 pl-10 text-base"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Check Visibility"
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        Customize regions ({selectedRegions.length} selected)
        {showOptions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showOptions && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Regions to scan</span>
            <span className="text-xs text-muted-foreground">
              Est. ~{estimatedMinutes} min
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REGIONS.map((region) => (
              <label
                key={region.code}
                className="flex items-center gap-2 text-sm cursor-pointer rounded-md p-1.5 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region.code)}
                  onChange={() => toggleRegion(region.code)}
                  className="rounded border-input"
                  disabled={isLoading}
                />
                {region.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegions(REGIONS.map((r) => r.code))}
              className="text-xs text-primary hover:underline"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegions(DEFAULT_REGIONS)}
              className="text-xs text-primary hover:underline"
            >
              Reset to default
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
