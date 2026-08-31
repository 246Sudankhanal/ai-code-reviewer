import { getServerSession } from "@/features/auth/actions";
import { createProCheckout } from "@/features/billing/server/subscription";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await createProCheckout(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
