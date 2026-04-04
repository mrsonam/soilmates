export function formatShortDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Fixed `en` + explicit hour12 so SSR and browser produce identical strings
 * (avoids hydration mismatch from `toLocaleString(undefined, …)`).
 */
export function formatMediumDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** Care log list: “Today at 8:45 AM” or “Mar 28, 2024”. */
export function formatCareLogWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfThat = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfThat.getTime()) / 86400000,
  );

  const timeStr = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (dayDiff === 0) return `Today at ${timeStr}`;
  if (dayDiff === 1) return `Yesterday at ${timeStr}`;
  if (dayDiff < 7) {
    return new Intl.DateTimeFormat("en", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Display length from a value stored in centimeters (user preference). */
export function formatLengthFromCm(
  valueCm: number,
  unit: "cm" | "in",
  fractionDigits = 1,
): string {
  if (unit === "cm") {
    return `${valueCm.toFixed(fractionDigits)} cm`;
  }
  const inches = valueCm / 2.54;
  return `${inches.toFixed(fractionDigits)} in`;
}
