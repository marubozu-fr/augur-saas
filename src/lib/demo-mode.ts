// Single source of truth for the public demo-mode flag. Safe to call from
// both server and client code: NEXT_PUBLIC_-prefixed environment variables
// are inlined into the client bundle at build time by Next.js, so this value
// is fixed for the lifetime of a build — toggling NEXT_PUBLIC_DEMO_MODE
// requires a rebuild (`pnpm build`), not just a server restart.
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
