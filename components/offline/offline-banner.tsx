"use client";

import { useSyncStatus } from "@/hooks/useSyncStatus";

export function OfflineBanner() {
  const { phase, ready } = useSyncStatus();

  if (!ready || phase !== "offline") return null;

  return (
    <div className="border-b border-outline-variant/10 bg-surface-container-high/50 px-4 py-2 text-center text-xs text-on-surface-variant">
      You&apos;re offline. Changes you make will sync when you reconnect.
    </div>
  );
}
