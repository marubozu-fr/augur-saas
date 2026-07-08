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
| 2 | Pricing page | [`pricing.html`](./pricing.html) | Done | Shared header/footer from landing. Monthly/annual segmented toggle (Save 20%), 4 plan cards (Starter €29 / Pro €79 featured "Most popular" / Premium €149 / Enterprise Custom), grouped feature-comparison table with sticky header + horizontal scroll on mobile, 7-item FAQ accordion (`<details>`), closing CTA band. |
| 3 | Auth pages | [`auth.html`](./auth.html) | Done | Centered card on the shared ambient-glow background + brand mark. Three views stacked for preview: sign in (email/password, remember-me, forgot link), sign up (password hint, terms checkbox, loading submit state), forgot password (request form with inline error + "check your inbox" success state). Google + GitHub OAuth buttons (Supabase Auth), show/hide password toggle. |
| 4 | Member dashboard | [`dashboard.html`](./dashboard.html) | Done | **Establishes the member app-shell**: sidebar-only navigation, no top bar (Stripe / Linear / Vercel style). The persistent left sidebar holds the nav (Dashboard / Account + catalog categories), the plan/tier indicator badge (full-width, near the bottom), Logout, and a theme toggle in the footer. A floating hamburger button (≤860px) opens the sidebar as a Sheet drawer. The instrument Combobox dropdown lives in the page toolbar alongside the search input + category filter chips. Page: greeting + daily-refresh note, upgrade banner, search input + category filter chips, responsive grid of stat-family cards (name, instrument, short description, tier badge, headline edge vs baseline, N, "View stats" CTA). All four states stacked for preview: **populated** (with two locked cards inline), **loading** (shimmer skeleton grid), **empty** (no-results panel + clear-filters), **locked** (isolated tier-gated card with blurred body + overlay upgrade CTA). |
| 5 | Stat detail | [`stat-detail.html`](./stat-detail.html) | Done | **Reuses the dashboard app-shell** (sidebar-only, no top bar; plan/tier badge + theme toggle in the sidebar) for continuity. Real data from `augur/results/engulfing_candles.json` (NQ · daily, 2008–2026, N = 4,332). Breadcrumb (Dashboard / category / stat), header with title + Tier 2 badge + full definition, controls card (instrument Combobox dropdown — searchable asset list, scales past NQ/ES — + daily timeframe segmented control, data range + total N). **Summarised magnitudes**: 4 key-value cards for avg/max continuation (value vs baseline, bullish/bearish coloured). **Pattern-frequency probability table** (condition, outcome, probability, baseline, N, edge) with mono/tabular numbers and colour-coded edge pills (green above baseline / red below / neutral near). **Slices accordion** (native `<details>`): "Day of week" open with grouped Monday–Friday sub-table, plus a collapsed Tier-3 dimension showing the locked empty state. **Loading** skeleton (summary cards + table) stacked for preview. Table keeps `min-width` and scrolls horizontally on mobile; sidebar collapses to a Sheet drawer at ≤860px. |
| 6 | Account & billing | [`account.html`](./account.html) | Done | **Reuses the dashboard app-shell** (sidebar-only, no top bar; "Account" active; no instrument selector — no instrument context). Single readable-width column of cards: **Current plan** (name, price, tier access, renewal/member-since dates, accent "Upgrade plan" CTA → pricing), **Billing details** (next payment, saved payment method, billing email, "Manage subscription" → Stripe Customer Portal — invoices/cancellation handled there), **Profile settings** (read-only email with Change affordance + Supabase confirmation note, change-password form), minimal **Danger zone** (cancel → Stripe portal link). Accent for CTAs only — no green/red. **Loading** skeleton stacked for preview; cards stack and sidebar collapses to Sheet at ≤860px. |
| 7 | Stat detail v2 (filter zones) | [`stat-detail-v2.html`](./stat-detail-v2.html) | Done | **Redesign of #5's filter UI** (issue #85); reuses the same app-shell and all data sections. Two stacked filter surfaces below the breadcrumb. **Context zone** (prominent card — strong border, accent wash, elevation) defines *what* you look at: an **Instrument Select** (NQ / ES) beside a searchable **Stat Combobox** (~15 realistic families: Opening Candle Continuation, Initial Balance Breakout, Gap Fill, Opening Range Indicator, Overnight Range Breakout, Engulfing Candles, …) on row 1; a **Period ToggleGroup** (single: All / 1m / 3m / 6m / YTD / 1yr / 2yr / 3yr / 5yr / 10yr) + **Custom** date-range Popover on row 2. Instrument change preserves stat + period; stat change navigates to `/stats/[family]` preserving instrument + period. **Data filter zone** (lighter, muted surface) below the title refines *how* the data is sliced: a **Timeframe ToggleGroup** (15min / 30min / 1h), the row built to host future stat-specific filters. Then the carried-over **metadata strip** (period-aware), **summarised magnitudes**, **pattern-frequency table** and **slice accordions** (numbers verbatim from v1's engulfing_candles.json; outcome labels reworded engulfing → continuation to match the default stat). Stacked states: **default** (All · NQ · 1h · Opening Candle Continuation), **selectors open** (Select + searchable Combobox), **period selected 6m** (metadata strip re-scoped: 2025-11-05 → 2026-05-05, 124 of 4,332 sessions), **custom expanded** (Popover + Calendar with highlighted range), **loading** skeleton, and a **mobile ≤768px** narrow-frame preview. Genuinely responsive at 768px (context rows stack, period chips scroll horizontally, filter zone + metadata stack) in addition to the ≤860px sidebar Sheet. |
| 8 | Visual stat display | [`stat-visual-display.html`](./stat-visual-display.html) | Done | **Visual-first stat display system** (issue #95); evolution of #5/#7 that leads with an at-a-glance visual per condition instead of a table. Reuses the same app-shell, breadcrumb, header, `.meta-strip`, `.stat-table` / `.edge-pill`, footnote voice and `.narrow-frame`. **One `.vcard` per condition** in a responsive `auto-fit` grid (side by side on desktop, single column ≤768px). Because Opening Candle Continuation has **two conditions** (green / red opening candle), the default row shows **5 cards**: Green Opening Candle, Red Opening Candle, Engulfing, Inside Bars, Gap Fill. Each candle card = a **custom inline-SVG glyph** with a **solid** green/red body (left) + **diverging bars** (right): the green-day outcome grows UP and the red-day outcome grows DOWN from a shared dashed zero axis, with the exact % as real text at each bar tip. Three coherent candle glyphs (single / engulfing / inside-bar, shared 2.5px round-cap wick language, mono timeframe baked into the signal-candle body in dark ink for contrast on the solid fill). **Gap Fill** uses the DEFAULT fallback template (no glyph): colored dot + hero % + horizontal green/red split bar. The default card view shows **only** the glyph + diverging bars + legend — the edge / baseline / N detail is moved into the Advanced panel. Below the row sits the single context line `NQ · 15min · YTD · 4,332 sessions · 2008-12-11 → 2026-05-05`. A discrete **Advanced** toggle (native `<details>`) under each card reveals the edge caption, a metadata strip + the exact Condition/Outcome/Probability/Baseline/N/Edge table. Outcome vocabulary is **Green day / Red day** (mutually exclusive, sum to 100%): Green opening candle 73.2/26.8 (+23.2 pts), Red opening candle 28.1/71.9 (+21.9 pts); other invented splits stay consistent with their tables (Engulfing 53.9/46.1 +3.9 · Inside Bars 55.1/44.9 +5.1 · Gap Fill 72.3/27.7 +4.3). Stacked states: **visual row (default, Advanced collapsed)**, **Advanced expanded** (Green Opening Candle: caption + metadata strip + table rendered open), **glyph specimen** (icon set in isolation), and **mobile ≤768px** narrow-frame preview. |
| 9 | Language switcher | [`language-switcher.html`](./language-switcher.html) | Done | **Locale switcher** (issue #114) for the public header + account page. A compact, **secondary** control that shows the current locale **code only** (EN / FR) — **no flags** — where each option is a navigation link to the equivalent page in the other locale (`/en/pricing` <-> `/fr/pricing`), not a form control. The specimen file stacks every state: **desktop header closed** (EN active + FR active), **desktop header open** (EN active + FR active, active locale = accent tint + accent code + check), and the **mobile Sheet drawer** language block (full-width link rows, EN active + FR active). The reusable `.lang-switch` component (shadcn/ui **DropdownMenu**) lives in `styles.css`. Also wired into the real headers/cards: [`landing.html`](./landing.html) gains the closed switcher between the nav links and the CTAs (hidden <=680px, where it moves into the Sheet), and [`account.html`](./account.html) gains a **Language** field in the Profile settings card below the password form — a shadcn/ui **Select** (Auto (browser) / English / Français) that saves immediately on change (mirrors the inline email-change UX), with EN + FR + open-menu variants shown in a mockup-only block. |

## Conventions

- **shadcn/ui mapping** — every meaningful section carries an HTML comment
  mapping it to the shadcn/ui component(s) the frontend-dev should use
  (e.g. `shadcn/ui: Card + CardHeader + CardContent`, `shadcn/ui: Button`).
- **Realistic data** — no lorem ipsum. Trading stats use real-sounding
  probabilities, baselines, and sample sizes (N).
- **Color semantics** — green = above baseline / positive edge, red = below
  baseline / negative edge, neutral grey = no significant edge. Accent (sky/teal)
  is for CTAs and interactive elements only. Never reuse green/red for anything
  other than edge direction. On the pricing page the accent is used for
  included-feature checks and the featured plan — green/red are intentionally
  absent (no edge direction to convey). The account page follows the same rule:
  accent for CTAs only, no green/red.
- **Numbers** — all numeric values use the monospace font with
  `font-variant-numeric: tabular-nums` (`.mono` / `.num` helper classes).
- **Responsive** — mobile-first; cards stack and nav collapses to a Sheet
  drawer below the documented breakpoints. The pricing comparison table keeps a
  `min-width` and scrolls horizontally inside its container on small screens.
  The dashboard sidebar collapses into a Sheet drawer at ≤860px, opened by a
  floating hamburger button at the top-left of the content column (the slim top
  bar has been removed); the stat grid steps 3 → 2 → 1 columns.
- **Indentation** — 2 spaces (HTML and CSS), per project code style.
