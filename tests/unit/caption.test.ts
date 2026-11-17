import { describe, it, expect } from 'vitest';
import { tokenize, activeWordIndex, shouldAnimate } from '../../src/lib/caption';
import { site } from '../../src/site';

describe('tokenize', () => {
  const tokens = tokenize(site.caption.parts);

  it('splits the site caption into 37 tokens', () => {
    expect(tokens.length).toBe(37);
  });
  it('keeps each part\'s highlight', () => {
    expect(tokens.find((t) => t.text === 'conversational')?.mark).toBe('yellow');
    expect(tokens.find((t) => t.text === 'reason')?.mark).toBe('green');
  });
  it('glues punctuation that follows a part with no space', () => {
    const i = tokens.findIndex((t) => t.text === 'reason');
    expect(tokens[i + 1]).toEqual({ text: '.', spaceBefore: false });
  });
  it('starts with no space before the first token', () => {
    expect(tokens[0].spaceBefore).toBe(false);
  });
});

describe('activeWordIndex', () => {
  it('maps progress to a word index, clamped', () => {
    expect(activeWordIndex(0, 10)).toBe(0);
    expect(activeWordIndex(0.5, 10)).toBe(5);
    expect(activeWordIndex(1, 10)).toBe(9);
    expect(activeWordIndex(1.4, 10)).toBe(9);
    expect(activeWordIndex(-1, 10)).toBe(0);
  });
});

describe('shouldAnimate', () => {
  it('is off when reduced motion is requested', () => {
    expect(shouldAnimate(true)).toBe(false);
    expect(shouldAnimate(false)).toBe(true);
  });
});
