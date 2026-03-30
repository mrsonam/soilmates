"use client";

import { useAppRealtimeSync } from "@/hooks/use-app-realtime-sync";

/** Mount once under the app shell for silent collaborative refresh. */
export function AppRealtimeSync() {
  useAppRealtimeSync();
  return null;
}
