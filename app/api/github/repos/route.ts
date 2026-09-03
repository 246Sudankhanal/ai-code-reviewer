import { getServerSession } from "@/features/auth/actions";
import { getUserInstallationId } from "@/features/github/server/installation";
import { getRepoSyncStatuses } from "@/features/repo-sync/server/repo-sync";
import { NextResponse } from "next/server";
import {prisma} from '@/lib/db'
import { getGithubApp } from "@/features/github/utils/github-app";
import { mapRepo, type GithubRepo, type InstallationReposPage } from "@/features/github/server/repos";
const REPOS_PER_PAGE = 30;
export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installationId = await getUserInstallationId(session.user.id);

    if (!installationId) {
        return NextResponse.json({ error: "GitHub App not connected" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    let data: InstallationReposPage;
    const cached = await prisma.repoCache.findUnique({
        where: { installationId_page: { installationId, page } },
    });

    if (cached && cached.updatedAt > tenMinutesAgo) {
        data = JSON.parse(cached.data) as InstallationReposPage;
    } else {
        // 2. If no valid cache, fetch live from GitHub
        const app = getGithubApp();
        const octokit = await app.getInstallationOctokit(installationId);
        const { data: ghData } = await octokit.request("GET /installation/repositories", {
            per_page: REPOS_PER_PAGE,
            page,
        });

        const totalCount = ghData.total_count;
        const repos = ghData.repositories.map(mapRepo);
       data = {
            repos,
            totalCount,
            page,
            hasMore: page * REPOS_PER_PAGE < totalCount,
        };

        // 3. Save/Update cache in Prisma
        await prisma.repoCache.upsert({
            where: { installationId_page: { installationId, page } },
            update: { data: JSON.stringify(data), updatedAt: new Date() },
            create: { installationId, page, data: JSON.stringify(data) },
        });
    }

    // 4. Fetch local database sync statuses concurrently or sequentially
    const repoFullNames = data.repos.map((repo: GithubRepo) => repo.fullName);
    const resolvedSyncStatuses = await getRepoSyncStatuses(repoFullNames);

    const repos = data.repos.map((repo: GithubRepo) => ({
        ...repo,
        syncStatus: resolvedSyncStatuses[repo.fullName] ?? null,
    }));

    return NextResponse.json({ ...data, repos })
}