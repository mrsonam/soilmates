"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getOfflineDb } from "@/lib/offline/db";
import { subscribeOnlineStatus } from "@/lib/sync/network";
import { processSyncQueueOnce, refreshPendingCounts } from "@/lib/sync/replay";
import { useSyncStore } from "@/lib/stores/sync-store";

export function SyncEngineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setOnline = useSyncStore((s) => s.setOnline);
  const setSyncing = useSyncStore((s) => s.setSyncing);
  const setReady = useSyncStore((s) => s.setReady);
  const setCounts = useSyncStore((s) => s.setCounts);
  const bumpLastSync = useSyncStore((s) => s.bumpLastSync);
  const flushing = useRef(false);

  const refreshCounts = useCallback(async () => {
    const c = await refreshPendingCounts();
    setCounts({
      pendingMutations: c.mutations,
      pendingImages: c.images,
      conflictCount: c.conflicts,
    });
  }, [setCounts]);

  const flush = useCallback(async () => {
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
  }, [bumpLastSync, refreshCounts, router, setSyncing]);

  useEffect(() => {
    setReady(true);
    void (async () => {
      const db = getOfflineDb();
      if (db) {
        await db.syncQueue
          .where("status")
          .equals("syncing")
          .modify({ status: "pending" });
      }
      await refreshCounts();
    })();
  }, [refreshCounts, setReady]);

  useEffect(() => {
    return subscribeOnlineStatus((online) => {
      setOnline(online);
      if (online) {
        void flush();
      }
    });
  }, [flush, setOnline]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void flush();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [flush]);

  return <>{children}</>;
}

export function OfflineProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 1_800_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <SyncEngineProvider>{children}</SyncEngineProvider>
    </QueryClientProvider>
  );
}
