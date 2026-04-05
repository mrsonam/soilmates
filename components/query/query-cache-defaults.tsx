"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  DEFAULT_GC_TIME_MS,
  DEFAULT_STALE_TIME_MS,
  SEED_GC_TIME_MS,
  SEED_STALE_TIME_MS,
} from "@/lib/query-cache-policy";
import { queryKeys } from "@/lib/query-keys";
import { getRecentPlantVisits } from "@/lib/recently-viewed";

const RECENT_PLANT_GC_MS = 60 * 60_000;

/**
 * Applies conservative defaults to all Soil Mates versioned queries so RSC-seeded
 * caches are not churned by focus/mount/refetch. Future network queries should set
 * their own `staleTime` / `queryFn` explicitly.
 */
export function QueryCacheDefaults({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    qc.setQueryDefaults(queryKeys.root, {
      staleTime: SEED_STALE_TIME_MS,
      gcTime: SEED_GC_TIME_MS,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });
  }, [qc]);

  /** Keep recently opened plants warmer longer (repeat navigation). */
  useEffect(() => {
    for (const v of getRecentPlantVisits()) {
      qc.setQueryDefaults(
        queryKeys.plant.scope(v.collectionSlug, v.plantSlug),
        {
          gcTime: RECENT_PLANT_GC_MS,
        },
      );
    }
  }, [qc]);

  return <>{children}</>;
}

/** Documented defaults for QueryClient (non-prefixed queries). */
export const queryClientGlobalDefaults = {
  queries: {
    staleTime: DEFAULT_STALE_TIME_MS,
    gcTime: DEFAULT_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount: number, error: unknown) => {
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes("Unauthorized"))
        return false;
      return true;
    },
  },
  mutations: {
    retry: 1,
  },
} as const;
