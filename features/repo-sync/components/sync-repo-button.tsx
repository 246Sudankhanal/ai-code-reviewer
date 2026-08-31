"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { githubRepoKeys } from "@/features/github/lib/repos-query";
import { cancelRepoSync, syncRepoCodebase } from "../actions/repo-sync";
import { Button } from "@/components/ui/button";
import { RepoSyncStatus } from "../types";
import { toast } from "sonner";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

function isSyncing(status: RepoSyncStatus | null, mutationPending: boolean) {
  if (mutationPending) {
    return true;
  }

  return status === "pending" || status === "syncing";
}

function getButtonLabel(status: RepoSyncStatus | null, mutationPending: boolean) {
  if (isSyncing(status, mutationPending)) {
    return "Syncing…";
  }

  if (status === "failed") {
    return "Retry";
  }

  if (status === "synced") {
    return "Re-sync";
  }

  return "Sync";
}

export default function SyncRepoButton({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) {
  const queryClient = useQueryClient();

  const syncRepo = useMutation({
    mutationFn: () => syncRepoCodebase(repoFullName, branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
      toast.success(`Sync queued for ${repoFullName}`);
    },
    onError: (error) => {
      toast.error(`Failed to sync ${repoFullName}: ${error.message}`);
    },
  });

  const cancelSync = useMutation({
    mutationFn: () => cancelRepoSync(repoFullName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
      toast.success(`Stopped sync for ${repoFullName}`);
    },
    onError: (error) => {
      toast.error(`Could not stop sync: ${error.message}`);
    },
  });

  const syncing = isSyncing(syncStatus, syncRepo.isPending);

  return (
    <div className="inline-flex items-center justify-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={syncing || cancelSync.isPending}
        onClick={() => syncRepo.mutate()}
      >
        {getButtonLabel(syncStatus, syncRepo.isPending)}
      </Button>
      {syncing ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={cancelSync.isPending}
          onClick={() => cancelSync.mutate()}
        >
          Stop
        </Button>
      ) : null}
    </div>
  );
}
