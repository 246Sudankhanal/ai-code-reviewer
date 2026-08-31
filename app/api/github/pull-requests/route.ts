import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/actions";
import { listPullRequests } from "@/features/reviews/server/list-pull-requests";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pullRequests = await listPullRequests(session.user.id);
  return NextResponse.json(pullRequests);
}
