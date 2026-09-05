import { getServerSession } from "@/features/auth/actions";
import { getUserInstallationId } from "@/features/github/server/installation";
import { markRepoSyncFailed, triggerRepoSync } from "@/features/repo-sync/server/repo-sync";

export class RepoSyncRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function parseRepoFullName(value: unknown) {
  if (typeof value !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(value)) {
    throw new RepoSyncRequestError("Invalid repository", 400);
  }
  return value;
}

export async function requireInstallationForSync() {
  const session = await getServerSession();
  if (!session) {
    throw new RepoSyncRequestError("Sign in required", 401);
  }

  const installationId = await getUserInstallationId(session.user.id);
  if (!installationId) {
    throw new RepoSyncRequestError("Install the GitHub App first", 403);
  }

  return { session, installationId };
}

export async function queueRepoSync(input: {
  repoFullName: unknown;
  branch: unknown;
}) {
  const { installationId } = await requireInstallationForSync();
  const repoFullName = parseRepoFullName(input.repoFullName);
  const branch =
    typeof input.branch === "string" && input.branch.trim()
      ? input.branch.trim()
      : "main";

  await triggerRepoSync(installationId, repoFullName, branch);
  return { repoFullName };
}

export async function stopRepoSync(input: { repoFullName: unknown }) {
  await requireInstallationForSync();
  const repoFullName = parseRepoFullName(input.repoFullName);
  await markRepoSyncFailed(repoFullName);
  return { repoFullName };
}
