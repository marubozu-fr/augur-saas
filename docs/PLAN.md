# Augur SaaS — Project Plan

## Milestones

### Milestone 1: Design
Designer produces HTML/CSS mockups for all key pages before any implementation.
The mockups are the visual contract for the frontend-dev agent.

### Milestone 2: Foundation
Project scaffold from Supabase+Stripe starter, auth setup, Stripe products
configuration, Augur API client, middleware.

### Milestone 3: Public Pages
Marketing site: landing page, pricing, auth flow. Implemented from mockups.

### Milestone 4: Member Area
Protected pages: dashboard, stat detail, account/billing. Implemented from mockups.

---

## Issues

### Milestone 1: Design (all `agent-designer`)

**#1 — Design: Landing page**
Mockup for the public landing page.
- Hero section with value proposition and primary CTA
- Feature highlights (3-4 key benefits with icons)
- "How it works" section (3 steps)
- Social proof (testimonials or metrics)
- Secondary CTA / newsletter signup
- Footer with links
- Mobile responsive
- Dark theme

**#2 — Design: Pricing page**
Mockup for the pricing/plans page.
- 4 tiers side-by-side (Starter, Pro, Premium, Enterprise)
- Feature comparison table (which stats in which tier)
- Highlight the recommended plan (Pro or Premium)
- Monthly/annual toggle
- FAQ section below pricing
- Mobile: stacked cards
- Dark theme

**#3 — Design: Auth pages**
Mockup for authentication pages.
- Sign in (email/password + OAuth buttons)
- Sign up (email/password + OAuth buttons)
- Forgot password
- Clean, centered card layout
- Consistent with landing page aesthetics
- Dark theme

**#4 — Design: Member dashboard**
Mockup for the post-login dashboard.
- Stat family cards in a grid (name, brief description, tier badge)
- Locked stat cards (tier-gated) with upgrade CTA overlay
- Sidebar or top-nav with: Dashboard, Account, Logout
- Subscription tier indicator
- Instrument selector (NQ, ES)
- Search/filter stats
- Dark theme

**#5 — Design: Stat detail page**
Mockup for an individual stat's results page.
- Stat title, definition, tier badge
- Summary magnitudes (key values at a glance)
- Probability table (condition, outcome, probability, baseline, N, edge)
- Color-coded probabilities (green above baseline, red below)
- Sliced results in collapsible accordion sections
- Instrument + timeframe selector
- Breadcrumb navigation back to dashboard
- Dark theme

**#6 — Design: Account page**
Mockup for account management.
- Current subscription plan info
- Billing details (next payment date, card on file)
- "Manage subscription" button (links to Stripe portal)
- Profile settings (email, password change)
- Dark theme

---

### Milestone 2: Foundation (all `agent-frontend`)

**#7 — Scaffold: Project setup from starter**
- Clone/fork the Supabase+Stripe SaaS starter
- Clean up starter boilerplate (remove demo pages, sample data)
- Configure project structure per CLAUDE.md
- Set up Tailwind config, shadcn/ui, path aliases
- Configure ESLint, Prettier, tsconfig
- Verify `pnpm dev`, `pnpm build`, `pnpm lint` all pass clean
- Commit as initial scaffold

**#8 — Foundation: Supabase auth integration**
- Configure Supabase project (env vars)
- Set up `@supabase/ssr` with cookie-based auth
- Create middleware (`src/middleware.ts`) for session refresh
- Create Supabase client helpers (server + client)
- Auth route group `(auth)` with sign-in, sign-up, forgot-password
- Protect `(dashboard)` route group — redirect to sign-in if unauthenticated
- Supabase migration: `profiles` table (user_id, tier, created_at)

**#9 — Foundation: Stripe subscription setup**
- Define 4 products in `stripe-fixtures.json` with tier metadata
- Create Stripe webhook handler at `src/app/api/webhooks/stripe/route.ts`
- Sync subscription status to Supabase `subscriptions` table via webhooks
- Handle events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- Webhook signature verification
- Supabase migration: `subscriptions` table

**#10 — Foundation: Augur API client**
- Create `src/services/augur.ts` — server-side only, never imported by client code
- Functions: `getStatCatalog()`, `getStatDetail(statId)`, `getHealth()`
- Transform snake_case responses to camelCase TypeScript interfaces
- Define stat types in `src/types/stats.ts` (matching Augur API schema)
- Error handling with typed errors
- Response caching with `next: { revalidate }` for ISR

**#11 — Foundation: Auth middleware + tier-gating**
- Extend middleware to check subscription status for `(dashboard)` routes
- Redirect unsubscribed users to pricing page
- Create `canAccessStat(userTier, statTier)` utility
- Server-side tier check before serving stat data — never rely on client-side only
- Provide `useSubscription()` hook for client-side tier display

---

### Milestone 3: Public Pages (`agent-frontend`, depends on M1 design issues)

**#12 — Page: Landing page**
- Implement from mockup `docs/mockups/landing.html`
- Server Component (no client-side JS needed)
- CTA links to sign-up or pricing page
- Depends on: #1 (design), #7 (scaffold)

**#13 — Page: Pricing page**
- Implement from mockup `docs/mockups/pricing.html`
- Fetch tier data from Stripe (or hardcode initially, sync later)
- "Subscribe" buttons → Stripe Checkout session
- Monthly/annual toggle (client component)
- Depends on: #2 (design), #9 (Stripe setup)

**#14 — Page: Auth flow**
- Implement from mockup `docs/mockups/auth.html`
- Sign in, sign up, forgot password pages
- OAuth provider buttons (Google at minimum)
- Redirect to dashboard after successful auth
- Depends on: #3 (design), #8 (Supabase auth)

---

### Milestone 4: Member Area (`agent-frontend`, depends on M1 design + M2 foundation)

**#15 — Page: Member dashboard**
- Implement from mockup `docs/mockups/dashboard.html`
- Fetch stat catalog from Augur API (server-side)
- Display stat family cards, tier-gated with lock overlay
- Instrument selector
- Depends on: #4 (design), #10 (API client), #11 (tier-gating)

**#16 — Page: Stat detail**
- Implement from mockup `docs/mockups/stat-detail.html`
- Fetch stat data from Augur API (server-side)
- Server-side tier check before rendering
- Probability table, magnitude values, sliced accordion
- Color-coded edge (green/red)
- Depends on: #5 (design), #10 (API client), #11 (tier-gating)

**#17 — Page: Account & billing**
- Implement from mockup `docs/mockups/account.html`
- Display current plan, billing info from Supabase
- "Manage subscription" → Stripe Customer Portal
- Profile settings (email, password via Supabase Auth)
- Depends on: #6 (design), #9 (Stripe setup)
