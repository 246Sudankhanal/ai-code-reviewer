import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex min-h-svh flex-col gap-8 px-6 py-16">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-16 w-full max-w-xl" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-10 w-44 rounded-lg" />
    </div>
  );
}
