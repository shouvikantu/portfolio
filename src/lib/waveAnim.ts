export type WaveMode = 'intro' | 'playing' | 'paused' | 'idle';
export type BarState = { scale: number; played: boolean; glow: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function easeOutBack(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * How bar `i` of `count` looks at time `t` (seconds since the mode started)
 * with the playhead at `progress` (0–1).
 * - intro: bars grow in from left to right with a small overshoot
 * - playing: bars just behind the playhead jump and glow like a live level meter
 * - paused: frozen, no glow
 * - idle: after playback, a slow swell with a shimmer travelling left to right
 */
export function barState(i: number, count: number, progress: number, t: number, mode: WaveMode): BarState {
  const f = (i + 0.5) / count;

  if (mode === 'intro') {
    return { scale: easeOutBack(clamp01((t - f * 0.5) / 0.45)), played: false, glow: 0 };
  }

  if (mode === 'idle') {
    const phase = t * 2.2 - i * 0.28;
    return { scale: 0.92 + 0.1 * Math.sin(phase), played: true, glow: 0.6 * Math.pow(Math.max(0, Math.sin(phase)), 8) };
  }

  const behind = progress - f;
  const played = behind > 0;

  if (mode === 'paused') return { scale: played ? 1 : 0.9, played, glow: 0 };

  if (played && behind < 0.08) {
    const boost = Math.exp(-behind / 0.025);
    const flicker = 0.8 + 0.2 * Math.sin(t * 22 + i * 1.9);
    return { scale: 1 + 0.55 * boost * flicker, played, glow: boost };
  }
  if (played) return { scale: 1 + 0.06 * Math.sin(t * 3 - i * 0.3), played, glow: 0 };
  return { scale: 0.9 + 0.05 * Math.sin(t * 2 + i * 0.5), played, glow: 0 };
}
