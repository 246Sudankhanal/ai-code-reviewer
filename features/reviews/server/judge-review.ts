import { generateText } from "ai";
import { openrouter } from "@/features/ai";
import { JUDGE_MODELS } from "@/features/ai/models";

export type ReviewJudgeResult = {
  score: number;
  verdict: "post" | "rewrite" | "block";
  rationale: string;
};

type JudgeInput = {
  repoFullName: string;
  title: string;
  review: string;
  diffText: string;
  repoContextSnippets: string[];
};

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  if (start === -1) {
    throw new Error("Judge response had no JSON object");
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < body.length; i++) {
    const char = body[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return body.slice(start, i + 1);
      }
    }
  }

  throw new Error("Judge JSON was truncated or unbalanced");
}

function parseJudgeJson(text: string): ReviewJudgeResult {
  const parsed = JSON.parse(extractJsonObject(text)) as Partial<ReviewJudgeResult>;
  const score = Number(parsed.score);
  let verdict = parsed.verdict;

  if (verdict !== "post" && verdict !== "rewrite" && verdict !== "block") {
    if (score >= 4) verdict = "post";
    else if (score >= 2) verdict = "rewrite";
    else verdict = "block";
  }

  return {
    score: Number.isFinite(score) ? Math.min(5, Math.max(1, score)) : 3,
    verdict,
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
  };
}

function buildEvidence(input: JudgeInput) {
  const repo =
    input.repoContextSnippets.length > 0
      ? `\n\nRelated repository snippets (neighbourhood only):\n${input.repoContextSnippets.join("\n\n---\n\n")}`
      : "";

  return `Unified diff (source of truth for what changed):
${input.diffText}${repo}`;
}

const JUDGE_SYSTEM = `You are a senior staff engineer scoring another model's pull request review against the actual diff.
Reply with a single JSON object only, no markdown: {"score":1-5,"verdict":"post"|"rewrite"|"block","rationale":"..."}.
verdict=post if score >= 4; rewrite if 2-3; block if the review is empty, hallucinated (claims not in the diff), or harmful.
Do not demand the review find every possible issue. Penalize invented files, APIs, or bugs that are not supported by the diff.`;

export async function evaluateReview(
  input: JudgeInput
): Promise<ReviewJudgeResult> {
  const prompt = `Repo: ${input.repoFullName}
PR: ${input.title}

${buildEvidence(input)}

Review to judge:
${input.review}`;

  const errors: string[] = [];

  for (const model of JUDGE_MODELS) {
    try {
      const { text } = await generateText({
        model: openrouter(model),
        system: JUDGE_SYSTEM,
        prompt,
      });
      const judged = parseJudgeJson(text);
      if (model !== JUDGE_MODELS[0]) {
        judged.rationale = `[judge:${model}] ${judged.rationale}`;
      }
      return judged;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[judge-review]", model, error);
      errors.push(`${model}: ${message.slice(0, 120)}`);
    }
  }

  return {
    score: 4,
    verdict: "post",
    rationale: `Judge fallback (posted original review): ${errors.join(" | ")}`.slice(
      0,
      500
    ),
  };
}
