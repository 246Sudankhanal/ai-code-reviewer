import { inngest } from "@/features/inngest/client";
import { savePullRequest } from "@/features/reviews/server/save-pull-request";
import { triggerRepoSync } from "@/features/repo-sync/server/repo-sync";
import { canUserReview } from "@/features/billing/server/usage";
import { prisma } from "@/lib/db";
import { getGithubApp } from "../utils/github-app";
import { getUserIdByInstallationId } from "./installation";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];
const MAIN_BRANCH_REF = "refs/heads/main";

export type PullRequestWebhookPayload = {
  action: string;
  installation: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    title: string;
    user: { login: string } | null;
    head: { sha: string };
    base: { ref: string };
  };
};

type PushWebhookPayload = {
  ref: string;
  deleted?: boolean;
  installation: { id: number };
  repository: { full_name: string };
};

async function isSignatureValid(payload: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const app = getGithubApp();
  return app.webhooks.verify(payload, signature);
}

async function handlePullRequestEvent(event: PullRequestWebhookPayload) {
  if (!REVIEWABLE_ACTIONS.includes(event.action)) {
    return Response.json({ received: true });
  }

  const pullRequestSave = await savePullRequest(event);

  if (pullRequestSave.skipReview) {
    return Response.json({ received: true, skipped: "already-reviewed-this-commit" });
  }

  const pullRequest = pullRequestSave.pullRequest;
  const userId = await getUserIdByInstallationId(event.installation.id);

  if (userId) {
    const allowed = await canUserReview(userId);
    if (!allowed) {
      await prisma.pullRequest.update({
        where: { id: pullRequest.id },
        data: { status: "rate_limited" },
      });
      return Response.json({ received: true, rateLimited: true });
    }
  }

  await inngest.send({
    name: "github/pr.received",
    data: { pullRequestId: pullRequest.id },
  });

  return Response.json({ received: true });
}

async function handlePushEvent(event: PushWebhookPayload) {
  if (event.deleted || event.ref !== MAIN_BRANCH_REF) {
    return Response.json({ received: true });
  }

  await triggerRepoSync(
    event.installation.id,
    event.repository.full_name,
    "main"
  );

  return Response.json({ received: true, queued: "repo/sync.requested" });
}

export async function handleGithubWebhook(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const isValid = await isSignatureValid(payload, signature);

  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventName === "push") {
    return handlePushEvent(parsed as unknown as PushWebhookPayload);
  }

  if (eventName !== "pull_request") {
    return Response.json({ received: true });
  }

  return handlePullRequestEvent(parsed as unknown as PullRequestWebhookPayload);
}
