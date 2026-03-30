"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { APP_REALTIME_CHANNEL } from "@/lib/supabase/realtime-notify";

function shouldSyncRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/activity")) return true;
  if (pathname.startsWith("/collections")) return true;
  if (pathname.startsWith("/plants")) return true;
  return false;
}

/**
 * Silent refresh: Supabase Realtime broadcast when configured, plus interval + focus.
 * Reconciles server component data without toasts.
 */
export function useAppRealtimeSync() {
  const router = useRouter();
  const pathname = usePathname();
  const lastRef = useRef(0);

  const refresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 900) return;
    lastRef.current = now;
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!shouldSyncRoute(pathname)) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refresh();
      }
    }, 60_000);

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    const client = getSupabaseBrowserClient();
    let channel: RealtimeChannel | undefined;

    if (client) {
      channel = client.channel(APP_REALTIME_CHANNEL);
      channel.on("broadcast", { event: "data_changed" }, () => {
        refresh();
      });
      void channel.subscribe();
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      if (client && channel) {
        void client.removeChannel(channel);
      }
    };
  }, [pathname, refresh]);
}
