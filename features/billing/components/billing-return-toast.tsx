"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BillingReturnToast({
  billing,
}: {
  billing?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (billing === "success") {
      toast.success("Payment received. Pro activates after Stripe confirms the subscription.");
      router.replace("/dashboard/settings");
      router.refresh();
    }

    if (billing === "canceled") {
      toast.message("Checkout canceled. You are still on the Free plan.");
      router.replace("/dashboard/settings");
    }
  }, [billing, router]);

  return null;
}
