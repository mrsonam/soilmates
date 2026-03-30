import type { ReminderPreferredWindow } from "@prisma/client";

export type IntervalUnit = "days" | "weeks" | "months";

const WINDOW_HOUR: Record<ReminderPreferredWindow, number> = {
  morning: 9,
  afternoon: 14,
  evening: 19,
  flexible: 12,
};

/** Add interval to a date (local calendar). */
export function addInterval(
  from: Date,
  value: number,
  unit: IntervalUnit,
): Date {
  const d = new Date(from.getTime());
  if (unit === "days") {
    d.setDate(d.getDate() + value);
  } else if (unit === "weeks") {
    d.setDate(d.getDate() + value * 7);
  } else {
    d.setMonth(d.getMonth() + value);
  }
  return d;
}

/** Set local time-of-day from preferred window (hour only). */
export function applyPreferredWindow(
  d: Date,
  window: ReminderPreferredWindow | null,
): Date {
  if (!window) return d;
  const hour = WINDOW_HOUR[window];
  const out = new Date(d.getTime());
  out.setHours(hour, 0, 0, 0);
  return out;
}

/**
 * First scheduled due: from now, add one interval, then align to preferred window on that calendar day.
 */
export function computeFirstNextDueAt(
  intervalValue: number,
  intervalUnit: IntervalUnit,
  preferredWindow: ReminderPreferredWindow | null,
  from: Date = new Date(),
): Date {
  const stepped = addInterval(from, intervalValue, intervalUnit);
  return applyPreferredWindow(stepped, preferredWindow);
}

/**
 * Next due after a completion at `completedAt`.
 */
export function computeNextDueAfterCompletion(
  completedAt: Date,
  intervalValue: number,
  intervalUnit: IntervalUnit,
  preferredWindow: ReminderPreferredWindow | null,
): Date {
  const stepped = addInterval(completedAt, intervalValue, intervalUnit);
  return applyPreferredWindow(stepped, preferredWindow);
}
