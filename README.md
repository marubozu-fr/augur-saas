# Augur SaaS

Member-facing subscription platform for [Augur](https://augur.marubozu.ovh) trading statistics.

## Stack

- **Next.js** (App Router) on Vercel
- **Supabase** (Auth + Postgres)
- **Stripe** (Subscriptions)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript** (strict)

## Getting Started

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
