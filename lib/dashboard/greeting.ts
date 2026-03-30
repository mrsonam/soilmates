export function timeOfDayLabel(date: Date = new Date()): "morning" | "afternoon" | "evening" {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function dashboardGreetingLine(
  firstName: string,
  date: Date = new Date(),
): string {
  const t = timeOfDayLabel(date);
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return `Good ${t}, ${firstName}`;
}
