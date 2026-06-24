# Augur SaaS — Mockups

HTML/CSS mockups that act as the **visual contract** for the frontend-dev agent.
Open any `.html` file directly in a browser to preview. No build step, no
external assets, no CDN — everything is self-contained.

## Shared design tokens

[`styles.css`](./styles.css) holds the **single source of truth** for the design
system: colors, typography, spacing, radii, shadows, and reusable component
classes (`.btn`, `.badge`, `.card`, etc.) as CSS custom properties. Every mockup
imports it via `<link rel="stylesheet" href="styles.css">`. Page-specific layout
lives in a `<style>` block in each HTML file and only references existing tokens
— no new color or spacing values are introduced per page.

The token names in `styles.css` are the contract for `tailwind.config.ts`
(`theme.extend`) and the shadcn/ui CSS variables in `globals.css`.

**Dark theme is the default and primary.** A light theme is provided as a
secondary override via `[data-theme="light"]` on the root element.

The full written design reference will live in
[`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md).

## Mockup index

| # | Mockup | File | Status | Notes |
|---|--------|------|--------|-------|
| 1 | Landing page | [`landing.html`](./landing.html) | Done | Hero, features, how-it-works, metrics + testimonials, newsletter CTA, footer. Establishes shared tokens. |
| 2 | Pricing page | `pricing.html` | Pending | 4 tiers, comparison table, monthly/annual toggle, FAQ |
| 3 | Auth pages | `auth.html` | Pending | Sign in / sign up / forgot password |
| 4 | Member dashboard | `dashboard.html` | Pending | Stat family cards, tier-gating overlay, nav |
| 5 | Stat detail | `stat-detail.html` | Pending | Probability table, sliced accordion, color-coded edge |
| 6 | Account & billing | `account.html` | Pending | Plan info, billing, profile settings |

## Conventions

- **shadcn/ui mapping** — every meaningful section carries an HTML comment
  mapping it to the shadcn/ui component(s) the frontend-dev should use
  (e.g. `shadcn/ui: Card + CardHeader + CardContent`, `shadcn/ui: Button`).
- **Realistic data** — no lorem ipsum. Trading stats use real-sounding
  probabilities, baselines, and sample sizes (N).
- **Color semantics** — green = above baseline / positive edge, red = below
  baseline / negative edge, neutral grey = no significant edge. Accent (sky/teal)
  is for CTAs and interactive elements only. Never reuse green/red for anything
  other than edge direction.
- **Numbers** — all numeric values use the monospace font with
  `font-variant-numeric: tabular-nums` (`.mono` / `.num` helper classes).
- **Responsive** — mobile-first; cards stack and nav collapses to a Sheet
  drawer below the documented breakpoints.
- **Indentation** — 2 spaces (HTML and CSS), per project code style.
