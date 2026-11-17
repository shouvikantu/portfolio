import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { readDist } from './helpers';

const SLIDES = ['01-title', '02-qa', '03-motivation', '04-course-context', '05-design-principles', '06-wiphala', '07-milestones', '08-strings-files', '09-interactive-graphics', '10-reading-python', '11-defining-classes', '12-fundamental-python', '13-results', '14-implications', '15-closing'];

describe('preserved routes', () => {
  it('serves every slide byte-identical to public/', () => {
    for (const s of SLIDES) expect(readDist(`slides/${s}.html`)).toBe(readFileSync(`public/slides/${s}.html`, 'utf8'));
  });

  it('serves whiphala.jpg and cv.pdf', () => {
    expect(existsSync('dist/images/whiphala.jpg')).toBe(true);
    expect(statSync('dist/cv.pdf').size).toBeGreaterThan(100_000);
  });

  it('pins reveal.js in ccsc.html', () => {
    const html = readDist('ccsc.html');
    expect(html).not.toMatch(/reveal\.js@5\//);
    expect(html).toMatch(/reveal\.js@5\.2\.1\//);
  });

  it('keeps the /emai rewrites', () => {
    expect(JSON.parse(readFileSync('vercel.json', 'utf8')).rewrites).toEqual([
      { source: '/emai', destination: 'https://emai-seven.vercel.app/emai' },
      { source: '/emai/(.*)', destination: 'https://emai-seven.vercel.app/emai/$1' },
    ]);
  });
});
