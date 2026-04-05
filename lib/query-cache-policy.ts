/**
 * TanStack Query tuning for Soil Mates.
 *
 * Most client queries are **RSC-seeded** (no network `queryFn`); freshness comes from
 * `router.refresh()` after mutations. These options avoid pointless refetch churn.
 *
 * Do **not** use `SEED_QUERY_OPTIONS` for future live/network queries without overrides.
 */

/** RSC-seeded entity data: treat as fresh until the server sends new props. */
export const SEED_STALE_TIME_MS = Number.POSITIVE_INFINITY;

/**
 * Keep warm entries longer so back/forward and tab switches feel instant.
 * Not sensitive data by itself (structure is public to the member).
 */
export const SEED_GC_TIME_MS = 45 * 60_000;

/** Default `gcTime` for the React Query client (unmatched queries). */
export const DEFAULT_GC_TIME_MS = 30 * 60_000;

/** Default `staleTime` for any future network-backed queries (conservative). */
export const DEFAULT_STALE_TIME_MS = 60_000;

export const SEED_QUERY_OPTIONS = {
  staleTime: SEED_STALE_TIME_MS,
  gcTime: SEED_GC_TIME_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;
