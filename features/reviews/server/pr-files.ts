import { getGithubApp } from "@/features/github/utils/github-app";
import { PrFile } from "../types/review";

const FILES_PER_PAGE = 100;
/** ~25k tokens of diff; leaves room for system prompt, repo RAG, and the judge copy. */
const MAX_DIFF_CHARS = 100_000;
const SKIP_LOCKFILE =
    /(?:^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|composer\.lock)$/i;
const SKIP_NOISE = /\.(min\.(js|css)|map|snap)$/i;

export type PreparedPrDiff = {
    diffText: string;
    fileCount: number;
    truncated: boolean;
    files: PrFile[];
};

function shouldSkipFile(filePath: string) {
    return SKIP_LOCKFILE.test(filePath) || SKIP_NOISE.test(filePath);
}

function formatOneFile(file: PrFile) {
    return `### ${file.filePath}\n\`\`\`diff\n${file.patch}\n\`\`\``;
}

/** Formats PR file patches into a markdown diff section for the review prompt. */
export function formatPrFilesForReview(files: PrFile[]): string {
    return files.map(formatOneFile).join("\n\n");
}

/**
 * Full PR diff for the LLM (CodeRabbit-style), with lockfile/noise skipped
 * and a hard character cap so huge PRs do not blow the context window.
 */
export function prepareDiffForLlm(files: PrFile[]): PreparedPrDiff {
    const usable = files.filter(
        (file) => file.patch.trim() && !shouldSkipFile(file.filePath)
    );

    const included: PrFile[] = [];
    const parts: string[] = [];
    let total = 0;
    let truncated = false;

    for (const file of usable) {
        const block = formatOneFile(file);
        if (total + block.length + 2 > MAX_DIFF_CHARS) {
            truncated = true;
            break;
        }
        parts.push(block);
        included.push(file);
        total += block.length + 2;
    }

    let diffText = parts.join("\n\n");
    if (truncated) {
        diffText += `\n\n[Diff truncated after ${MAX_DIFF_CHARS} characters. Remaining files were omitted.]`;
    }

    return {
        diffText,
        fileCount: parts.length,
        truncated,
        files: included,
    };
}

export async function getPullRequestFiles(
    installationId: number,
    repoFullName: string,
    prNumber: number
): Promise<PrFile[]> {
    const app = getGithubApp();
    const octokit = await app.getInstallationOctokit(installationId)
    const [owner, repo] = repoFullName.split("/");

    const pages = await octokit.paginate(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
        { owner, repo, pull_number: prNumber, per_page: FILES_PER_PAGE }
    );

    const files: PrFile[] = [];

    for (const file of pages) {
        if (!file.patch) {
            continue;
        }

        files.push({ filePath: file.filename, patch: file.patch });
    }

    return files;
}