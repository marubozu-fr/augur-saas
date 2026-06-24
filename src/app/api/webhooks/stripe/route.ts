// Stripe webhook handler.
// Syncs Stripe subscription state into the Supabase subscriptions table.
// Runs on the Node.js runtime because stripe.webhooks.constructEvent() needs
// access to the raw request body as a string.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Build a subscription row from a Stripe Subscription object.
// Assumes the subscription has been retrieved with price and product expanded
// so that metadata is available inline.
function buildSubscriptionRow(
  subscription: Stripe.Subscription,
  userId: string,
) {
  // In Stripe's dahlia API, current_period_end lives on each SubscriptionItem.
  // We read it from the first item, which covers the standard single-price case.
  const item = subscription.items.data[0];
  const price = item?.price as Stripe.Price | undefined;

  // The product may be expanded or just an id string.
  const product =
    price?.product && typeof price.product === "object"
      ? (price.product as Stripe.Product)
      : null;

  const tier = product?.metadata?.tier ?? null;
  const priceId = price?.id ?? null;
  const productId =
    typeof price?.product === "string" ? price.product : product?.id ?? null;

  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  return {
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: priceId,
    product_id: productId,
    tier,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
}

// Retrieve a subscription from Stripe with price and product expanded so that
// product metadata is available without a second API call.
async function retrieveSubscriptionExpanded(
  stripe: Stripe,
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripe = createStripeClient();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // -----------------------------------------------------------------------
      // A new checkout session completed → a fresh subscription was created.
      // Assumption: the checkout session was created with client_reference_id
      // set to the Supabase user id (uuid). The code that creates the checkout
      // session (not in this file) MUST pass:
      //   client_reference_id: supabaseUser.id
      // If your checkout flow stores the user id elsewhere (e.g. metadata.user_id),
      // update the userId derivation below accordingly.
      // -----------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error(
            "[stripe-webhook] checkout.session.completed: missing client_reference_id",
          );
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          console.error(
            "[stripe-webhook] checkout.session.completed: no subscription id on session",
          );
          break;
        }

        const subscription = await retrieveSubscriptionExpanded(
          stripe,
          subscriptionId,
        );
        const row = buildSubscriptionRow(subscription, userId);

        const { error } = await supabase
          .from("subscriptions")
          .upsert(row, { onConflict: "id" });

        if (error) {
          throw new Error(
            `[stripe-webhook] upsert failed on checkout.session.completed: ${error.message}`,
          );
        }
        break;
      }

      // -----------------------------------------------------------------------
      // Subscription updated (plan change, renewal, cancellation toggle, etc.).
      // The subscription object is directly on the event — no need to re-fetch
      // unless we need expanded product metadata (we do, for tier).
      // -----------------------------------------------------------------------
      case "customer.subscription.updated": {
        const updatedSub = event.data.object as Stripe.Subscription;

        // We need product metadata for the tier, so re-fetch with expansion.
        const subscription = await retrieveSubscriptionExpanded(
          stripe,
          updatedSub.id,
        );

        // Retrieve the user_id from the existing row in Supabase.
        const { data: existing, error: fetchError } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("id", subscription.id)
          .single();

        if (fetchError || !existing) {
          // The row may not exist yet if this update races ahead of the
          // checkout.session.completed event that creates it. Return 500 so
          // Stripe retries — by then the row should exist. Persistent failures
          // surface in the Stripe dashboard, unlike a silent log + 200.
          console.error(
            "[stripe-webhook] customer.subscription.updated: subscription row not found for",
            subscription.id,
          );
          return NextResponse.json(
            { error: "Subscription row not found, will retry" },
            { status: 500 },
          );
        }

        const row = buildSubscriptionRow(
          subscription,
          existing.user_id as string,
        );
        const { error } = await supabase
          .from("subscriptions")
          .upsert(row, { onConflict: "id" });

        if (error) {
          throw new Error(
            `[stripe-webhook] upsert failed on customer.subscription.updated: ${error.message}`,
          );
        }
        break;
      }

      // -----------------------------------------------------------------------
      // Subscription deleted (canceled immediately or at period end and expired).
      // Mark the row as canceled rather than deleting so history is preserved.
      // -----------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", deletedSub.id);

        if (error) {
          throw new Error(
            `[stripe-webhook] update failed on customer.subscription.deleted: ${error.message}`,
          );
        }
        break;
      }

      default:
        // Unhandled event types are silently acknowledged.
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[stripe-webhook] Handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
