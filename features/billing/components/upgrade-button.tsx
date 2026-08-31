"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { statusButtonClass } from "@/features/dashboard/lib/status-style";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start checkout.";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className={cn(statusButtonClass.success)}
    >
      {loading ? "Redirecting to Stripe…" : "Upgrade to Pro"}
    </Button>
  );
}
