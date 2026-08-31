import { Skeleton } from "@/components/ui/skeleton";

export default function SignInLoading() {
  return (
    <div className="w-full max-w-sm space-y-4 rounded-xl border border-border/80 p-6">
      <Skeleton className="mx-auto size-24 rounded-xl" />
      <Skeleton className="mx-auto h-4 w-32" />
      <Skeleton className="mx-auto h-3 w-48" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
