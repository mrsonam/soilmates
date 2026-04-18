/**
 * Portfolio → app deep link + demo credentials for the "Use demo account" login action.
 *
 * Link from your portfolio (highlight + one-tap fill):
 *   `/login?pf_src=soilmates`
 *
 * Keep `getPublicDemoLoginDefaults()` aligned with `prisma/seed.ts` when `DEMO_SEED_*` env vars are unset.
 */

export const PORTFOLIO_DEMO_QUERY_KEY = "pf_src";

/** Unique marker — use only on your portfolio CTA link. */
export const PORTFOLIO_DEMO_QUERY_VALUE = "soilmates";

const FALLBACK_DEMO_EMAIL = "garden-demo@example.soilmates";
const FALLBACK_DEMO_PASSWORD = "DemoGarden2026!";

/** Client bundle: matches seeded demo user when env mirrors DEMO_SEED_* / seed fallbacks. */
export function getPublicDemoLoginDefaults(): {
  email: string;
  password: string;
} {
  const email =
    process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL?.trim().toLowerCase() ??
    FALLBACK_DEMO_EMAIL;
  const password =
    process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? FALLBACK_DEMO_PASSWORD;
  return { email, password };
}

export function isPortfolioDemoLink(
  params: Pick<URLSearchParams, "get">,
): boolean {
  return params.get(PORTFOLIO_DEMO_QUERY_KEY) === PORTFOLIO_DEMO_QUERY_VALUE;
}
