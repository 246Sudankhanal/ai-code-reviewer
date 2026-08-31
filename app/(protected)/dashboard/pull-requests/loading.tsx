import { DashboardPageSkeleton } from "@/features/dashboard/components/page-skeleton";

export default function PullRequestsLoading() {
  return (
    <DashboardPageSkeleton
      title="Pull requests"
      description="Review pipeline status across connected repositories."
    />
  );
}
