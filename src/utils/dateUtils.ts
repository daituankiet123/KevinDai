// Local-timezone date helpers. Avoid `toISOString().slice(0, 10)` for
// "today" because it returns the UTC date, which can be a day behind in
// positive-UTC-offset timezones (e.g. Vietnam UTC+7 after 00:00 local).

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

// Parse a "YYYY-MM-DD" string as local time (not UTC). `new Date("2026-03-04")`
// is parsed as UTC midnight, which shifts the date in positive-UTC timezones.
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayMonthStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
