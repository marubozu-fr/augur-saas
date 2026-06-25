"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe";
import { getActiveSubscription } from "@/lib/subscription.server";

// ---------------------------------------------------------------------------
// Billing portal — Stripe Customer Portal redirect.
// Derives the Stripe customer id from the active subscription id stored in
// Supabase, creates a portal session, then redirects the user to it.
// Both "Manage subscription" and "Cancel in Stripe portal" use this action.
// ---------------------------------------------------------------------------

export async function redirectToBillingPortal(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const subscription = await getActiveSubscription();

  if (!subscription) {
    redirect("/pricing");
  }

  const stripe = createStripeClient();

  // The subscription id (sub_...) stored in Supabase is the Stripe subscription
  // id. Retrieve it from Stripe to get the customer id without storing
  // stripe_customer_id separately in Supabase.
  const stripeSub = await stripe.subscriptions.retrieve(subscription.id);
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/account`;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  redirect(session.url);
}

// ---------------------------------------------------------------------------
// Change email — triggers Supabase confirmation flow.
// Returns an error string on failure, or null on success (the caller surfaces
// the "confirmation link sent" message).
// ---------------------------------------------------------------------------

export async function changeEmail(
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const newEmail = formData.get("email") as string;

  if (!newEmail || !newEmail.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ---------------------------------------------------------------------------
// Change password — validates and updates via Supabase Auth.
// Returns an error string on failure, or null on success.
// ---------------------------------------------------------------------------

export async function changePassword(
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 12) {
    return { error: "New password must be at least 12 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
