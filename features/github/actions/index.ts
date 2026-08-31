"use server";

import { getServerSession } from "@/features/auth/actions";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { deleteInstallation } from "../server/installation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function disconnectGithubApp() {
    const session = await getServerSession();

    if (!session) {
      redirect("/sign-in");
    }

    await deleteInstallation(session.user.id);
    revalidatePath(DASHBOARD_ROUTES.github);
    redirect(DASHBOARD_ROUTES.github);
}