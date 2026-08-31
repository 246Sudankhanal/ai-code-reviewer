"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Folders,
  GitPullRequest,
  Lightning,
  Plugs,
  Sparkle,
} from "@phosphor-icons/react";

import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import type { DashboardOverview } from "@/features/dashboard/server/get-overview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function prTone(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "reviewed") return "success";
  if (status === "processing") return "info";
  if (status === "pending" || status === "rate_limited") return "warning";
  return "neutral";
}

function syncTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "synced") return "success";
  if (status === "syncing") return "info";
  if (status === "failed") return "danger";
  return "warning";
}

export function OverviewContent({
  overview,
}: {
  overview: DashboardOverview;
}) {
  if (!overview.connected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
          <Plugs className="mx-auto mb-3 size-8 text-primary" />
          <h2 className="font-heading text-2xl">Connect GitHub to start</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Install the GitHub App to index repositories, stream pull requests,
            and run AI reviews.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link href={DASHBOARD_ROUTES.github} prefetch />}
          >
            Open GitHub App
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Repositories",
      value: overview.repoCount,
      hint: `${overview.syncedRepoCount} indexed`,
      icon: Folders,
    },
    {
      label: "Pull requests",
      value: overview.prTotal,
      hint: `${overview.prPending + overview.prProcessing} in flight`,
      icon: GitPullRequest,
    },
    {
      label: "Reviewed",
      value: overview.prReviewed,
      hint: "All-time AI reviews",
      icon: Sparkle,
    },
    {
      label: "This month",
      value: overview.reviewsThisMonth,
      hint:
        overview.reviewLimit === null
          ? "Unlimited Pro"
          : `${overview.reviewLimit} free cap`,
      icon: Lightning,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="min-h-28">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-1 font-heading text-3xl tracking-tight">
                    {stat.value}
                  </CardTitle>
                </div>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent syncs</CardTitle>
            <CardDescription>
              Latest codebase index jobs for this installation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentSyncs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sync activity yet. Open Repositories and index a codebase.
              </p>
            ) : (
              overview.recentSyncs.map((sync) => (
                <div
                  key={sync.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{sync.repoFullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sync.branch} · {sync.chunkCount} chunks ·{" "}
                      {formatDistanceToNow(new Date(sync.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span className={statusBadge(syncTone(sync.status))}>
                    {sync.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Latest pull requests</CardTitle>
                <CardDescription>
                  Review pipeline for{" "}
                  {overview.accountLogin
                    ? `@${overview.accountLogin}`
                    : "this workspace"}
                  .
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={DASHBOARD_ROUTES.pullRequests} prefetch />
                }
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentPullRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pull requests recorded yet. Open or update a PR in a
                connected repo.
              </p>
            ) : (
              overview.recentPullRequests.map((pr) => (
                <a
                  key={pr.id}
                  href={`https://github.com/${pr.repoFullName}/pull/${pr.prNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2 surface-hover hover:border-primary/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{pr.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {pr.repoFullName}#{pr.prNumber}
                      {pr.authorLogin ? ` · @${pr.authorLogin}` : ""}
                    </p>
                  </div>
                  <span className={statusBadge(prTone(pr.status))}>
                    {pr.status.replace("_", " ")}
                  </span>
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
