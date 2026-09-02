import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { getInstallationStatus } from "@/features/github/server/installation";
import { listPullRequests } from "@/features/reviews/server/list-pull-requests";
import { PullRequestList } from "@/features/reviews/components/pull-request-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pull requests",
};

export default async function DashboardPullRequestsPage() {
  const session = await requireAuth();
  const installation = await getInstallationStatus(session.user.id);

  const header = (
    <DashboardHeader
      title="Pull requests"
      description="Pipeline status and the latest summary. Open a row on GitHub for Files changed (inline) and the review on Conversation."
    />
  );

  if (!installation.connected) {
    return (
      <>
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Install the GitHub App first to stream pull request reviews.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={DASHBOARD_ROUTES.github} prefetch />}
          >
            Go to GitHub App
          </Button>
        </div>
      </>
    );
  }

  const pullRequests = await listPullRequests(session.user.id);

  return (
    <>
      {header}
      <PullRequestList initialData={pullRequests} />
    </>
  );
}
