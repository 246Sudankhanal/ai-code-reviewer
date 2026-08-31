import { generateText } from "ai";
import { openrouter } from "@/features/ai";

/**
 * LLM-as-a-judge — implemented as a module, not wired into the live path yet.
 *
 * Plug this into `reviewPullRequest` after `generate-ai-review` and before
 * `post-pr-comment`:
 *
 *   const judged = await step.run("judge-review", async () =>
 *     evaluateReview({ review, title: pullRequest.title, repoFullName: pullRequest.repoFullName })
 *   );
 *   if (judged.verdict === "rewrite") { regenerate once with judged.rationale; }
 *   if (judged.verdict === "block") { skip GitHub comment; mark the PR failed; }
 *
 * Leave this for a follow-up: you want a *different* model than the reviewer,
 * a rewrite budget of 1, and persistence of score/verdict on PullRequest.
 */

const JUDGE_MODEL = "openrouter/free";

export type ReviewJudgeResult = {
  score: number;
  verdict: "post" | "rewrite" | "block";
  rationale: string;
};

type JudgeInput = {
  repoFullName: string;
  title: string;
  review: string;
};

export async function evaluateReview(
  input: JudgeInput
): Promise<ReviewJudgeResult> {
  const { text } = await generateText({
    model: openrouter(JUDGE_MODEL),
    system: `You are a senior staff engineer scoring another model's pull request review.
Reply with JSON only: {"score":1-5,"verdict":"post"|"rewrite"|"block","rationale":"..."}.
verdict=post if score >= 4; rewrite if 2-3; block if the review is empty, hallucinated, or harmful.`,
    prompt: `Repo: ${input.repoFullName}
PR: ${input.title}

Review to judge:
${input.review}`,
  });

  const parsed = JSON.parse(text) as ReviewJudgeResult;
  return parsed;
}
