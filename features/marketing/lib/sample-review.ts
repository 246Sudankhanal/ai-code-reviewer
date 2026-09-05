export type SampleInline = {
  path: string;
  line: number | null;
  body: string;
  /** Public-facing heading. Prefer this over raw repo paths on the homepage. */
  label?: string;
};

export type SampleReviewPreview = {
  source: "live" | "example";
  id: string;
  label: string;
  title: string;
  repoLabel: string;
  summary: string;
  diffLines: { type: "context" | "add" | "del"; text: string }[];
  inline: SampleInline[];
  githubUrl: string | null;
};

export const EXAMPLE_SAMPLE_REVIEW: SampleReviewPreview = {
  source: "example",
  id: "pagination",
  label: "Pagination retry",
  title: "Retry GitHub file pagination instead of failing the whole review",
  repoLabel: "you/demo-repo",
  githubUrl: null,
  summary:
    "Solid change. Pagination is handled, but the retry loop should cap attempts so a persistent 403 cannot stall the Inngest job. Inline notes are only on added lines.",
  diffLines: [
    { type: "context", text: "async function listPullFiles(octokit, pull) {" },
    { type: "del", text: "  return octokit.pulls.listFiles(pull);" },
    { type: "add", text: "  const files = [];" },
    { type: "add", text: "  for await (const page of octokit.paginate.iterator(" },
    { type: "add", text: "    octokit.rest.pulls.listFiles," },
    { type: "add", text: "    { ...pull, per_page: 100 }" },
    { type: "add", text: "  )) {" },
    { type: "add", text: "    files.push(...page.data);" },
    { type: "add", text: "  }" },
    { type: "add", text: "  return files;" },
  ],
  inline: [
    {
      path: "features/reviews/server/pr-files.ts",
      line: 42,
      label: "Rate limit protection",
      body: "Cap retries (and sleep with backoff). Without a max, a bad token or secondary rate limit can keep this step running until Inngest times out.",
    },
    {
      path: "features/reviews/server/pr-files.ts",
      line: 58,
      label: "Lockfile filter",
      body: "Skip lockfiles here too, or the 100k character budget is spent on yarn.lock before the real diff reaches the model.",
    },
  ],
};

export const LOCKFILE_SAMPLE_REVIEW: SampleReviewPreview = {
  source: "example",
  id: "lockfile",
  label: "Lockfile skip",
  title: "Bump lockfile and tweak one retry constant",
  repoLabel: "you/demo-repo",
  githubUrl: null,
  summary:
    "Most of this diff is package-lock.json. The reviewer skipped it so the model spent budget on the one TypeScript change, not 8k lines of generated JSON.",
  diffLines: [
    { type: "context", text: "const MAX_DIFF_CHARS = 100_000;" },
    { type: "del", text: "const SKIP = [];" },
    { type: "add", text: "const SKIP = [/package-lock\\.json$/, /dist\\//];" },
    { type: "add", text: "if (SKIP.some((re) => re.test(path))) return;" },
  ],
  inline: [
    {
      path: "features/reviews/server/pr-files.ts",
      line: 18,
      label: "Lockfile skip",
      body: "Good skip. Without it a lockfile PR looks huge to the LLM and you get vague comments that never mention the real one-line change.",
    },
  ],
};

function commentHeading(path: string) {
  return path.split("/").pop() || path;
}

function clip(text: string, max: number) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function patchToDiffLines(
  patch: string,
  maxLines = 14
): SampleReviewPreview["diffLines"] {
  const lines: SampleReviewPreview["diffLines"] = [];
  for (const raw of patch.split("\n")) {
    if (
      raw.startsWith("@@") ||
      raw.startsWith("diff ") ||
      raw.startsWith("index ")
    ) {
      continue;
    }
    if (raw.startsWith("+++") || raw.startsWith("---")) continue;
    if (raw.startsWith("+")) {
      lines.push({ type: "add", text: raw.slice(1) || " " });
    } else if (raw.startsWith("-")) {
      lines.push({ type: "del", text: raw.slice(1) || " " });
    } else if (raw.startsWith("\\")) {
      continue;
    } else {
      lines.push({
        type: "context",
        text: raw.startsWith(" ") ? raw.slice(1) : raw,
      });
    }
    if (lines.length >= maxLines) break;
  }
  return lines.length > 0 ? lines : EXAMPLE_SAMPLE_REVIEW.diffLines;
}

export function fromGithubPayload(input: {
  title: string;
  owner: string;
  repo: string;
  htmlUrl: string;
  firstPatch?: string | null;
  issueComments: { user?: { login?: string } | null; body?: string | null }[];
  reviewComments: {
    path?: string;
    line?: number | null;
    original_line?: number | null;
    body?: string | null;
  }[];
}): SampleReviewPreview {
  const summaryComment = input.issueComments.find((c) =>
    Boolean(c.body?.trim())
  );
  const inline = input.reviewComments
    .filter((c) => Boolean(c.body?.trim()))
    .slice(0, 3)
    .map((c) => ({
      path: c.path ?? "file",
      line: c.line ?? c.original_line ?? null,
      label: commentHeading(c.path ?? "file"),
      body: clip(c.body ?? "", 280),
    }));

  return {
    source: "live",
    id: "live",
    label: "Live GitHub PR",
    title: input.title,
    repoLabel: `${input.owner}/${input.repo}`,
    githubUrl: input.htmlUrl,
    summary: clip(
      summaryComment?.body ??
        "Open the PR on GitHub to read the full aiprreviewer summary.",
      420
    ),
    diffLines: input.firstPatch
      ? patchToDiffLines(input.firstPatch)
      : EXAMPLE_SAMPLE_REVIEW.diffLines,
    inline: inline.length > 0 ? inline : EXAMPLE_SAMPLE_REVIEW.inline,
  };
}
