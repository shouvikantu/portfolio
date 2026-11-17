import { describe, it, expect } from 'vitest';
import { barState } from '../../src/lib/waveAnim';

const N = 100;

describe('barState: intro', () => {
  it('starts every bar at zero height', () => {
    for (let i = 0; i < N; i += 9) expect(barState(i, N, 0, 0, 'intro').scale).toBe(0);
  });
  it('has every bar fully grown after two seconds', () => {
    for (let i = 0; i < N; i += 9) expect(barState(i, N, 0, 2, 'intro').scale).toBeCloseTo(1, 5);
  });
  it('grows left bars before right bars', () => {
    expect(barState(5, N, 0, 0.3, 'intro').scale).toBeGreaterThan(barState(95, N, 0, 0.3, 'intro').scale);
  });
});

describe('barState: playing', () => {
  it('boosts and lights the bar just behind the playhead', () => {
    const s = barState(49, N, 0.5, 1, 'playing');
    expect(s.played).toBe(true);
    expect(s.scale).toBeGreaterThan(1.2);
    expect(s.glow).toBeGreaterThan(0.5);
  });
  it('keeps bars far behind the playhead calm', () => {
    const s = barState(5, N, 0.5, 1, 'playing');
    expect(s.played).toBe(true);
    expect(s.glow).toBe(0);
    expect(s.scale).toBeGreaterThanOrEqual(0.94);
    expect(s.scale).toBeLessThanOrEqual(1.06);
  });
  it('leaves bars ahead of the playhead unplayed', () => {
    expect(barState(80, N, 0.5, 1, 'playing').played).toBe(false);
  });
});

describe('barState: paused', () => {
  it('freezes without glow', () => {
    expect(barState(49, N, 0.5, 1, 'paused')).toEqual({ scale: 1, played: true, glow: 0 });
    expect(barState(80, N, 0.5, 1, 'paused')).toEqual({ scale: 0.9, played: false, glow: 0 });
  });
});

describe('barState: idle', () => {
  it('shows every bar played with a gentle swell', () => {
    for (let i = 0; i < N; i += 7) {
      const s = barState(i, N, 1, 3.3, 'idle');
      expect(s.played).toBe(true);
      expect(s.scale).toBeGreaterThanOrEqual(0.82);
      expect(s.scale).toBeLessThanOrEqual(1.02);
      expect(s.glow).toBeGreaterThanOrEqual(0);
      expect(s.glow).toBeLessThanOrEqual(0.6);
    }
  });
});
