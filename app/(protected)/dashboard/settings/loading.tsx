import { DashboardPageSkeleton } from "@/features/dashboard/components/page-skeleton";

export default function SettingsLoading() {
  return (
    <DashboardPageSkeleton
      title="Settings"
      description="Manage your profile and subscription."
      rows={4}
    />
  );
}
