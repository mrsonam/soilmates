"use client";

import { useEffect, useState } from "react";

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const start = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (start(new Date()) - start(d)) / 86400000,
  );
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function ActivityTimestamp({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => formatRelative(iso));

  useEffect(() => {
    setLabel(formatRelative(iso));
    const t = setInterval(() => setLabel(formatRelative(iso)), 60_000);
    return () => clearInterval(t);
  }, [iso]);

  return (
    <time
      dateTime={iso}
      className="shrink-0 text-xs tabular-nums text-on-surface-variant"
    >
      {label}
    </time>
  );
}
