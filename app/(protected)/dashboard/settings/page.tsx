import { requireAuth } from "@/features/auth/actions";
import { BillingReturnToast } from "@/features/billing/components/billing-return-toast";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { SettingsContent } from "@/features/dashboard/components/settings-content";
import { getUserSettings } from "@/features/settings/server/get-settings";

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const session = await requireAuth();
  const settings = await getUserSettings(session.user.id);
  const { billing } = await searchParams;
  const billingStatus = Array.isArray(billing) ? billing[0] : billing;

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your profile and subscription."
      />
        <BillingReturnToast billing={billingStatus} />
      <SettingsContent
        profile={settings.profile}
        subscription={settings.subscription}
        usage={settings.usage}
      />
    </>
  );
}
