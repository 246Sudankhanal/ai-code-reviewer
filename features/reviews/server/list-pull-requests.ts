import { prisma } from "@/lib/db";
import { getUserInstallationId } from "@/features/github/server/installation";

export type ListedPullRequest = {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  headSha: string;
  baseBranch: string;
  status: string;
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listPullRequests(
  userId: string
): Promise<ListedPullRequest[]> {
  const installationId = await getUserInstallationId(userId);

  if (!installationId) {
    return [];
  }

  const rows = await prisma.pullRequest.findMany({
    where: { installationId },
    orderBy: { updatedAt: "desc" },
    take: 150,
  });

  return rows.map((pr) => ({
    id: pr.id,
    repoFullName: pr.repoFullName,
    prNumber: pr.prNumber,
    title: pr.title,
    authorLogin: pr.authorLogin,
    headSha: pr.headSha,
    baseBranch: pr.baseBranch,
    status: pr.status,
    reviewComment: pr.reviewComment,
    reviewedAt: pr.reviewedAt?.toISOString() ?? null,
    createdAt: pr.createdAt.toISOString(),
    updatedAt: pr.updatedAt.toISOString(),
  }));
}
