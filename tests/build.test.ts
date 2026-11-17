import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { distHtml, readDist } from './helpers';

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

const PHONE = [/711539675/, /\+34/, /503-376/, /\(503\)/, /telephone/i];

function builtHtmlFiles(dir = 'dist'): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { if (entry.name !== 'slides') out.push(...builtHtmlFiles(p)); }
    else if (entry.name.endsWith('.html') && p !== 'dist/ccsc.html') out.push(p);
  }
  return out;
}

describe('head and theme', () => {
  const doc = distHtml('index.html');

  it('has exactly one h1', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  it('points canonical and og:image at the production domain', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://shouvikantu.com/');
    expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/^https:\/\/shouvikantu\.com\//);
  });

  it('has Person JSON-LD without a telephone', () => {
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}');
    expect(ld['@type']).toBe('Person');
    expect(ld).not.toHaveProperty('telephone');
  });

  it('shows no phone number in any built page', () => {
    const files = builtHtmlFiles();
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      for (const re of PHONE) expect(html, `${f} matches ${re}`).not.toMatch(re);
    }
  });

  it('defines --mark-ink for both dark-theme selectors', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    const media = css.slice(css.indexOf('prefers-color-scheme: dark'));
    expect(media.slice(0, media.indexOf('}\n}') + 3)).toMatch(/--mark-ink:/);
    const attr = css.slice(css.indexOf(':root[data-theme="dark"]'));
    expect(attr.slice(0, attr.indexOf('}'))).toMatch(/--mark-ink:/);
  });
});

describe('player', () => {
  const doc = distHtml('index.html');
  const caption = doc.querySelector('.caption');

  it('has the full caption sentence as real text', () => {
    const text = (caption?.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(text).toContain('I build conversational AI that talks with students, in text and in voice, and measure whether it actually improves how they reason. Now an Erasmus Mundus MSc student in AI at Universitat Pompeu Fabra, Barcelona.');
  });

  it('ships with no dimmed words', () => {
    expect(doc.querySelectorAll('.dim').length).toBe(0);
  });

  it('highlights both key phrases', () => {
    expect(caption?.querySelector('mark.hl-yellow')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('conversational AI that talks with students');
    expect(caption?.querySelector('mark.hl-green')).not.toBeNull();
  });

  it('labels the replay button', () => {
    expect(doc.querySelector('.player button')?.getAttribute('aria-label')).toBe('Replay caption');
  });
});
