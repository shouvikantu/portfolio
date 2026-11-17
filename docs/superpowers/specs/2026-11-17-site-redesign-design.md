# Personal site redesign: design

Date: 2026-11-17
Status: draft, awaiting approval

## Intent

Rebuild Shouvik Ahmed Antu's personal website from scratch. The current site is a 2019 Bootstrap template ("JohnDoe" by DevCRUD) with content frozen at late 2025: it still describes PhD applications for Fall 2026 and an undergrad graduating in May 2026. Since then Shouvik graduated from Willamette, started the Erasmus Mundus MSc in AI (EMAI) at Universitat Pompeu Fabra in Barcelona, joined the TIDE Lab, and had a paper accepted at SIGCSE TS 2027.

The site is **research-first**. Its main readers are faculty, lab leads, prospective collaborators and future PhD committees. In under a minute they should understand the research direction (conversational AI for learning, in text and voice, plus whether it improves learning), see the publications and the Continuity project, and know how to get in touch.

## Goals

- New structure, new look, new code. Nothing from the old template survives except the two pages listed under constraints.
- Content from the November 2026 CV and the LinkedIn profile, kept up to date.
- Adding a publication, talk or news item means editing one data file, not markup.
- Fast and accessible: static HTML, minimal JavaScript, good on phones, respects reduced-motion. Light theme only (Shouvik dropped dark mode on 2026-11-17).
- Correct SEO and link previews for the real production URL.

## Non-goals

- No blog or CMS in this pass. The content structure should not rule one out later.
- No real audio playback. The voice "player" in the hero is visual only.
- No contact form. Email is shown as text and as a link.
- No analytics.

## Anti-goals (failure even if it technically works)

- Looking like a template or a generic developer portfolio.
- An animation that hides content: the research statement must be fully readable at rest, with motion off, and in a link-preview screenshot.
- Breaking `/emai` or the CCSC slides URL.
- Showing a phone number on the site's pages or in its metadata. (The CV PDF includes one; Shouvik approved that.)

## Constraints

- **Keep `/emai` working.** `vercel.json` rewrites `/emai` and `/emai/*` to `https://emai-seven.vercel.app/emai...`. The rewrite rules carry over unchanged.
- **Keep the CCSC deck working at its current URLs.** `ccsc.html` loads `slides/01-…15-*.html` with `fetch()` and uses `images/whiphala.jpg`. These files move unchanged into Astro's `public/` folder, so `/ccsc.html`, `/slides/*.html` and `/images/whiphala.jpg` are served exactly as today. Its reveal.js URLs get pinned to an exact version (currently `reveal.js@5` floats).
- **Hosting is Vercel**, which `vercel.json` already implies. The old canonical URL (`shouvikantu.github.io/portfolio/`) is dropped.
- LinkedIn's public URL is now `linkedin.com/in/shouvikantu`; the old site links to a dead URL.
- No phone number anywhere on the site.

## Approaches considered

1. **Astro static site, content in data files (chosen).** Publications, talks, experience, awards and news live in typed content collections. Astro ships plain HTML/CSS with only the small amount of JavaScript the hero needs. Vercel builds Astro with no extra setup. Shouvik approved this and was also fine with React or Next.js, which would add a client framework the site doesn't need.
2. **Hand-written HTML/CSS, no build.** Fewest moving parts, but every content update means editing markup, and project pages and a growing publication list get messy. Rejected.
3. **Academic Jekyll theme (al-folio etc.).** Rejected: it would look like every other academic site, which goes against "start from scratch".

## Visual direction: "Live Caption" (chosen)

Picked from two rounds of mockups (round 1: Transcript / Panot / Signal; round 2 hybrids of Transcript × Signal: Live Caption / Session / Margin Notes). Reference mockup: https://claude.ai/artifact/GXnDpWciUFhPo4xh1wogAb, "Hybrid D".

The site reads like a coded interview transcript with a voice layer on top:

- **Hero = a voice player with live captions.** Big name, then a play button, a waveform and a timestamp, then the research statement set as a caption with a `SHOUVIK` speaker label. While the waveform's playhead moves, the caption's words brighten in sync. Two key phrases carry highlighter marks, as in qualitative coding ("conversational AI that talks with students", "measure whether it actually improves how they reason").
- **At rest the caption is fully visible and readable.** The word-by-word effect only dims words *after* the playhead while playing. It runs once on load and replays when the play button is pressed. With `prefers-reduced-motion`, there is no animation at all.
- **Transcript conventions carry through the page:** mono timestamps/years in a left column, speaker-style labels, and highlighter tags for venues and categories.
- **Continuity** appears as a dark card with a small waveform on the homepage and gets its own page.

### Tokens (from the mockup)

- Light: background `#eef0f4` (cool paper), ink `#17202c`, muted `#5b6875`, rule `#cfd5dd`, accent coral `#e8552f`. Highlighters: yellow `#ffe36e`, green `#a7e8c0`, pink `#ffbfd0`, blue `#bcd7ff`.
- Type: **Bricolage Grotesque** (display: name, page titles), **Atkinson Hyperlegible** (body, chosen for readability and its education-accessibility roots), **JetBrains Mono** (timestamps, labels, tags). Self-hosted with Fontsource rather than loaded from Google Fonts.

