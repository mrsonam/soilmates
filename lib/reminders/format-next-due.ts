const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** For display in the browser after hydration; avoid calling from RSC. */
export function formatNextDueLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dayStart = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (dayStart(d) - dayStart(now)) / (24 * 3600 * 1000),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < -1) return `${-diffDays} days ago`;

  const time = TIME_FMT.format(d);
  const date = DATE_FMT.format(d);
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days · ${time}`;
  return `${date} · ${time}`;
}
