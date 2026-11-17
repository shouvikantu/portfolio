import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const ym = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const highlight = z.enum(['yellow', 'green', 'pink', 'blue']);

const publications = defineCollection({
  loader: file('src/data/publications.json'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    year: z.number().int(),
    venue: z.string(),
    venueShort: z.string(),
    status: z.enum(['published', 'accepted', 'submitted', 'preprint']),
    url: z.url().optional(),
    tag: highlight,
  }),
});

const experience = defineCollection({
  loader: file('src/data/experience.json'),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    start: ym,
    end: ym.optional(),
    location: z.string(),
    kind: z.enum(['research', 'teaching']),
    bullets: z.array(z.string()),
  }),
});

const talks = defineCollection({
  loader: file('src/data/talks.json'),
  schema: z.object({ title: z.string(), event: z.string(), place: z.string(), date: ym }),
});

const awards = defineCollection({
  loader: file('src/data/awards.json'),
  schema: z.object({ name: z.string(), org: z.string(), years: z.string() }),
});

const education = defineCollection({
  loader: file('src/data/education.json'),
  schema: z.object({
    school: z.string(),
    degree: z.string(),
    start: ym,
    end: ym,
    location: z.string(),
    notes: z.array(z.string()),
  }),
});

export const collections = { publications, experience, talks, awards, education };
