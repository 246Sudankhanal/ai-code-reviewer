import { NextResponse } from "next/server";
import {
  queueRepoSync,
  RepoSyncRequestError,
  stopRepoSync,
} from "@/features/repo-sync/server/queue-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repoFullName?: unknown;
      branch?: unknown;
      action?: unknown;
    };

    if (body.action === "cancel") {
      const { repoFullName } = await stopRepoSync({
        repoFullName: body.repoFullName,
      });
      return NextResponse.json({ ok: true, repoFullName, cancelled: true });
    }

    const { repoFullName } = await queueRepoSync({
      repoFullName: body.repoFullName,
      branch: body.branch,
    });
    return NextResponse.json({ ok: true, repoFullName });
  } catch (error) {
    if (error instanceof RepoSyncRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}
