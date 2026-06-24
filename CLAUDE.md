# Augur SaaS — Trading Statistics Platform

## Project Overview
Member-facing SaaS frontend for Augur, a trading probability platform.
Displays statistical market probabilities to subscribed users. Consumes the
Augur REST API (`augur.marubozu.ovh`) — this repo contains **no backend logic,
no stats engine, no data processing**. Authentication, user management, and
subscription billing are handled by Supabase and Stripe.

Repository: `marubozu-fr/augur-saas` — Private

## Tech Stack
- **Framework**: Next.js (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Supabase Auth (email/password, OAuth providers)
- **Database**: Supabase (Postgres) — users, profiles, subscription status
- **Payments**: Stripe (subscriptions, webhooks synced to Supabase)
- **Deployment**: Vercel
- **Package manager**: pnpm

## Architecture

### Data Flow
```
User → Vercel (Next.js) → Supabase (auth + user data)
                        → Stripe (payments)
                        → Augur API (stats data via server-side X-API-Key)
```

The Next.js server calls the Augur API with a **service-level API key** stored
in `AUGUR_API_KEY` env var. This key is NEVER exposed to the browser. Stats data
flows: server component → Augur API → filter by user tier → render.

### Subscription Tiers
| Plan       | Stats Access   | Stripe Product |
|------------|----------------|----------------|
| Starter    | Tier 1         | prod_starter   |
| Pro        | Tier 1 + 2     | prod_pro       |
| Premium    | Tier 1–3       | prod_premium   |
| Enterprise | All tiers      | prod_enterprise|

Tier mapping is stored in Stripe product metadata and synced to Supabase via
webhooks. The middleware reads the user's active subscription to gate access.

### Project Structure
```
augur-saas/
├── .claude/
│   ├── agents/           # Claude Code specialized agents
│   │   ├── ui-designer.md    # HTML/CSS mockups (no production code)
│   │   ├── frontend-dev.md   # Next.js implementation
│   │   └── code-reviewer.md  # PR review
│   └── skills/
│       ├── fix-issue/    # Issue → agent routing
│       └── pr-ready/     # Quality gate before PR
├── src/
│   ├── app/
│   │   ├── (marketing)/  # Public: landing, pricing, about
│   │   ├── (auth)/       # Auth: sign-in, sign-up, forgot-password
│   │   ├── (dashboard)/  # Protected: member area
│   │   │   ├── dashboard/
│   │   │   ├── stats/[statId]/
│   │   │   └── account/
│   │   ├── api/          # API routes (Stripe webhooks)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/           # shadcn/ui generated components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, Stripe helpers, utilities
│   ├── services/         # Augur API client
│   └── types/            # TypeScript interfaces
├── docs/
│   ├── mockups/          # Designer HTML/CSS mockups
│   └── DESIGN_SYSTEM.md  # SaaS visual reference
├── public/
├── supabase/
│   └── migrations/       # Supabase DB migrations
├── stripe-fixtures.json  # Stripe product/price definitions
├── CLAUDE.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Code Style — STRICT
- **Language**: All code, comments, commit messages, and documentation in English.
- **Conversations** (chat, prompts): French.
- **Indentation**: 2 spaces everywhere (TypeScript, JSON, CSS).
- **TypeScript**: Strict mode. No `any` types. Prefer `interface` over `type` for objects.
- **Styling**: Tailwind utility classes. shadcn/ui components for standard UI elements.
  No inline `style` props. No CSS Modules. No styled-components.
- **Imports**: Use `@/` path alias for `src/` imports.
- **Components**: One component per file. PascalCase file names.
- **Server vs Client**: Default to Server Components. Use `"use client"` only when
  needed (interactivity, hooks, browser APIs). Keep client boundaries as small as possible.

## Commands
```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on :3000
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier — write
pnpm format:check     # Prettier — check only
pnpm tsc --noEmit     # Standalone type check
```

## Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Augur API
AUGUR_API_URL=https://augur.marubozu.ovh
AUGUR_API_KEY=              # Service-level key, server-side only

# App
NEXT_PUBLIC_SITE_URL=       # Production URL for redirects
```

## Git Workflow
- Branch naming: `feature/<issue-number>-short-description`, `fix/<issue-number>-short-description`
- Commit messages: `feat(scope): description`, `fix(scope): description`, `docs(scope): description`
- Every change goes through a PR linked to a GitHub issue.
- Never commit directly to `main`.
- Issue labels determine agent routing: `agent-designer`, `agent-frontend`.

## Behavioral Guidelines

### Think Before Coding
- State your assumptions explicitly before implementing. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked. No abstractions for single-use code.
- If you write 200 lines and it could be 50, rewrite it.

### Surgical Changes
- Touch only what you must. Don't "improve" adjacent code.
- If you notice unrelated issues, mention them — don't fix them silently.
- The test: every changed line should trace directly to the request.

## Project Rules
- NEVER expose the Augur API key to the browser. All stats fetching is server-side.
- NEVER hardcode subscription tier names or stat access rules — read from Supabase/Stripe metadata.
- NEVER store sensitive data in localStorage — use Supabase session management.
- ALWAYS check `docs/mockups/` and `docs/DESIGN_SYSTEM.md` before creating UI components.
- ALWAYS use shadcn/ui components when available — don't reinvent buttons, modals, tables.
- ALWAYS use Server Components by default. `"use client"` only when required.
- ALWAYS handle loading and error states for data fetching.
- ALWAYS validate Stripe webhook signatures before processing events.

## External API Reference
The Augur stats API at `augur.marubozu.ovh`:
- `GET /health` — Health check (public)
- `GET /api/v1/stats` — List all stat families (requires `X-API-Key`)
- `GET /api/v1/stats/{stat_id}` — Get stat detail (requires `X-API-Key`)
- Response envelope: `{ "data": ..., "error": null }` or `{ "data": null, "error": "message" }`
