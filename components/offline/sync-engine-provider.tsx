"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  QueryCacheDefaults,
  queryClientGlobalDefaults,
} from "@/components/query/query-cache-defaults";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getOfflineDb } from "@/lib/offline/db";
import { SYNC_WATCHDOG_INTERVAL_MS } from "@/lib/sync/constants";
import { subscribeOnlineStatus } from "@/lib/sync/network";
import { processSyncQueueOnce, refreshPendingCounts } from "@/lib/sync/replay";
import { resetStuckSyncingMutations } from "@/lib/sync/stuck";
import { useSyncStore } from "@/lib/stores/sync-store";

export function SyncEngineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setOnline = useSyncStore((s) => s.setOnline);
  const setSyncing = useSyncStore((s) => s.setSyncing);
  const setReady = useSyncStore((s) => s.setReady);
  const setCounts = useSyncStore((s) => s.setCounts);
  const bumpLastSync = useSyncStore((s) => s.bumpLastSync);
  const flushing = useRef(false);
  const offlineSyncEnabled = getFeatureFlags().offlineSync;

  const refreshCounts = useCallback(async () => {
    const c = await refreshPendingCounts();
    setCounts({
      pendingMutations: c.mutations,
      pendingImages: c.images,
      conflictCount: c.conflicts,
      deadLetterCount: c.deadLetters,
    });
  }, [setCounts]);

  const flush = useCallback(async () => {
    if (!offlineSyncEnabled) return;
    if (flushing.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    flushing.current = true;
    setSyncing(true);
    try {
      const r = await processSyncQueueOnce();
      await refreshCounts();
      if (r.processed > 0) {
        bumpLastSync(
          r.errors > 0
            ? "Some changes need a quick review"
            : "Changes saved",
        );
        try {
          router.refresh();
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSyncing(false);
      flushing.current = false;
    }
  }, [bumpLastSync, offlineSyncEnabled, refreshCounts, router, setSyncing]);

  useEffect(() => {
    setReady(true);
    if (!offlineSyncEnabled) return;
    void (async () => {
      const db = getOfflineDb();
      if (db) {
        await db.syncQueue
          .where("status")
          .equals("syncing")
          .modify({ status: "pending", syncingStartedAt: undefined });
      }
      await refreshCounts();
    })();
  }, [offlineSyncEnabled, refreshCounts, setReady]);

  useEffect(() => {
    if (!offlineSyncEnabled) return;
    return subscribeOnlineStatus((online) => {
      setOnline(online);
      if (online) {
        void flush();
      }
    });
  }, [flush, offlineSyncEnabled, setOnline]);

  useEffect(() => {
    if (!offlineSyncEnabled) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void flush();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [flush, offlineSyncEnabled]);

  /** Unstick interrupted syncs and retry periodically so the queue never stays silent forever. */
  useEffect(() => {
    if (!offlineSyncEnabled) return;
    const id = window.setInterval(() => {
      void (async () => {
        await resetStuckSyncingMutations();
        await refreshCounts();
        if (typeof navigator !== "undefined" && navigator.onLine) {
          await flush();
        }
      })();
    }, SYNC_WATCHDOG_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [flush, offlineSyncEnabled, refreshCounts]);

  return <>{children}</>;
}

export function OfflineProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: queryClientGlobalDefaults,
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheDefaults>
        <SyncEngineProvider>{children}</SyncEngineProvider>
      </QueryCacheDefaults>
    </QueryClientProvider>
  );
}
