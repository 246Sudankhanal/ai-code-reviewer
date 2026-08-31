import { DashboardPageSkeleton } from "@/features/dashboard/components/page-skeleton";

export default function GithubLoading() {
  return (
    <DashboardPageSkeleton
      title="GitHub App"
      description="Install or disconnect the reviewer app on your GitHub account."
      rows={3}
    />
  );
}
