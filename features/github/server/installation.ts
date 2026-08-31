import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { getGithubApp } from "@/features/github/utils/github-app";
import {
    buildRepoNamespace,
    deleteRepoNamespace,
} from "@/features/repo-sync/server/repo-sync";
import { buildPrNamespace } from "@/features/reviews/server/vector";
import { prisma } from "@/lib/db";
import { RequestError } from "octokit";


function getAccountLogin(
    account: { login?: string; slug?: string } | null | undefined
): string | null {
    if (!account) {
        return null;
    }

    if ("login" in account && account.login) {
        return account.login;
    }

    if (account.slug) {
        return account.slug;
    }

    return null;
}
function buildDisconnectedStatus(): GithubInstallationStatus {
    return { connected: false, accountLogin: null, installedAt: null };
}


export async function getInstallationStatus(userId: string) {
    const installation = await prisma.githubInstallation.findUnique({
        where: {
            userId
        }
    });

    if (!installation) {
        return buildDisconnectedStatus()
    }

    return {
        connected: true,
        accountLogin: installation.accountLogin,
        installedAt: installation.createdAt.toISOString()
    }
}


export async function saveInstallation(userId: string, installationId: number) {
    const app = getGithubApp();

    const { data } = await app.octokit.request(
        "GET /app/installations/{installation_id}",
        { installation_id: installationId }
    )

    const accountLogin = getAccountLogin(data.account);

    await prisma.githubInstallation.upsert({
        where: { userId },
        create: {
            userId,
            installationId,
            accountLogin,
            accountType: data.target_type ?? null,
        },
        update: {
            installationId,
            accountLogin,
            accountType: data.target_type ?? null,
        }
    })
}


function isGithubInstallationGone(error: unknown) {
    return error instanceof RequestError && (error.status === 404 || error.status === 410);
}

async function uninstallGithubAppInstallation(installationId: number) {
    try {
        const app = getGithubApp();
        await app.octokit.request("DELETE /app/installations/{installation_id}", {
            installation_id: installationId,
        });
    } catch (error) {
        if (isGithubInstallationGone(error)) {
            return;
        }

        console.error("Failed to uninstall GitHub App installation", error);
    }
}

async function deletePineconeNamespaces(namespaces: string[]) {
    for (const namespace of namespaces) {
        try {
            await deleteRepoNamespace(namespace);
        } catch (error) {
            console.error(`Failed to delete Pinecone namespace ${namespace}`, error);
        }
    }
}

export async function deleteInstallation(userId: string) {
    const installation = await prisma.githubInstallation.findUnique({
        where: { userId },
    });

    if (!installation) {
        return;
    }

    const { installationId } = installation;

    await uninstallGithubAppInstallation(installationId);

    const [syncs, pullRequests] = await Promise.all([
        prisma.repoSync.findMany({
            where: { installationId },
            select: { repoFullName: true },
        }),
        prisma.pullRequest.findMany({
            where: { installationId },
            select: { repoFullName: true, prNumber: true },
        }),
    ]);

    const namespaces = [
        ...syncs.map((sync) => buildRepoNamespace(sync.repoFullName)),
        ...pullRequests.map((pr) => buildPrNamespace(pr.repoFullName, pr.prNumber)),
    ];

    await deletePineconeNamespaces(namespaces);

    await prisma.$transaction([
        prisma.repoCache.deleteMany({ where: { installationId } }),
        prisma.repoSync.deleteMany({ where: { installationId } }),
        prisma.pullRequest.deleteMany({ where: { installationId } }),
        prisma.githubInstallation.deleteMany({ where: { userId } }),
    ]);
}

export async function getUserIdByInstallationId(installationId: number) {
    const installation = await prisma.githubInstallation.findFirst({
        where: { installationId },
        select: { userId: true },
    });

    if (!installation) {
        return null;
    }

    return installation.userId;
}

export async function getUserInstallationId(userId: string) {
    const installation = await prisma.githubInstallation.findUnique({
        where: { userId },
        select: { installationId: true },
    });

    if (!installation) {
        return null;
    }

    return installation.installationId;
}

