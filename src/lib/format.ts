const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthOnly = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

function toDate(ym: string): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

/** '2025-10' → 'Oct 2025' */
export function formatMonth(ym: string): string {
  return monthYear.format(toDate(ym));
}

/** ('2025-05', '2026-11') → 'May 2025 – Nov 2026'; no end → '… – Present'; same year → 'Aug – Dec 2024' */
export function formatRange(start: string, end?: string): string {
  if (!end) return `${formatMonth(start)} – Present`;
  if (start.slice(0, 4) === end.slice(0, 4)) {
    return `${monthOnly.format(toDate(start))} – ${formatMonth(end)}`;
  }
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

type Dated = { start?: string; year?: number; date?: string };

function sortKey(item: Dated): string {
  return item.start ?? item.date ?? (item.year !== undefined ? `${item.year}-12` : '');
}

/** Newest first, by start, date or year. Returns a new array. */
export function byNewest<T extends Dated>(items: T[]): T[] {
  return [...items].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
}

const SELF = new Set(['Antu, S. A.', 'Ahmed Antu, S.', 'Antu, S.']);

/** True for the author strings in the data that name Shouvik. */
export function isSelf(author: string): boolean {
  return SELF.has(author);
}
