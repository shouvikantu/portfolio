import { describe, it, expect } from 'vitest';
import { barHeights } from '../../src/lib/waveform';

describe('barHeights', () => {
  const bars = barHeights(60, 1);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  it('is deterministic for a seed', () => {
    expect(barHeights(60, 1)).toEqual(bars);
  });
  it('keeps every value within [0.15, 1]', () => {
    expect(bars.length).toBe(60);
    for (const h of bars) { expect(h).toBeGreaterThanOrEqual(0.15); expect(h).toBeLessThanOrEqual(1); }
  });
  it('is lower at the edges than in the middle', () => {
    expect(mean(bars.slice(0, 5))).toBeLessThan(mean(bars.slice(28, 33)));
  });
});
