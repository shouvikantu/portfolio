# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Bootstrap template with a new Astro site in the "Live Caption" style, research-first, while `/emai` and the CCSC slide deck keep working.

**Architecture:** Astro static site. Content lives in JSON files loaded as typed content collections. Pages are plain Astro components and CSS custom properties. One small vanilla-TS script drives the waveform canvas and caption highlight. Old site files are deleted. The CCSC deck moves byte-for-byte into `public/`.

**Tech Stack:** Node 24, Astro 7.4.12, TypeScript 6.0.3, @astrojs/check 0.9.12, @astrojs/sitemap 3.7.5, Vitest 5.1.0, linkinator 8.1.0, @fontsource-variable/bricolage-grotesque 5.3.0, @fontsource/atkinson-hyperlegible 5.3.0, @fontsource/jetbrains-mono 5.3.0. `sharp` comes with Astro.

**Spec:** `docs/superpowers/specs/2026-11-17-site-redesign-design.md`

## Global Constraints

- Production site URL: `https://www.shouvikantu.com` (set once as `site` in `astro.config.mjs`).
- No phone number in any page or metadata. Tests reject `711539675`, `+34`, `503-376`, `(503)` and `telephone` in built HTML.
- `vercel.json` `rewrites` stay exactly: `/emai` → `https://emai-seven.vercel.app/emai`, `/emai/(.*)` → `https://emai-seven.vercel.app/emai/$1`.
- `/ccsc.html`, `/slides/01-title.html` … `/slides/15-closing.html` and `/images/whiphala.jpg` are served at the same paths. Only one change is allowed in `ccsc.html`: pin `reveal.js@5` to `reveal.js@5.2.1`.
- Email: `shouvikwu26@gmail.com`. GitHub: `https://github.com/shouvikantu`. LinkedIn: `https://www.linkedin.com/in/shouvikantu/`. Continuity: `https://continuity.ai4edulab.com`.
- Dates: Wiphala CCSC talk is **Oct 2025**. AI4ED Lab is **May 2025 – Nov 2026**.
- Tokens (light): bg `#eef0f4`, ink `#17202c`, muted `#5b6875`, rule `#cfd5dd`, coral `#e8552f`, highlighters yellow `#ffe36e`, green `#a7e8c0`, pink `#ffbfd0`, blue `#bcd7ff`. Dark mode is designed separately, with dark text on highlighter colors.
- Fonts: Bricolage Grotesque (display), Atkinson Hyperlegible (body), JetBrains Mono (labels), all self-hosted with Fontsource.
- The hero caption is real text in the HTML and fully readable with no JavaScript and with `prefers-reduced-motion: reduce`.
- No client UI framework, no Tailwind, no analytics, no contact form.
- Copy rules: plain, short sentences; no em-dash asides.

## Review Focus

1. **JavaScript disabled or failing:** the caption, the nav and every section render and read correctly. Words are only dimmed by a class the script adds. Task 4 tests that the built HTML has no `dim` class.
2. **Reduced motion:** with `prefers-reduced-motion: reduce`, the waveform draws once as a static frame and no words dim. Task 4 adds a unit test for `shouldAnimate()`.
3. **Phone-width layout (≤400px):** no horizontal scroll, and the publication grid and player stack. Task 7 checks this in the browser at 375px.
4. **Deep links and old URLs:** `/ccsc.html#/3` still loads slide fragments, and anything else from the old site, like `/index.html`, gets a styled 404 rather than a blank page. Task 1 tests that the CCSC files are byte-identical, and Task 6 tests that `404.html` exists.
5. **Dark theme contrast:** highlighted phrases stay readable in dark mode (dark text on highlighter). Task 3 tests that the `mark` color token is defined under both themes.

---

### Task 1: Clear the old site and set up Astro

**Files:**
- Delete: `assets/` (everything), `images/` (all except `whiphala.jpg`), `index.html`, `gulpfile.js`, `README.txt`, `package-lock.json`, `.DS_Store`, `assets/.DS_Store`, `images/.DS_Store`
- Move (git mv, contents unchanged): `ccsc.html` → `public/ccsc.html`, `slides/*` → `public/slides/*`, `images/whiphala.jpg` → `public/images/whiphala.jpg`
- Copy: `/Users/sahmed/Downloads/Ahmed_Antu_CV.pdf` → `public/cv.pdf`
- Modify: `public/ccsc.html` (pin reveal.js), `package.json` (rewrite), `.gitignore`, `README.md` (rewrite), `LICENSE.txt` (MIT, "Copyright (c) 2026 Shouvik Ahmed Antu")
- Create: `.node-version` (`24`), `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/pages/index.astro` (placeholder `<h1>Shouvik Ahmed Antu</h1>`), `tests/build.test.ts`, `tests/helpers.ts`
- Keep: `vercel.json` unchanged

