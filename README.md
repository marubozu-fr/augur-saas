# Augur SaaS

Member-facing subscription platform for [Augur](https://github.com/marubozu-fr/augur) trading statistics.

## Stack

- **Next.js** (App Router) on Vercel
- **Supabase** (Auth + Postgres)
- **Stripe** (Subscriptions)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript** (strict)

## Getting Started

Requires pnpm 11.4.0 (see `packageManager` in `package.json`).

```bash
pnpm install
cp .env.local.example .env.local  # Fill in your keys
pnpm dev
```

## Architecture

This frontend consumes the Augur REST API for stats data. It does not contain
any stats computation, data processing, or backend logic.

See [CLAUDE.md](./CLAUDE.md) for full project documentation.
See [docs/PLAN.md](./docs/PLAN.md) for milestones and issue plan.

## Demo mode

`NEXT_PUBLIC_DEMO_MODE=true` runs the app as a free public demo, with no
backend and no database: Supabase and Stripe are never touched (no client is
ever created, no env var is required), auth/subscription gates on
`/dashboard` and `/stats` are lifted, and stats are served from a bundled
JSON snapshot instead of the live Augur API. The flag is inlined at build
time, so toggling it requires a rebuild — not just a restart:

```bash
NEXT_PUBLIC_DEMO_MODE=true pnpm dev    # or `pnpm build && pnpm start`
```

**Data source.** The snapshot lives in `demo-data/results/*.json` — one file
per stat family, copied verbatim from the public
[marubozu-fr/augur](https://github.com/marubozu-fr/augur) `results/` directory
(aggregated results only, no per-session samples). `demo-data/SOURCE` records
the exact repository and commit the snapshot was taken from. Refresh it with:

```bash
scripts/sync-demo-snapshot.sh [ref]   # ref defaults to "main"
```

**Limitations.** The snapshot has no per-session samples, so period filtering
(the period presets and custom date range on the stat detail page) is
unavailable in demo mode — every stat always shows its full history.

**Site chrome.** A `DemoBanner` (`src/components/DemoBanner.tsx`) is rendered
on every page, stating the data is frozen as of the latest `data_range` end
date across the snapshot (`getCatalogCoverage()` in `src/lib/stat-context.ts`,
fed by `getStatCatalog()`) and linking to this repository. The
marketing header and footer (`src/app/[locale]/(marketing)/layout.tsx`) drop
"Pricing"/"Sign in" and every link to a page that doesn't exist in demo mode
(billing, about, terms…), replacing them with an "Open the demo" CTA and a
"Project" footer column linking to this repo, the
[stats engine repo](https://github.com/marubozu-fr/augur) and the license.

**Primary instrument.** `/dashboard` redirects to the instrument covering the
most stat families in the snapshot (`pickPrimaryInstrument()` in
`src/lib/stat-context.ts`, ties broken alphabetically) instead of the
alphabetically first one — NQ has full family coverage, ES is missing the
initial-balance variants.

## License

MIT — see [LICENSE](LICENSE).
