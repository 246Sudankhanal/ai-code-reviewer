import { prisma } from "@/lib/db";
import { getUserInstallationId } from "@/features/github/server/installation";
import { getUsageSummary } from "@/features/billing/server/usage";
import type { GithubRepo } from "@/features/github/server/repos";

export type OverviewPr = {
  id: string;
  title: string;
  repoFullName: string;
  prNumber: number;
  status: string;
  authorLogin: string | null;
  updatedAt: string;
};

export type OverviewSync = {
  id: string;
  repoFullName: string;
  branch: string;
  status: string;
  chunkCount: number;
  syncedAt: string | null;
  updatedAt: string;
};

export type DashboardOverview = {
  connected: boolean;
  accountLogin: string | null;
  repoCount: number;
  syncedRepoCount: number;
  prTotal: number;
  prReviewed: number;
  prPending: number;
  prProcessing: number;
  reviewsThisMonth: number;
  reviewLimit: number | null;
  recentSyncs: OverviewSync[];
  recentPullRequests: OverviewPr[];
};

const EMPTY_OVERVIEW: DashboardOverview = {
  connected: false,
  accountLogin: null,
  repoCount: 0,
  syncedRepoCount: 0,
  prTotal: 0,
  prReviewed: 0,
  prPending: 0,
  prProcessing: 0,
  reviewsThisMonth: 0,
  reviewLimit: null,
  recentSyncs: [],
  recentPullRequests: [],
};

function countByStatus(
  groups: { status: string; _count: number }[],
  status: string
) {
  return groups.find((group) => group.status === status)?._count ?? 0;
}

export async function getDashboardOverview(
  userId: string
): Promise<DashboardOverview> {
  const installationId = await getUserInstallationId(userId);

  if (!installationId) {
    return EMPTY_OVERVIEW;
  }

  const [
    installation,
    repoCache,
    syncedRepoCount,
    prGroups,
    recentSyncs,
    recentPullRequests,
    usage,
  ] = await Promise.all([
    prisma.githubInstallation.findUnique({
      where: { userId },
      select: { accountLogin: true },
    }),
    prisma.repoCache.findUnique({
      where: { installationId_page: { installationId, page: 1 } },
    }),
    prisma.repoSync.count({
      where: { installationId, status: "synced" },
    }),
    prisma.pullRequest.groupBy({
      by: ["status"],
      where: { installationId },
      _count: true,
    }),
    prisma.repoSync.findMany({
      where: { installationId },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.pullRequest.findMany({
      where: { installationId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    getUsageSummary(userId),
  ]);

  let repoCount = 0;
  if (repoCache) {
    try {
      const parsed = JSON.parse(repoCache.data) as { totalCount?: number; repos?: GithubRepo[] };
      repoCount = parsed.totalCount ?? parsed.repos?.length ?? 0;
    } catch {
      repoCount = 0;
    }
  }

  const prReviewed = countByStatus(prGroups, "reviewed");
  const prPending = countByStatus(prGroups, "pending");
  const prProcessing = countByStatus(prGroups, "processing");
  const prTotal = prGroups.reduce((sum, group) => sum + group._count, 0);

  return {
    connected: true,
    accountLogin: installation?.accountLogin ?? null,
    repoCount,
    syncedRepoCount,
    prTotal,
    prReviewed,
    prPending,
    prProcessing,
    reviewsThisMonth: usage.used,
    reviewLimit: usage.limit,
    recentSyncs: recentSyncs.map((sync) => ({
      id: sync.id,
      repoFullName: sync.repoFullName,
      branch: sync.branch,
      status: sync.status,
      chunkCount: sync.chunkCount,
      syncedAt: sync.syncedAt?.toISOString() ?? null,
      updatedAt: sync.updatedAt.toISOString(),
    })),
    recentPullRequests: recentPullRequests.map((pr) => ({
      id: pr.id,
      title: pr.title,
      repoFullName: pr.repoFullName,
      prNumber: pr.prNumber,
      status: pr.status,
      authorLogin: pr.authorLogin,
      updatedAt: pr.updatedAt.toISOString(),
    })),
  };
}
