"use server";

import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "../../dashboard/lib/routes";
import {
  queueRepoSync,
  RepoSyncRequestError,
  stopRepoSync,
} from "../server/queue-sync";

export async function syncRepoCodebase(repoFullName: string, branch: string) {
  try {
    await queueRepoSync({ repoFullName, branch });
  } catch (error) {
    if (error instanceof RepoSyncRequestError && error.status === 401) {
      redirect("/sign-in");
    }
    if (error instanceof RepoSyncRequestError && error.status === 403) {
      redirect(DASHBOARD_ROUTES.github);
    }
    throw error;
  }
}

export async function cancelRepoSync(repoFullName: string) {
  try {
    await stopRepoSync({ repoFullName });
  } catch (error) {
    if (error instanceof RepoSyncRequestError && error.status === 401) {
      redirect("/sign-in");
    }
    if (error instanceof RepoSyncRequestError && error.status === 403) {
      redirect(DASHBOARD_ROUTES.github);
    }
    throw error;
  }
}
