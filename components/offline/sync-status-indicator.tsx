"use client";

import { Cloud, CloudOff, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useSyncStatus } from "@/hooks/useSyncStatus";

export function SyncStatusIndicator() {
  const { phase, ready, pendingMutations, pendingImages, conflictCount } =
    useSyncStatus();

  if (!ready) {
    return (
      <span
        className="inline-flex size-9 items-center justify-center rounded-2xl text-on-surface-variant/40"
        aria-hidden
      >
        <Cloud className="size-5" strokeWidth={1.5} />
      </span>
    );
  }

  const pending = pendingMutations + pendingImages;
  const label =
    phase === "offline"
      ? "Offline"
      : phase === "syncing"
        ? "Syncing changes"
        : conflictCount > 0
          ? "Sync needs attention"
          : pending > 0
            ? "Changes waiting to sync"
            : "Online";

  const Icon =
    phase === "offline"
      ? CloudOff
      : phase === "syncing"
        ? Loader2
        : conflictCount > 0
          ? AlertCircle
          : pending > 0
            ? RefreshCw
            : Cloud;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-surface-container-high/90 px-4 py-2 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/12"
      title={label}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={[
          "size-4 shrink-0",
          phase === "syncing" ? "animate-spin" : "",
        ].join(" ")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="hidden sm:inline">{label}</span>
      {pending > 0 && phase !== "offline" ? (
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
          {pending}
        </span>
      ) : null}
    </span>
  );
}
