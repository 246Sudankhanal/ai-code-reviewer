import type { UserSubscription } from "@/features/dashboard/lib/types";
import {
  getAppBaseUrl,
  getStripe,
  subscriptionPeriodEnd,
} from "@/features/billing/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user) {
    return { plan: "free", status: "active", renewsAt: null };
  }

  const renewsAt = user.subscriptionRenewsAt?.toISOString() ?? null;

  if (user.plan !== "pro") {
    return { plan: "free", status: "active", renewsAt };
  }

  if (user.subscriptionStatus === "pending") {
    return { plan: "free", status: "trialing", renewsAt };
  }

  if (user.subscriptionStatus === "canceled") {
    const stillActive =
      user.subscriptionRenewsAt !== null && user.subscriptionRenewsAt > new Date();

    if (stillActive) {
      return { plan: "pro", status: "active", renewsAt };
    }

    return { plan: "free", status: "canceled", renewsAt };
  }

  if (user.subscriptionStatus === "active") {
    return { plan: "pro", status: "active", renewsAt };
  }

  if (user.subscriptionStatus === "trialing") {
    return { plan: "pro", status: "trialing", renewsAt };
  }

  return { plan: "free", status: "canceled", renewsAt };
}

export async function createProCheckout(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (subscription.plan === "pro" && subscription.status === "active") {
    throw new Error("You already have an active Pro subscription.");
  }

  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID is not configured.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const stripe = getStripe();
  const baseUrl = getAppBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/settings?billing=success`,
    cancel_url: `${baseUrl}/dashboard/settings?billing=canceled`,
    client_reference_id: userId,
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "pending" },
  });

  return { url: session.url };
}

export async function cancelProSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });

  if (!user?.stripeSubscriptionId) {
    throw new Error("No active subscription found.");
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "canceled" },
  });
}

export async function applyStripeSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const canceledAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  const stripeStatus = subscription.status;

  let plan = "free";
  let subscriptionStatus = "cancelled";

  if (stripeStatus === "active" || stripeStatus === "past_due") {
    plan = "pro";
    subscriptionStatus = canceledAtPeriodEnd ? "cancelled" : "active";
  } else if (stripeStatus === "trialing") {
    plan = "pro";
    subscriptionStatus = canceledAtPeriodEnd ? "cancelled" : "trialing";
  } else if (canceledAtPeriodEnd && stripeStatus !== "cancelled") {
    plan = "pro";
    subscriptionStatus = "cancelled";
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus,
      subscriptionRenewsAt: subscriptionPeriodEnd(subscription),
    },
  });
}

export async function findUserIdForStripeEvent(options: {
  userId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
}) {
  if (options.userId) {
    const user = await prisma.user.findUnique({
      where: { id: options.userId },
      select: { id: true },
    });
    if (user) {
      return user.id;
    }
  }

  if (options.subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: options.subscriptionId },
      select: { id: true },
    });
    if (user) {
      return user.id;
    }
  }

  if (options.customerId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: options.customerId },
      select: { id: true },
    });
    if (user) {
      return user.id;
    }
  }

  return null;
}
