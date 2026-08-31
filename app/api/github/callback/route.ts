import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { saveInstallation } from "@/features/github/server/installation";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// function buildSignInCallbackUrl(requestUrl: string, installationId: string | null): string {
//   // Pass the exact current URL (including query params) so the user 
//   // gets redirected right back here after signing in.
//   return requestUrl;
// }
function buildSignInCallbackUrl(installationId: string | null): string {
    if (installationId) {
      return `/api/github/callback?installation_id=${installationId}`;
    }
  
    return DASHBOARD_ROUTES.github;
  }

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const installationId = searchParams.get("installation_id");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. If not logged in, preserve the exact destination (including installation_id)
  if (!session) {
    const callbackUrl = buildSignInCallbackUrl(installationId);
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const parsedId = Number(installationId);
  if (!isNaN(parsedId)) {
    await saveInstallation(session.user.id, parsedId);
  }

  redirect(DASHBOARD_ROUTES.github.trim());
}