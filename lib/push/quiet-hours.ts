/**
 * Quiet hours use minutes from midnight UTC (0–1439).
 * Overnight ranges (e.g. 22:00–07:00) use start > end.
 */
export function utcMinutesFromDate(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function isUtcMinuteInQuietPeriod(
  nowMinutesUtc: number,
  start: number | null | undefined,
  end: number | null | undefined,
): boolean {
  if (start == null || end == null) return false;
  if (start === end) return false;
  if (start < end) {
    return nowMinutesUtc >= start && nowMinutesUtc < end;
  }
  return nowMinutesUtc >= start || nowMinutesUtc < end;
}
