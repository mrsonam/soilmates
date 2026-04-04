"use client";

import { useSyncStatus } from "@/hooks/useSyncStatus";

type OfflineStateNoticeProps = {
  className?: string;
};

export function OfflineStateNotice({ className = "" }: OfflineStateNoticeProps) {
  const { phase, ready } = useSyncStatus();
  if (!ready || phase !== "offline") return null;
  return (
    <p
      className={[
        "text-sm text-on-surface-variant",
        className,
      ].join(" ")}
    >
      You&apos;re viewing saved data. New changes will sync when you reconnect.
    </p>
  );
}
