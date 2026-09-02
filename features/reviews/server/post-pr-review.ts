import { prisma } from "@/lib/db";
import { getGithubApp } from "@/features/github/utils/github-app";
import { postPrComment } from "./post-pr-comment";
import type { InlineReviewComment } from "./generate-review";

function isBotAccount(login: string | null | undefined) {
  if (!login) {
    return false;
  }
  return login.endsWith("[bot]") || login.includes("sudancodereviewer");
}

async function botAlreadyReviewedCommit(input: {
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
  commitSha: string;
}) {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(input.installationId);
  const reviews = await octokit.paginate(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
    {
      owner: input.owner,
      repo: input.repo,
      pull_number: input.prNumber,
      per_page: 100,
    }
  );

  return reviews.some((review) => {
    if (!isBotAccount(review.user?.login) || !review.commit_id) {
      return false;
    }
    return (
      review.commit_id === input.commitSha ||
      review.commit_id.startsWith(input.commitSha) ||
      input.commitSha.startsWith(review.commit_id)
    );
  });
}

export async function postPrReview(input: {
  pullRequestId: string;
  installationId: number;
  repoFullName: string;
  prNumber: number;
  commitSha: string;
  summary: string;
  inline: InlineReviewComment[];
}) {
  const [owner, repo] = input.repoFullName.split("/");

  const alreadyPosted = await botAlreadyReviewedCommit({
    installationId: input.installationId,
    owner,
    repo,
    prNumber: input.prNumber,
    commitSha: input.commitSha,
  });

  if (alreadyPosted) {
    await prisma.pullRequest.update({
      where: { id: input.pullRequestId },
      data: { postedHeadSha: input.commitSha },
    });
    return { posted: "skipped-duplicate" as const, inlineCount: 0 };
  }

  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(input.installationId);

  const comments = input.inline.slice(0, 20).map((comment) => ({
    path: comment.path,
    body: comment.body,
    line: comment.line,
    side: "RIGHT" as const,
  }));

  let result: { posted: "review" | "review-summary-only" | "issue-comment"; inlineCount: number };

  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      {
        owner,
        repo,
        pull_number: input.prNumber,
        commit_id: input.commitSha,
        body: input.summary,
        event: "COMMENT",
        comments,
      }
    );
    result = { posted: "review", inlineCount: comments.length };
  } catch {
    try {
      await octokit.request(
        "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        {
          owner,
          repo,
          pull_number: input.prNumber,
          commit_id: input.commitSha,
          body: input.summary,
          event: "COMMENT",
        }
      );
      result = { posted: "review-summary-only", inlineCount: 0 };
    } catch {
      await postPrComment(
        input.installationId,
        input.repoFullName,
        input.prNumber,
        input.summary
      );
      result = { posted: "issue-comment", inlineCount: 0 };
    }
  }

  await prisma.pullRequest.update({
    where: { id: input.pullRequestId },
    data: { postedHeadSha: input.commitSha },
  });

  return result;
}
