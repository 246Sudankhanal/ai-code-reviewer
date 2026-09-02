import { inngest } from "@/features/inngest/client";
import {
    INNGEST_FINISH_TIMEOUT,
    INNGEST_STEP_RETRIES,
} from "@/features/inngest/job-limits";
import { prisma } from "@/lib/db";
import { getPullRequestFiles, prepareDiffForLlm } from "./pr-files";
import { generateReview } from "./generate-review";
import { evaluateReview } from "./judge-review";
import { postPrReview } from "./post-pr-review";
import { searchPrContext } from "./vector";
import { buildRepoNamespace } from "@/features/repo-sync/server/repo-sync";


export const reviewPullRequest = inngest.createFunction(
    {
      id: "review-pull-request",
      triggers: { event: "github/pr.received" },
      retries: INNGEST_STEP_RETRIES,
      timeouts: { finish: INNGEST_FINISH_TIMEOUT },
      onFailure: async ({ event }) => {
        await prisma.pullRequest.update({
          where: { id: event.data.event.data.pullRequestId },
          data: { status: "failed" },
        });
      },
    },
    async ({ event, step }) => {
      const pullRequestId = event.data.pullRequestId;
  
      const pullRequest = await step.run("mark-processing", async () => {
        return prisma.pullRequest.update({
          where: { id: pullRequestId },
          data: { status: "processing" },
        });
      });
  
      const prepared = await step.run("prepare-diff", async () => {
        const files = await getPullRequestFiles(
          pullRequest.installationId,
          pullRequest.repoFullName,
          pullRequest.prNumber
        );

        return prepareDiffForLlm(files);
      });
  
      if (!prepared.diffText.trim() || prepared.fileCount === 0) {
        const emptyReview =
          "No reviewable diff was found on this pull request (no file patches from GitHub, or only skipped lock/generated files). Nothing was posted as an AI review.";

        await step.run("mark-reviewed-no-code", async () => {
          await postPrReview({
            pullRequestId,
            installationId: pullRequest.installationId,
            repoFullName: pullRequest.repoFullName,
            prNumber: pullRequest.prNumber,
            commitSha: pullRequest.headSha,
            summary: emptyReview,
            inline: [],
          });

          await prisma.pullRequest.update({
            where: { id: pullRequestId },
            data: {
              status: "reviewed",
              reviewComment: emptyReview,
              reviewedAt: new Date(),
            },
          });
        });

        return { pullRequestId, status: "reviewed", reason: "no code to review" };
      }
  
      const repoContextSnippets = await step.run("search-repo-context", async () => {
        const repoSync = await prisma.repoSync.findUnique({
          where: { repoFullName: pullRequest.repoFullName },
        });
  
        if (!repoSync || repoSync.status !== "synced") {
          return [];
        }
  
        const repoNamespace = buildRepoNamespace(pullRequest.repoFullName);
        const query = `${pullRequest.title}\n${prepared.diffText.slice(0, 2000)}`;
        return searchPrContext(repoNamespace, query);
      });
  
      const generated = await step.run("generate-ai-review", async () =>
        generateReview({
          repoFullName: pullRequest.repoFullName,
          title: pullRequest.title,
          diffText: prepared.diffText,
          files: prepared.files,
          repoContextSnippets,
        })
      );

      const judged = await step.run("judge-review", async () =>
        evaluateReview({
          review: generated.summary,
          title: pullRequest.title,
          repoFullName: pullRequest.repoFullName,
          diffText: prepared.diffText,
          repoContextSnippets,
        })
      );

      if (judged.verdict === "block") {
        await step.run("mark-blocked-by-judge", async () => {
          await prisma.pullRequest.update({
            where: { id: pullRequestId },
            data: {
              status: "failed",
              reviewComment: generated.summary,
              judgeScore: judged.score,
              judgeVerdict: judged.verdict,
              judgeRationale: judged.rationale,
            },
          });
        });

        return { pullRequestId, status: "failed", reason: "judge blocked" };
      }

      let finalReview = generated;

      if (judged.verdict === "rewrite") {
        finalReview = await step.run("rewrite-ai-review", async () =>
          generateReview({
            repoFullName: pullRequest.repoFullName,
            title: pullRequest.title,
            diffText: prepared.diffText,
            files: prepared.files,
            repoContextSnippets,
            rewriteGuidance: judged.rationale,
          })
        );
      }
  
      await step.run("post-pr-review", async () => {
        return postPrReview({
          pullRequestId,
          installationId: pullRequest.installationId,
          repoFullName: pullRequest.repoFullName,
          prNumber: pullRequest.prNumber,
          commitSha: pullRequest.headSha,
          summary: finalReview.summary,
          inline: finalReview.inline,
        });
      });

      await step.run("mark-reviewed", async () => {
        await prisma.pullRequest.update({
          where: { id: pullRequestId },
          data: {
            status: "reviewed",
            reviewComment: finalReview.summary,
            judgeScore: judged.score,
            judgeVerdict: judged.verdict,
            judgeRationale: judged.rationale,
            reviewedAt: new Date(),
          },
        });
      });
  
      return {
        pullRequestId,
        status: "reviewed",
        judgeVerdict: judged.verdict,
        diffTruncated: prepared.truncated,
        inlineCount: finalReview.inline.length,
      };
    }
  );
