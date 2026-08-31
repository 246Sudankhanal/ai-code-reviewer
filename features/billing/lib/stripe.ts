import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }

  if (!stripe) {
    stripe = new Stripe(secretKey);
  }

  return stripe;
}

export function getAppBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000"
  );
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const end = subscription.items.data[0]?.current_period_end;

  if (typeof end !== "number") {
    return null;
  }

  return new Date(end * 1000);
}
