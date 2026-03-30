import type { ReminderListItem } from "@/lib/reminders/queries";

const UNIT_LABEL: Record<string, string> = {
  days: "day",
  weeks: "week",
  months: "month",
};

export function ReminderRecurrenceSummary({
  item,
}: {
  item: Pick<ReminderListItem, "recurrenceRule">;
}) {
  const { intervalValue, intervalUnit } = item.recurrenceRule;
  const u = UNIT_LABEL[intervalUnit] ?? intervalUnit;
  const plural = intervalValue === 1 ? "" : "s";
  return (
    <span className="text-sm text-on-surface-variant">
      Every {intervalValue} {u}
      {plural}
    </span>
  );
}