## Site structure

### Homepage (`/`)

In order:

1. **Nav** (mono, lowercase): research · publications · continuity · teaching · cv.pdf
2. **Hero** (described above). The caption: "I build conversational AI that talks with students, in text and in voice, and measure whether it actually improves how they reason. Now an Erasmus Mundus MSc student in AI at Universitat Pompeu Fabra, Barcelona."
3. **Now** strip: EMAI MSc (UPF, Sapienza mobility), TIDE Lab research assistant, next talk (SIGCSE TS, Sacramento, Feb 2027).
4. **Publications**: all four, newest first, with year, title, authors (Shouvik's name emphasized), venue tag and link. Status labels such as "Accepted".
5. **Continuity** card linking to `/continuity`.
6. **Research experience**: TIDE Lab (UPF), AI4ED Lab, Vision Lab, Business School RA, SCRP Gen-AI, as transcript-style entries.
7. **Talks**: four talks with timestamps-as-dates.
8. **Teaching**: Section Leader, Colloquium Associate (Thinking Machines), private tutoring.
9. **Education**: UPF (EMAI, Erasmus Mundus scholarship), Willamette (BS CS & DS, summa cum laude, GPA 3.9), Birmingham (study abroad).
10. **Awards & honors**: the CV list.
11. **Footer**: email, GitHub, LinkedIn, CV link, a small "outside the lab" line (volleyball setter, YES alum). No phone.

No headshot on the homepage, matching the chosen mockup; the existing `avatar.webp` is not reused. *(Builder's call.)*

Work experience outside research (WITS, Housing RA, MSC web intern) and certifications are left off the homepage; the CV PDF has them. *(Builder's call, flagged for Shouvik to check.)*

### Continuity page (`/continuity`)

The flagship project: what it is (voice-first, non-evaluative AI dialogue for computing courses), why (students' reasoning and disclosing confusion), how it was built (modular prompt architecture, personas, feedback modes, reasoning-quality scoring from voice transcripts), where it was deployed (a Willamette computing course), and the outcome (SIGCSE TS 2027 paper, with Lucas Cordova). Uses the same player component as a header.

From the live site (https://continuity.ai4edulab.com), to reuse in plain words: students explain course concepts aloud to an AI peer that asks follow-up questions; professors publish topics with reference material that shapes each conversation; transcripts, surveys and participation data are collected with role-based access for research. Built at the Willamette AI4Ed Research Lab. The page links to the live site with a clear "Visit Continuity" link.

### Other

- `/cv.pdf`: the current CV.
- `404` page in the same style.
- `/ccsc.html`, `/slides/*`, `/images/whiphala.jpg` unchanged (constraints).
- `/emai` rewrite unchanged.

## Content model

Astro content collections under `src/content/`, each validated with a Zod schema:

- `publications`: title, authors[], year, venue, venueShort, status (published | accepted | submitted | preprint), url?, tag color.
- `experience`: org, role, start, end?, location, kind (research | teaching | work), bullets[].
- `talks`: title, event, place, date.
- `awards`: name, org, years.
- `education`: school, degree, start, end, location, notes[].
- `site.ts`: name, email, links, the hero caption and its highlighted phrases, "now" items.

## Technical decisions

- Astro (current stable), TypeScript, plain CSS with custom properties (no Tailwind, no UI framework).
- One small vanilla-JS island for the waveform canvas and caption sync; everything else is static.
- Fonts with `@fontsource` packages; `font-display: swap`.
- SEO: per-page title/description, canonical, Open Graph and Twitter tags pointing at the production domain (one `site` value in `astro.config`), JSON-LD `Person` without phone, a generated OG image, `sitemap` and `robots.txt`.
- Remove: gulp, SCSS, Bootstrap/jQuery/Isotope/themify vendors, old images not used by the CCSC deck, `README.txt`, the DevCRUD license (the new code is Shouvik's own; a fresh MIT license under his name), tracked `.DS_Store` files.
- `vercel.json`: keep `rewrites`; Astro framework preset handles the build.
- Accessibility: semantic headings (one `h1`), labelled icon links, visible focus, `prefers-reduced-motion`, color contrast checked in both themes, canvas `aria-hidden` with the caption as real text.

## Verification

- `astro check` and `astro build` pass.
- A link check over the built site (internal links, `/ccsc.html` and all 15 slide files present in the output, `vercel.json` rewrites intact).
- Visual check in the browser at desktop and phone width, light and dark, with reduced motion on and off.

## Left to the builder

- Exact spacing scale, responsive breakpoints and dark-mode values within the tokens above.
- Waveform shape and timing.
- OG image design (in the site's style).
- Wording of section intros, kept short and plain.

## Answers from Shouvik (2026-11-17)

1. Publish the November 2026 CV PDF as is, phone number included. The site's own pages still show no phone.
2. The CCSC Wiphala talk was **Oct 2025** (the CV's "Oct 2024" is a typo).
3. AI4ED Lab dates are **May 2025 – Nov 2026** (LinkedIn is correct).
4. Production domain: **https://www.shouvikantu.com** (Vercel redirects the bare domain to www).
5. Continuity's live site is **https://continuity.ai4edulab.com**; link it from the card and the project page.
