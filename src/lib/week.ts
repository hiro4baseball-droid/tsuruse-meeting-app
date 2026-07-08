const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns the Monday (00:00 UTC) of the week containing the given date. */
export function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return new Date(date.getTime() + weeks * 7 * DAY_MS);
}

/** "YYYY-MM-DD" for use in URLs / <input type="date">. */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${monday.getUTCFullYear()}年 ${fmt(monday)}〜${fmt(sunday)}`;
}
