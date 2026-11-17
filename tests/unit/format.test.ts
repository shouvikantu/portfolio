import { describe, it, expect } from 'vitest';
import { formatMonth, formatRange, byNewest, byRecent, isSelf } from '../../src/lib/format';

describe('formatMonth', () => {
  it('formats YYYY-MM as short month and year', () => {
    expect(formatMonth('2025-10')).toBe('Oct 2025');
  });
});

describe('formatRange', () => {
  it('joins two dates with an en dash', () => {
    expect(formatRange('2025-05', '2026-11')).toBe('May 2025 – Nov 2026');
  });
  it('uses Present when there is no end', () => {
    expect(formatRange('2026-10')).toBe('Oct 2026 – Present');
  });
  it('drops the repeated year within one year', () => {
    expect(formatRange('2024-08', '2024-12')).toBe('Aug – Dec 2024');
  });
});

describe('byNewest', () => {
  it('sorts by start, date or year, newest first, without mutating', () => {
    const items = [{ year: 2023 }, { start: '2026-10' }, { date: '2025-10' }, { year: 2027 }];
    const copy = [...items];
    expect(byNewest(items)).toEqual([{ year: 2027 }, { start: '2026-10' }, { date: '2025-10' }, { year: 2023 }]);
    expect(items).toEqual(copy);
  });
});

describe('isSelf', () => {
  it('recognises the author strings that name Shouvik', () => {
    expect(isSelf('Antu, S. A.')).toBe(true);
    expect(isSelf('Ahmed Antu, S.')).toBe(true);
    expect(isSelf('Antu, S.')).toBe(true);
    expect(isSelf('Cordova, L.')).toBe(false);
  });
});

describe('byRecent', () => {
  it('puts ongoing entries first, then sorts by end date, then by start date, newest first', () => {
    const items = [
      { id: 'vision', start: '2025-06', end: '2026-05' },
      { id: 'tide', start: '2026-10' },
      { id: 'ai4ed', start: '2025-05', end: '2026-11' },
      { id: 'scrp', start: '2023-05', end: '2023-08' },
    ];
    expect(byRecent(items).map((x) => x.id)).toEqual(['tide', 'ai4ed', 'vision', 'scrp']);
  });
  it('ranks a degree above a semester abroad that started later', () => {
    const items = [
      { id: 'birmingham', start: '2025-01', end: '2025-06' },
      { id: 'willamette', start: '2022-08', end: '2026-05' },
    ];
    expect(byRecent(items).map((x) => x.id)).toEqual(['willamette', 'birmingham']);
  });
});
