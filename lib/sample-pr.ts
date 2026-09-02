/** Public GitHub PR URL for recruiters. Empty until you paste a real PR. */
export const SAMPLE_PR_URL = process.env.NEXT_PUBLIC_SAMPLE_PR_URL?.trim() ?? "";

export function parseGithubPullUrl(url: string): {
  owner: string;
  repo: string;
  number: number;
} | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const match = parsed.pathname.match(
      /^\/([^/]+)\/([^/]+)\/pull\/(\d+)/
    );
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2],
      number: Number(match[3]),
    };
  } catch {
    return null;
  }
}
