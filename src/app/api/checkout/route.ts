import { NextRequest, NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Allowlist of valid lookup keys — must match stripe-fixtures.json exactly.
// Validates the client payload before passing anything to Stripe.
const ALLOWED_LOOKUP_KEYS = new Set([
  "starter_monthly",
  "starter_annual",
  "pro_monthly",
  "pro_annual",
  "premium_monthly",
  "premium_annual",
]);

interface CheckoutBody {
  lookupKey: unknown;
}

export async function POST(request: NextRequest) {
  // 1. Parse and validate the request body
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { lookupKey } = body;

  if (typeof lookupKey !== "string" || !ALLOWED_LOOKUP_KEYS.has(lookupKey)) {
    return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 });
  }

  // 2. Require an authenticated Supabase user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required.", redirectTo: "/sign-in?redirect=/pricing" },
      { status: 401 },
    );
  }

  // 3. Resolve the lookup key to a Stripe Price
  const stripe = createStripeClient();

  let priceId: string;
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ["data.product"],
    });

    const price = prices.data[0];
    if (!price) {
      return NextResponse.json(
        { error: "Price not found. Please try again." },
        { status: 404 },
      );
    }
    priceId = price.id;
  } catch (err) {
    console.error("[checkout] stripe.prices.list error:", err);
    return NextResponse.json(
      { error: "Unable to resolve plan pricing. Please try again." },
      { status: 502 },
    );
  }

  // 4. Determine success/cancel URLs
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000";

  const successUrl = `${origin}/dashboard?checkout=success`;
  const cancelUrl = `${origin}/pricing`;

  // 5. Create the Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        // metadata on the subscription so the webhook can correlate to Supabase user
        metadata: { user_id: user.id },
        trial_period_days: 7,
      },
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] stripe.checkout.sessions.create error:", err);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 502 },
    );
  }
}