**Interfaces:**
- Produces: npm scripts `dev`, `build` (`astro check && astro build`), `test:unit` (`vitest run tests/unit`), `test:build` (`vitest run tests/build.test.ts`), `test:links` (`linkinator dist --recurse --skip "^https?://(?!localhost)"`), `test` (`npm run test:unit && npm run build && npm run test:build && npm run test:links`).
- Produces: `tests/helpers.ts` with `readDist(path: string): string` (reads `dist/<path>` as UTF-8) and `distHtml(path: string): Document` (parses it with `linkedom`'s `parseHTML`; add `linkedom` as a dev dependency).

- [ ] **Step 1: Branch and toolchain.** `git switch -c redesign`; `fnm install 24 && fnm use 24`; `node -v` must print `v24.x`.
- [ ] **Step 2: Delete and move files** as listed above. `git status` must show the CCSC files as renames with 100% similarity.
- [ ] **Step 3: Write `package.json`.** Name `shouvikantu-site`, `"type": "module"`, `"private": true`, `"engines": { "node": "24.x" }`, the scripts above, and the exact dependency versions from the Tech Stack. Run `npm install`.
- [ ] **Step 4: Config.** `astro.config.mjs`: `site: 'https://shouvikantu.com'`, `trailingSlash: 'ignore'`, `integrations: [sitemap()]`. `tsconfig.json` extends `astro/tsconfigs/strict`. `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.DS_Store`, `.env`, `.superpowers/`.
- [ ] **Step 5: Write the failing build test** `tests/build.test.ts`, describe block "preserved routes":

```ts
const SLIDES = ['01-title','02-qa','03-motivation','04-course-context','05-design-principles','06-wiphala','07-milestones','08-strings-files','09-interactive-graphics','10-reading-python','11-defining-classes','12-fundamental-python','13-results','14-implications','15-closing'];
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
  expect(JSON.parse(readFileSync('vercel.json','utf8')).rewrites).toEqual([
    { source: '/emai', destination: 'https://emai-seven.vercel.app/emai' },
    { source: '/emai/(.*)', destination: 'https://emai-seven.vercel.app/emai/$1' },
  ]);
});
```

- [ ] **Step 6: Run** `npm run build && npm run test:build`. Expected: FAIL on the reveal.js pin.
- [ ] **Step 7: Pin reveal.js** in `public/ccsc.html`. Replace `reveal.js@5/` with `reveal.js@5.2.1/` in all 6 URLs.
- [ ] **Step 8: Run** `npm run build && npm run test:build`. Expected: PASS.
- [ ] **Step 9: Commit** `chore: replace Bootstrap template with Astro scaffold, keep CCSC deck`.

### Task 2: Content data

**Files:**
- Create: `src/content.config.ts`, `src/data/publications.json`, `src/data/experience.json`, `src/data/talks.json`, `src/data/awards.json`, `src/data/education.json`, `src/site.ts`, `src/lib/format.ts`, `tests/unit/format.test.ts`

**Interfaces:**
- Produces collections (`file()` loader from `astro/loaders`, `z` from `astro/zod`). Each JSON is an array of objects with an `id`:
  - `publications`: `{ id, title, authors: string[], year: number, venue, venueShort, status: 'published'|'accepted'|'submitted'|'preprint', url?: string, tag: 'yellow'|'green'|'pink'|'blue' }`
  - `experience`: `{ id, org, role, start: 'YYYY-MM', end?: 'YYYY-MM', location, kind: 'research'|'teaching', bullets: string[] }`
  - `talks`: `{ id, title, event, place, date: 'YYYY-MM' }`
  - `awards`: `{ id, name, org, years: string }`
  - `education`: `{ id, school, degree, start: 'YYYY-MM', end: 'YYYY-MM', location, notes: string[] }`
- Produces `src/site.ts`: `export const site = { name, email, links: { github, linkedin, continuity, cv: '/cv.pdf' }, caption: { speaker: 'SHOUVIK', parts: CaptionPart[] }, now: { label: string; text: string }[], outside: string }`, where `type CaptionPart = { text: string; mark?: 'yellow'|'green'|'pink'|'blue' }`.
- Produces `src/lib/format.ts`:
  - `formatMonth(ym: string): string`: `'2025-10'` → `'Oct 2025'`
  - `formatRange(start: string, end?: string): string`: `('2025-05','2026-11')` → `'May 2025 – Nov 2026'`; no end → `'Oct 2026 – Present'`; same year → `'Aug – Dec 2024'`
  - `byNewest<T extends { start?: string; year?: number; date?: string }>(items: T[]): T[]`: sorts by `start` or `date` or `year`, newest first, without mutating the input
  - `isSelf(author: string): boolean`: true for the author strings in the data that name Shouvik (`'Antu, S. A.'`, `'Ahmed Antu, S.'`, `'Antu, S.'`)

- [ ] **Step 1: Write failing unit tests** `tests/unit/format.test.ts` for each `format.ts` function, using exactly the example values above, plus a `byNewest` input that leaves the original array order unchanged.
- [ ] **Step 2: Run** `npm run test:unit`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `src/lib/format.ts`.** Use `Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })` and the en dash `–` between dates.
- [ ] **Step 4: Run** `npm run test:unit`. Expected: PASS.
- [ ] **Step 5: Write the data files** from the CV and LinkedIn, applying the spec's answers.
  - **publications (4):** Let Them Think Out Loud (2027, accepted, SIGCSE TS, yellow); Engaging with the Wiphala (2025, JCSC, `https://dl.acm.org/doi/abs/10.5555/3778141.3778149`, blue); Using LLM to Improve Efficiency in Literature Review for Undergraduate Research (2023, CEUR-WS, `https://ceur-ws.org/Vol-3487/short2.pdf`, green); An Exploration Into the Collatz Conjecture with Changed Parameters (2023, arXiv preprint, `https://arxiv.org/abs/2305.01017`, pink).
  - **experience:** research = TIDE Lab UPF (2026-10, open-ended); AI4ED Lab (2025-05 – 2026-11); Vision Lab (2025-06 – 2026-05); Business School RA (2024-08 – 2024-12); SCRP Gen-AI (2023-05 – 2023-08). teaching = Section Leader (2025-08 – 2026-05); Colloquium Associate (2024-08 – 2024-12); Private Tutor (2019-01, open-ended).
  - **talks (4):** CCSC with date `2025-10`.
  - **awards (8):** from the CV.
  - **education (3):** UPF, Willamette, Birmingham.
  - **site.ts:** the caption is the spec's sentence, split so "conversational AI that talks with students" has mark `yellow` and "measure whether it actually improves how they reason" has mark `green`.
  - **now:** EMAI MSc (UPF · Sapienza), TIDE Lab, SIGCSE TS Sacramento Feb 2027.
  - **outside:** "Volleyball setter, KL-YES alum."
- [ ] **Step 6: Write `src/content.config.ts`** with the five schemas above. Run `npm run build`. Expected: passes `astro check` with no schema errors.
- [ ] **Step 7: Commit** `feat: add content collections and formatting helpers`.

### Task 3: Design tokens, fonts and base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Seo.astro`
- Modify: `src/pages/index.astro` (use `Base`)
- Test: `tests/build.test.ts` (new describe "head and theme")

**Interfaces:**
- Consumes: `site` from `src/site.ts`.
- Produces: `Base.astro` with props `{ title: string; description: string; path: string; ogImage?: string }`. It renders `<html lang="en">`, imports fonts and global CSS, and renders `<Seo>`, `<slot />` and a skip link to `#main`.
- Produces: CSS custom properties `--bg --ink --muted --rule --accent --mark-ink --hl-yellow --hl-green --hl-pink --hl-blue --card-bg --card-ink --font-display --font-body --font-mono`. They are defined on `:root`, redefined under `@media (prefers-color-scheme: dark)` and under `:root[data-theme="dark"]`.
- `Seo.astro` emits: `<title>`, the meta description, a canonical (`new URL(path, site)`), OG title/description/url/image/type, `twitter:card=summary_large_image`, and JSON-LD `Person` (name, url, email `mailto:`, jobTitle "AI researcher", affiliation UPF, alumniOf Willamette and Birmingham, sameAs GitHub and LinkedIn). JSON-LD has no telephone.

- [ ] **Step 1: Write failing build tests:**
  - index has exactly one `h1`;
  - `link[rel=canonical]` href is `https://shouvikantu.com/`;
  - `meta[property="og:image"]` content starts with `https://shouvikantu.com/`;
  - the JSON-LD parses, has `@type` `Person` and no `telephone` key;
  - none of the Global Constraints phone patterns appear in the built HTML;
  - `tokens.css` source text defines `--mark-ink` inside the `prefers-color-scheme: dark` block and inside `:root[data-theme="dark"]`.
- [ ] **Step 2: Run** `npm run build && npm run test:build`. Expected: FAIL.
- [ ] **Step 3: Implement** tokens, fonts and the layout. Body text max width is about 65ch. Set the type scale in `tokens.css`. Give focus states a visible 2px coral outline. Respect `prefers-reduced-motion` for any CSS transitions.
- [ ] **Step 4: Run** `npm run build && npm run test:build`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add design tokens, fonts and SEO layout`.

### Task 4: Caption player

**Files:**
- Create: `src/lib/caption.ts`, `src/lib/waveform.ts`, `src/components/CaptionPlayer.astro`, `src/scripts/player.ts`, `tests/unit/caption.test.ts`, `tests/unit/waveform.test.ts`
- Test: `tests/build.test.ts` (describe "player")

**Interfaces:**
- Consumes: `site.caption` (`CaptionPart[]`, speaker).
- Produces `src/lib/caption.ts`:
  - `tokenize(parts: CaptionPart[]): { text: string; mark?: CaptionPart['mark']; spaceBefore: boolean }[]`: splits each part into runs of non-whitespace, keeps the part's mark, and records whether whitespace preceded the token, even across part boundaries, so `reason` + `.` render as `reason.` with no space
  - `activeWordIndex(progress: number, wordCount: number): number`: clamps progress to [0,1] and returns `Math.min(wordCount - 1, Math.floor(progress * wordCount))`
  - `shouldAnimate(reducedMotion: boolean): boolean`: returns `!reducedMotion`
- Produces `src/lib/waveform.ts`: `barHeights(count: number, seed: number): number[]`. It is deterministic, each value is in [0.15, 1], and an envelope makes the edges lower than the middle.
- `CaptionPlayer.astro` props: `{ parts: CaptionPart[]; speaker: string; duration?: number /* seconds, default 14 */; compact?: boolean }`. It renders a `<button type="button" aria-label="Replay caption">`, a `<canvas aria-hidden="true">`, a mono time label (`00:00 / 00:14`) and `<p class="caption">` with `<span class="w">` per word and `<mark class="hl-yellow">` around marked words. The words are present in the HTML with no `dim` class.
- `player.ts` runs on load: if `shouldAnimate(matchMedia('(prefers-reduced-motion: reduce)').matches)`, it plays once over `duration` seconds. It draws played bars in `--accent`, adds `dim` to words after `activeWordIndex`, and removes all `dim` classes when finished. The button replays. With reduced motion, it draws one static frame and dims nothing. It redraws on resize and reads colors from computed CSS variables so dark mode works.

- [ ] **Step 1: Write failing unit tests:**
  - `tokenize` on the site caption returns 36 tokens; `conversational` is marked yellow; `reason` is marked green; the token after `reason` is `.` with no mark and `spaceBefore === false`; the first token has `spaceBefore === false`;
  - `activeWordIndex(0,10)===0`, `(0.5,10)===5`, `(1,10)===9`, `(1.4,10)===9`, `(-1,10)===0`;
  - `shouldAnimate(true)===false`;
  - `barHeights(60,1)` equals `barHeights(60,1)`, every value is in [0.15,1], and the mean of the first 5 is below the mean of the middle 5.
- [ ] **Step 2: Run** `npm run test:unit`. Expected: FAIL.
- [ ] **Step 3: Implement** `caption.ts` and `waveform.ts`. Run `npm run test:unit`. Expected: PASS.
- [ ] **Step 4: Write failing build tests:**
  - the index contains the full caption sentence as text content (whitespace-normalized);
  - it has no `.dim` element;
  - it has `mark.hl-yellow` and `mark.hl-green`;
  - the replay button has an `aria-label`.
- [ ] **Step 5: Implement** `CaptionPlayer.astro` and `player.ts`, and use the player in `index.astro`. Run `npm run build && npm run test:build`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: add live caption player`.

### Task 5: Homepage sections

**Files:**
- Create: `src/components/Nav.astro`, `NowStrip.astro`, `PublicationList.astro`, `ContinuityCard.astro`, `Timeline.astro` (used for both research and teaching), `TalkList.astro`, `EducationList.astro`, `AwardList.astro`, `Footer.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/build.test.ts` (describe "homepage")

**Interfaces:**
- Consumes: `getCollection(...)` for the five collections; `formatRange`, `formatMonth`, `byNewest`, `isSelf`; `site`.
- `Timeline.astro` props: `{ id: string; heading: string; items: CollectionEntry<'experience'>['data'][] }`. Each row has a mono date column, then the role, the org and the bullets.
- `PublicationList.astro`: one row per publication. Columns are the mono year, the title (linked if `url`), the authors with `isSelf` authors in `<strong>`, and the venue tag in its highlighter color. Non-published entries get a status label ("Accepted", "Preprint").
- Section ids in order: `research` (hero + now), `publications`, `continuity`, `experience`, `talks`, `teaching`, `education`, `awards`. The nav links to `#research #publications #continuity #teaching` and `/cv.pdf`.

- [ ] **Step 1: Write failing build tests:**
  - all 4 publication titles appear, in year order 2027, 2025, 2023, 2023;
  - `#continuity a[href^="/continuity"]` and an `a[href="https://continuity.ai4edulab.com"]` exist;
  - the talks section contains "Oct 2025" and not "Oct 2024";
  - the experience section contains "May 2025 – Nov 2026";
  - the footer has links to GitHub, `https://www.linkedin.com/in/shouvikantu/`, `mailto:shouvikwu26@gmail.com` and `/cv.pdf`;
  - every `a[target=_blank]` has `rel` containing `noopener`;
  - every icon-only link has an `aria-label`.
- [ ] **Step 2: Run** `npm run build && npm run test:build`. Expected: FAIL.
- [ ] **Step 3: Implement** the components following the mockup. Grids collapse to one column below 720px, and every grid child holding text gets `min-width: 0`. The Continuity card is dark (`--card-bg` / `--card-ink`) with a small static waveform.
- [ ] **Step 4: Run** `npm run build && npm run test:build`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: build research-first homepage`.

### Task 6: Continuity page, 404, OG image, sitemap

**Files:**
- Create: `src/pages/continuity.astro`, `src/pages/404.astro`, `public/robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: https://shouvikantu.com/sitemap-index.xml`), `scripts/make-og.mjs`, `public/og.png` (generated, committed)
- Test: `tests/build.test.ts` (describe "pages")

**Interfaces:**
- Consumes: `Base`, `CaptionPlayer` with `compact`, `site.links.continuity`.
- `scripts/make-og.mjs`: builds a 1200×630 SVG string (name in Bricolage-like bold sans, coral waveform bars from `barHeights(80, 7)`, the line "Conversational AI for learning", "shouvikantu.com") and writes `public/og.png` with `sharp`. Add npm script `og`.
- The Continuity page uses the spec's content in sections What it is / Why / How it works / Where it ran / Results. It has a "Visit Continuity" link to `https://continuity.ai4edulab.com` and a citation for the SIGCSE TS 2027 paper. Its `<title>` is "Continuity · Shouvik Ahmed Antu".

- [ ] **Step 1: Write failing build tests:**
  - `dist/continuity/index.html` has one `h1` containing "Continuity" and a link to the live site;
  - `dist/404.html` exists and links to `/`;
  - `dist/og.png` exists;
  - `dist/sitemap-index.xml` exists and lists `https://shouvikantu.com/continuity/`;
  - `dist/robots.txt` mentions the sitemap.
- [ ] **Step 2: Run** `npm run build && npm run test:build`. Expected: FAIL.
- [ ] **Step 3: Implement** the pages, the robots file and the OG script. Run `npm run og`.
- [ ] **Step 4: Run** `npm test`. Expected: unit, build and link checks all PASS with 0 broken internal links.
- [ ] **Step 5: Commit** `feat: add Continuity page, 404, OG image and sitemap`.

### Task 7: Browser check and wrap-up

**Files:**
- Create: `.claude/launch.json` with config `site-preview`: `npm run preview -- --port 4321`, port `4321`
- Modify: `README.md` (how to run, where content lives, how to add a publication)

- [ ] **Step 1:** `npm run build`, then start `site-preview` with the preview tool.
- [ ] **Step 2:** Check `/`, `/continuity` and a missing URL (404) at desktop width and at 375px, in light and dark. On each, confirm there's no horizontal scroll, the caption is readable before and after the animation, and the highlights are legible in dark mode.
- [ ] **Step 3:** Load `/ccsc.html`. Expect the slides to render and the arrow keys to move between them. Load `/ccsc.html#/5`. Expect the Wiphala slide with its image.
- [ ] **Step 4:** Emulate reduced motion (DevTools) and confirm nothing dims.
- [ ] **Step 5:** Fix anything found. Re-run `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `docs: add README and preview config`.
