import type { ReminderDisplayStatus } from "@/lib/reminders/status";

const STYLES: Record<
  ReminderDisplayStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className:
      "bg-surface-container-high/90 text-on-surface-variant ring-1 ring-outline-variant/15",
  },
  due: {
    label: "Due",
    className:
      "bg-primary-fixed/45 text-primary ring-1 ring-primary/20",
  },
  overdue: {
    label: "Overdue",
    className:
      "bg-[#f4e8e0]/90 text-[#6b4a3a] ring-1 ring-[#e8d4c8]/80",
  },
  paused: {
    label: "Paused",
    className:
      "bg-surface-container-high/80 text-on-surface-variant/90 ring-1 ring-outline-variant/12",
  },
};

export function ReminderStatusBadge({ status }: { status: ReminderDisplayStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
        s.className,
      ].join(" ")}
    >
      {s.label}
    </span>
  );
}
