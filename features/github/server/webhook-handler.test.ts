import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  verify,
  send,
  savePullRequest,
  getUserIdByInstallationId,
  canUserReview,
} = vi.hoisted(() => ({
  verify: vi.fn(),
  send: vi.fn(),
  savePullRequest: vi.fn(),
  getUserIdByInstallationId: vi.fn(),
  canUserReview: vi.fn(),
}));

vi.mock("@/features/github/utils/github-app", () => ({
  getGithubApp: () => ({ webhooks: { verify } }),
}));

vi.mock("@/features/inngest/client", () => ({
  inngest: { send },
}));

vi.mock("@/features/reviews/server/save-pull-request", () => ({
  savePullRequest,
}));

vi.mock("@/features/github/server/installation", () => ({
  getUserIdByInstallationId,
}));

vi.mock("@/features/billing/server/usage", () => ({
  canUserReview,
}));

vi.mock("@/features/repo-sync/server/repo-sync", () => ({
  triggerRepoSync: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    pullRequest: { update: vi.fn() },
  },
}));

import { handleGithubWebhook } from "./webhook-handler";

const openedPrBody = {
  action: "opened",
  installation: { id: 42 },
  repository: { full_name: "246Sudankhanal/Sample-Repo" },
  pull_request: {
    number: 1,
    title: "Add retry",
    user: { login: "sudan" },
    head: { sha: "abc123" },
    base: { ref: "main" },
  },
};

function webhookRequest(options?: {
  signature?: string | null;
  event?: string;
  body?: unknown;
}) {
  const body =
    typeof options?.body === "string"
      ? options.body
      : JSON.stringify(options?.body ?? openedPrBody);

  const headers = new Headers({
    "content-type": "application/json",
    "x-github-event": options?.event ?? "pull_request",
  });

  if (options?.signature !== null) {
    headers.set("x-hub-signature-256", options?.signature ?? "sha256=test");
  }

  return new Request("http://localhost/api/github/webhook", {
    method: "POST",
    headers,
    body,
  });
}

describe("handleGithubWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verify.mockResolvedValue(true);
    getUserIdByInstallationId.mockResolvedValue(null);
    canUserReview.mockResolvedValue(true);
    savePullRequest.mockResolvedValue({
      skipReview: false,
      pullRequest: { id: "pr_1" },
    });
  });

  it("rejects a payload without a valid GitHub signature", async () => {
    verify.mockResolvedValue(false);

    const response = await handleGithubWebhook(webhookRequest());
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Invalid signature" });
    expect(send).not.toHaveBeenCalled();
    expect(savePullRequest).not.toHaveBeenCalled();
  });

  it("queues an Inngest review job for a signed pull_request.opened event", async () => {
    const response = await handleGithubWebhook(webhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ received: true });
    expect(savePullRequest).toHaveBeenCalledWith(openedPrBody);
    expect(send).toHaveBeenCalledWith({
      name: "github/pr.received",
      data: { pullRequestId: "pr_1" },
    });
  });

  it("does not enqueue Inngest when this commit was already reviewed", async () => {
    savePullRequest.mockResolvedValue({
      skipReview: true,
      pullRequest: { id: "pr_1" },
    });

    const response = await handleGithubWebhook(webhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      received: true,
      skipped: "already-reviewed-this-commit",
    });
    expect(send).not.toHaveBeenCalled();
  });
});
