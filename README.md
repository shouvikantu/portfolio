# shouvikantu.com

Personal research site of Shouvik Ahmed Antu, built with [Astro](https://astro.build) and deployed on Vercel.

## Run it

Needs Node 24 (see `.node-version`).

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm test           # unit tests, type check + build, build-output tests, link check
```

## Where things live

| What | File |
| --- | --- |
| Name, email, links, hero caption, "now" strip | `src/site.ts` |
| Publications | `src/data/publications.json` |
| Research and teaching experience | `src/data/experience.json` |
| Talks | `src/data/talks.json` |
| Education | `src/data/education.json` |
| Awards | `src/data/awards.json` |
| Continuity project page | `src/pages/continuity.astro` |
| Colors, fonts, type scale | `src/styles/tokens.css` |
| CV | `public/cv.pdf` |
| CCSC slide deck (kept at `/ccsc.html`) | `public/ccsc.html`, `public/slides/` |

The data files are checked against the schemas in `src/content.config.ts`, so a typo in a date or a missing field fails the build.

## Add a publication

Add an entry to `src/data/publications.json`:

```json
{
  "id": "short-unique-id",
  "title": "Paper title",
  "authors": ["Antu, S. A.", "Coauthor, X."],
  "year": 2027,
  "date": "2027-02",
  "venue": "Full venue name",
  "venueShort": "VENUE",
  "status": "published",
  "url": "https://…",
  "tag": "yellow"
}
```

`status` is one of `published`, `accepted`, `submitted`, `preprint`. `tag` is the highlighter color: `yellow`, `green`, `pink` or `blue`. `date` and `url` are optional. Your name is bolded automatically when it is written as `Antu, S. A.`, `Ahmed Antu, S.` or `Antu, S.`.

## Other

- `npm run og` regenerates the link-preview image `public/og.png`.
- `vercel.json` forwards `/emai` to the separate EMAI app. Don't remove it.
