import { DashboardPageSkeleton } from "@/features/dashboard/components/page-skeleton";

export default function ReposLoading() {
  return (
    <DashboardPageSkeleton
      title="Repositories"
      description="All public and private repositories available to the GitHub App."
    />
  );
}
