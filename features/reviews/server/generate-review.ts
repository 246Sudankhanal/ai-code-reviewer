import { generateText } from "ai";
import { openrouter } from "@/features/ai";
import { REVIEW_MODEL } from "@/features/ai/models";
import { addedLinesByFile } from "../utils/diff-lines";
import type { PrFile } from "../types/review";

const MAX_INLINE = 12;

const SYSTEM_PROMPT = `You are an expert code reviewer.

Return JSON only (no markdown fence):
{"summary":"markdown review for the PR Conversation","inline":[{"path":"file/path.ts","line":12,"body":"comment on that added line"}]}

summary: overall review in markdown (what looks good, suggestions, issues).
inline: at most ${MAX_INLINE} comments. path must match a file in the diff. line must be a NEW-file line number of a + line in that file's unified diff (the number after the @@ +start count).
If the diff is clean, use "inline": [].
Do not invent files or line numbers. Neighbourhood snippets are not part of the change.`;

export type InlineReviewComment = {
  path: string;
  line: number;
  body: string;
};

export type GeneratedReview = {
  summary: string;
  inline: InlineReviewComment[];
};

type ReviewInput = {
  repoFullName: string;
  title: string;
  diffText: string;
  files: PrFile[];
  repoContextSnippets: string[];
  rewriteGuidance?: string;
};

function buildRepoContextSection(repoContextSnippets: string[]) {
  if (repoContextSnippets.length === 0) {
    return "";
  }

  return `

Related code from the repository (for context only, not part of the change):

${repoContextSnippets.join("\n\n---\n\n")}`;
}

function parseReviewJson(text: string): GeneratedReview {
  const match = text.trim().match(/\{[\s\S]*\}/);
  if (!match) {
    return { summary: text.trim(), inline: [] };
  }

  const parsed = JSON.parse(match[0]) as Partial<GeneratedReview>;
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary
      : text.trim();
  const inline = Array.isArray(parsed.inline) ? parsed.inline : [];

  return {
    summary,
    inline: inline
      .filter(
        (item): item is InlineReviewComment =>
          Boolean(item) &&
          typeof item.path === "string" &&
          typeof item.body === "string" &&
          Number.isFinite(Number(item.line))
      )
      .map((item) => ({
        path: item.path,
        line: Math.trunc(Number(item.line)),
        body: item.body,
      })),
  };
}

export function filterInlineToAddedLines(
  inline: InlineReviewComment[],
  files: PrFile[]
): InlineReviewComment[] {
  const allowed = addedLinesByFile(files);
  const seen = new Set<string>();
  const kept: InlineReviewComment[] = [];

  for (const comment of inline) {
    const lines = allowed.get(comment.path);
    if (!lines?.has(comment.line)) {
      continue;
    }
    const key = `${comment.path}:${comment.line}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    kept.push(comment);
    if (kept.length >= MAX_INLINE) {
      break;
    }
  }

  return kept;
}

export async function generateReview(input: ReviewInput): Promise<GeneratedReview> {
  const repoContextSection = buildRepoContextSection(input.repoContextSnippets);

  const { text } = await generateText({
    model: openrouter(REVIEW_MODEL),
    system: SYSTEM_PROMPT,
    prompt: `Repository: ${input.repoFullName}
Pull request title: ${input.title}

Code changes (unified diff):

${input.diffText}${repoContextSection}${
      input.rewriteGuidance
        ? `

A second reviewer asked you to rewrite. Address this:
${input.rewriteGuidance}`
        : ""
    }`,
  });

  try {
    const parsed = parseReviewJson(text);
    return {
      summary: parsed.summary,
      inline: filterInlineToAddedLines(parsed.inline, input.files),
    };
  } catch {
    return { summary: text.trim(), inline: [] };
  }
}
