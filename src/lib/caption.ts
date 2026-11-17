import type { CaptionPart, Highlight } from '../site';

export type CaptionToken = { text: string; mark?: Highlight; spaceBefore: boolean };

/** Splits caption parts into word tokens, keeping each part's highlight and whether whitespace came before it. */
export function tokenize(parts: CaptionPart[]): CaptionToken[] {
  const tokens: CaptionToken[] = [];
  let pendingSpace = false;
  for (const part of parts) {
    for (const piece of part.text.split(/(\s+)/)) {
      if (piece === '') continue;
      if (/^\s+$/.test(piece)) { pendingSpace = true; continue; }
      const token: CaptionToken = { text: piece, spaceBefore: tokens.length > 0 && pendingSpace };
      if (part.mark) token.mark = part.mark;
      tokens.push(token);
      pendingSpace = false;
    }
  }
  return tokens;
}

/** Index of the word being spoken at a playback progress in [0, 1]. */
export function activeWordIndex(progress: number, wordCount: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(wordCount - 1, Math.floor(p * wordCount));
}

export function shouldAnimate(reducedMotion: boolean): boolean {
  return !reducedMotion;
}
