import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Ships the bundled demo-mode snapshot (src/services/augur-snapshot.ts)
  // with every server route that can read it in demo mode. The root layout
  // renders DemoBanner (which reads the snapshot for its "frozen as of"
  // date) on every route, so every route needs the snapshot traced — not
  // just "/dashboard" and "/stats". Keys are matched with `contains: true`
  // (Next 16, node_modules/next/dist/build/collect-build-traces.js) — i.e. as
  // a substring of the route, not an exact/glob match — so the single "/"
  // key below matches every route (they all start with "/"). This option
  // lived under `experimental.outputFileTracingIncludes` before Next 15;
  // verify against node_modules/next/dist/server/config-shared.d.ts when
  // upgrading.
  outputFileTracingIncludes: {
    "/": ["demo-data/results/*.json"],
  },
};

export default withNextIntl(nextConfig);
