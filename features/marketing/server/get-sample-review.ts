import { parseGithubPullUrl, SAMPLE_PR_URL } from "@/lib/sample-pr";
import {
  EXAMPLE_SAMPLE_REVIEW,
  fromGithubPayload,
  type SampleReviewPreview,
} from "@/features/marketing/lib/sample-review";

async function githubJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ai-code-reviewer",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function getSampleReviewPreview(): Promise<SampleReviewPreview> {
  const parsed = parseGithubPullUrl(SAMPLE_PR_URL);
  if (!parsed) {
    return { ...EXAMPLE_SAMPLE_REVIEW, githubUrl: SAMPLE_PR_URL || null };
  }

  const base = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const [pull, issueComments, reviewComments, files] = await Promise.all([
    githubJson<{ title: string; html_url: string }>(
      `${base}/pulls/${parsed.number}`
    ),
    githubJson<{ user?: { login?: string }; body?: string }[]>(
      `${base}/issues/${parsed.number}/comments`
    ),
    githubJson<
      {
        path?: string;
        line?: number | null;
        original_line?: number | null;
        body?: string | null;
      }[]
    >(`${base}/pulls/${parsed.number}/comments`),
    githubJson<{ filename: string; patch?: string }[]>(
      `${base}/pulls/${parsed.number}/files?per_page=10`
    ),
  ]);

  if (!pull) {
    return {
      ...EXAMPLE_SAMPLE_REVIEW,
      githubUrl: SAMPLE_PR_URL,
      repoLabel: `${parsed.owner}/${parsed.repo}`,
    };
  }

  return fromGithubPayload({
    title: pull.title,
    owner: parsed.owner,
    repo: parsed.repo,
    htmlUrl: pull.html_url,
    firstPatch: files?.find((file) => file.patch)?.patch ?? null,
    issueComments: issueComments ?? [],
    reviewComments: reviewComments ?? [],
  });
}
