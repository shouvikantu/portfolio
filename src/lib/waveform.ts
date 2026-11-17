function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic, speech-like bar heights in [0.15, 1], lower at the edges than in the middle. */
export function barHeights(count: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const envelope = Math.pow(Math.sin((Math.PI * (i + 0.5)) / count), 0.6);
    const syllable = 0.55 + 0.45 * Math.abs(Math.sin(i * 0.35 + seed));
    const h = envelope * syllable * (0.4 + 0.6 * rand());
    out.push(0.15 + 0.85 * h);
  }
  return out;
}
