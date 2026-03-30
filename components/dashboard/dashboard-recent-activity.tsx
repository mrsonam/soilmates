import type { RecentActivityRow } from "@/lib/dashboard/queries";

function formatRelativeShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const start = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (start(now) - start(d)) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(d);
}

type DashboardRecentActivityProps = {
  rows: RecentActivityRow[];
};

export function DashboardRecentActivity({ rows }: DashboardRecentActivityProps) {
  return (
    <section>
      <h3 className="font-display text-lg font-semibold text-on-surface">
        Recent activity
      </h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-on-surface-variant">
          Activity will appear as plants are cared for and updated across your
          spaces.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-l-2 border-primary/25 pl-4 text-sm"
            >
              <p className="text-on-surface">{row.summary}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {formatRelativeShort(row.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
