"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowSquareOut, GitPullRequest } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import { pullRequestsQuery } from "@/features/reviews/lib/prs-query";
import type { ListedPullRequest } from "@/features/reviews/server/list-pull-requests";

type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "reviewed"
  | "failed"
  | "rate_limited";

function toneForStatus(
  status: string
): "success" | "warning" | "info" | "danger" | "neutral" {
  if (status === "reviewed") return "success";
  if (status === "processing") return "info";
  if (status === "pending") return "warning";
  if (status === "failed" || status === "rate_limited") return "danger";
  return "neutral";
}

export function PullRequestList({
  initialData,
}: {
  initialData: ListedPullRequest[];
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isPending, isError } = useQuery({
    ...pullRequestsQuery,
    initialData,
    initialDataUpdatedAt: Date.now(),
  });

  const pullRequests = data ?? initialData;

  const counts = useMemo(() => {
    return {
      all: pullRequests.length,
      pending: pullRequests.filter((pr) => pr.status === "pending").length,
      processing: pullRequests.filter((pr) => pr.status === "processing").length,
      reviewed: pullRequests.filter((pr) => pr.status === "reviewed").length,
      failed: pullRequests.filter((pr) => pr.status === "failed").length,
      rate_limited: pullRequests.filter((pr) => pr.status === "rate_limited")
        .length,
    };
  }, [pullRequests]);

  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return pullRequests.filter((pr) => {
      if (filter !== "all" && pr.status !== filter) {
        return false;
      }
      if (
        query &&
        !`${pr.title} ${pr.repoFullName} ${pr.authorLogin ?? ""}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [pullRequests, filter, search]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="processing">
              Live ({counts.processing})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({counts.reviewed})
            </TabsTrigger>
            <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>
            <TabsTrigger value="rate_limited">
              Limited ({counts.rate_limited})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search title, repo, or author…"
          className="max-w-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="glass-panel overflow-hidden rounded-xl">
        {isPending && pullRequests.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading pull requests…
          </p>
        ) : isError && pullRequests.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Failed to load pull requests.
          </p>
        ) : visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No pull requests match this filter.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {visible.map((pr) => (
              <li key={pr.id}>
                <a
                  href={`https://github.com/${pr.repoFullName}/pull/${pr.prNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface-hover flex items-start gap-3 px-4 py-3 hover:bg-primary/5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GitPullRequest className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{pr.title}</p>
                      <span className={statusBadge(toneForStatus(pr.status))}>
                        {pr.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pr.repoFullName}#{pr.prNumber} · {pr.baseBranch}
                      {pr.authorLogin ? ` · @${pr.authorLogin}` : ""} ·{" "}
                      {formatDistanceToNow(new Date(pr.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <ArrowSquareOut className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
