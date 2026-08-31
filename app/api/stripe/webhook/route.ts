import Stripe from "stripe";
import { getStripe } from "@/features/billing/lib/stripe";
import {
  applyStripeSubscription,
  findUserIdForStripeEvent,
} from "@/features/billing/server/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription") {
      return Response.json({ received: true });
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    const userId = await findUserIdForStripeEvent({
      userId: session.metadata?.userId ?? session.client_reference_id,
      subscriptionId,
      customerId,
    });

    if (!userId || !subscriptionId) {
      console.error("Stripe checkout.session.completed: missing user or subscription");
      return Response.json({ received: true });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await applyStripeSubscription(userId, subscription);
    return Response.json({ received: true });
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const userId = await findUserIdForStripeEvent({
      userId: subscription.metadata?.userId,
      subscriptionId: subscription.id,
      customerId,
    });

    if (!userId) {
      console.error("Stripe subscription event: no user", subscription.id);
      return Response.json({ received: true });
    }

    await applyStripeSubscription(userId, subscription);
    return Response.json({ received: true });
  }

  return Response.json({ received: true });
}
