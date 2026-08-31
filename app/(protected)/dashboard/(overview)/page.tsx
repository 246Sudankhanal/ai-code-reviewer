import type { Metadata } from "next";
import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { OverviewContent } from "@/features/dashboard/components/overview-content";
import { getDashboardOverview } from "@/features/dashboard/server/get-overview";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const overview = await getDashboardOverview(session.user.id);

  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Workspace health, syncs, and recent reviews."
      />
      <OverviewContent overview={overview} />
    </>
  );
}
