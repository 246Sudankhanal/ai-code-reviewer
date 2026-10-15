import { SITE_URL } from "@/lib/brand";
import { inngest } from "@/features/inngest/client";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { serve } from "inngest/next";
import { syncRepoCodebaseFunction } from "@/features/repo-sync/server/repo-sync-function";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [reviewPullRequest, syncRepoCodebaseFunction],
  serveOrigin: process.env.INNGEST_SERVE_ORIGIN || SITE_URL,
  servePath: "/api/inngest",
});
