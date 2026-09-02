import { DashboardPageSkeleton } from "@/features/dashboard/components/page-skeleton";

export default function PullRequestsLoading() {
  return (
    <DashboardPageSkeleton
      title="Pull requests"
      description="Pipeline status and the latest summary. Open a row on GitHub for Files changed (inline) and the review on Conversation."
    />
  );
}
