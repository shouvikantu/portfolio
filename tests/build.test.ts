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

describe('homepage', () => {
  const doc = distHtml('index.html');
  const text = (sel: string) => (doc.querySelector(sel)?.textContent ?? '').replace(/\s+/g, ' ');

  it('lists all four publications newest first', () => {
    const titles = Array.from(doc.querySelectorAll('#publications .pub-title')).map((el) => el.textContent?.trim());
    expect(titles).toEqual([
      'Let Them Think Out Loud: Designing Voice AI for Reasoning and Reflection in Computing Courses',
      'Engaging with the Wiphala: A Code-Generation Hardened CS1 Final',
      'Using LLM (Large Language Model) to Improve Efficiency in Literature Review for Undergraduate Research',
      'An Exploration Into the Collatz Conjecture with Changed Parameters',
    ]);
    const years = Array.from(doc.querySelectorAll('#publications .pub-year')).map((el) => el.textContent?.trim());
    expect(years).toEqual(['2027', '2025', '2023', '2023']);
  });

  it('links Continuity to its page and its live site', () => {
    expect(doc.querySelector('#continuity a[href^="/continuity"]')).not.toBeNull();
    expect(doc.querySelector('#continuity a[href="https://continuity.ai4edulab.com"]')).not.toBeNull();
  });

  it('dates the Wiphala talk Oct 2025', () => {
    expect(text('#talks')).toContain('Oct 2025');
    expect(text('#talks')).not.toContain('Oct 2024');
  });

  it('dates AI4ED Lab May 2025 – Nov 2026', () => {
    expect(text('#experience')).toContain('May 2025 – Nov 2026');
  });

  it('has the contact links in the footer', () => {
    for (const href of ['https://github.com/shouvikantu', 'https://www.linkedin.com/in/shouvikantu/', 'mailto:shouvikwu26@gmail.com', '/cv.pdf']) {
      expect(doc.querySelector(`footer a[href="${href}"]`), href).not.toBeNull();
    }
  });

  it('marks every new-tab link noopener', () => {
    for (const a of Array.from(doc.querySelectorAll('a[target="_blank"]'))) expect(a.getAttribute('rel') ?? '').toContain('noopener');
  });

  it('labels every link that has no text', () => {
    for (const a of Array.from(doc.querySelectorAll('a'))) {
      if (!(a.textContent ?? '').trim()) expect(a.getAttribute('aria-label'), a.outerHTML).toBeTruthy();
    }
  });

  it('orders research experience and education by most recent end date', () => {
    const roles = Array.from(doc.querySelectorAll('#experience .row-meta')).map((el) => el.textContent?.split(' · ')[0]);
    expect(roles.slice(0, 3)).toEqual(['TIDE Lab, Universitat Pompeu Fabra', 'AI4ED Lab, Willamette University', 'Vision Lab, Willamette University']);
    const schools = Array.from(doc.querySelectorAll('#education .row-title')).map((el) => el.textContent);
    expect(schools).toEqual(['Universitat Pompeu Fabra', 'Willamette University', 'University of Birmingham']);
  });

  it('has all sections in order', () => {
    const ids = Array.from(doc.querySelectorAll('main section[id]')).map((s) => s.id);
    expect(ids).toEqual(['research', 'publications', 'continuity', 'experience', 'talks', 'teaching', 'education', 'awards']);
  });
});

describe('pages', () => {
  it('has a Continuity page linking to the live site', () => {
    const doc = distHtml('continuity/index.html');
    const h1s = doc.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Continuity');
    expect(doc.querySelector('a[href="https://continuity.ai4edulab.com"]')).not.toBeNull();
    expect(doc.querySelector('title')?.textContent).toBe('Continuity · Shouvik Ahmed Antu');
  });

  it('has a 404 page that links home', () => {
    expect(existsSync('dist/404.html')).toBe(true);
    expect(distHtml('404.html').querySelector('a[href="/"]')).not.toBeNull();
  });

  it('ships the OG image', () => {
    expect(existsSync('dist/og.png')).toBe(true);
  });

  it('lists the Continuity page in the sitemap', () => {
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
    expect(readDist('sitemap-0.xml')).toContain('https://shouvikantu.com/continuity/');
  });

  it('points robots.txt at the sitemap', () => {
    expect(readDist('robots.txt')).toContain('Sitemap: https://shouvikantu.com/sitemap-index.xml');
  });
});

describe('review fixes', () => {
  it('ships a static waveform and a hidden button until the script runs', () => {
    const doc = distHtml('index.html');
    expect(doc.querySelector('.player svg.waveform')).not.toBeNull();
    expect(doc.querySelector('.player .player-btn')?.hasAttribute('hidden')).toBe(true);
  });

  it('keeps the 404 page out of search results', () => {
    const doc = distHtml('404.html');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('defines a dark-mode play-icon color', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    expect(css.slice(0, css.indexOf('@media'))).toMatch(/--btn-ink:/);
    const media = css.slice(css.indexOf('prefers-color-scheme: dark'));
    expect(media.slice(0, media.indexOf('}\n}') + 3)).toMatch(/--btn-ink:/);
    const attr = css.slice(css.indexOf(':root[data-theme="dark"]'));
    expect(attr.slice(0, attr.indexOf('}'))).toMatch(/--btn-ink:/);
  });
});
