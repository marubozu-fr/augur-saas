// Server-side Stripe client factory.
// Import this only in Server Components, API routes, and server actions.
// NEVER import from client components — STRIPE_SECRET_KEY must not reach the browser.
//
// We export a factory function rather than a module-level singleton so that
// the Stripe SDK is not instantiated at import time. Instantiation at module
// level causes `next build` to throw when STRIPE_SECRET_KEY is absent from
// the build environment (it is a runtime secret, not a build-time variable).

import "server-only";

import Stripe from "stripe";

export function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });
}
