import { inngest } from "@/features/inngest/client";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { serve } from "inngest/next";
import { processTask } from "./function";
import { syncRepoCodebaseFunction } from "@/features/repo-sync/server/repo-sync-function";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask, reviewPullRequest, syncRepoCodebaseFunction],
  serveOrigin:
    process.env.INNGEST_SERVE_ORIGIN || process.env.BETTER_AUTH_URL,
  servePath: "/api/inngest",
});
