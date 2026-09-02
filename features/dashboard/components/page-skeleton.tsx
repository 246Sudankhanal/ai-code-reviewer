import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

type DashboardPageSkeletonProps = {
  title: string;
  description: string;
  rows?: number;
};

export function DashboardPageSkeleton({
  title,
  description,
  rows = 6,
}: DashboardPageSkeletonProps) {
  return (
    <>
      <DashboardHeader title={title} description={description} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full max-w-xs" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
              <Skeleton className="hidden h-3 w-20 md:block" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Workspace health, syncs, and recent reviews."
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </>
  );
}
