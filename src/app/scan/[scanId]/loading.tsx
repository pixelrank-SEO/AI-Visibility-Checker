import { Skeleton } from "@/components/ui/skeleton";

export default function ScanLoading() {
  return (
    <div className="container max-w-2xl mx-auto py-16 px-4 space-y-6">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-3 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
