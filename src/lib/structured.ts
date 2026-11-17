import { isSelf } from './format';

type Publication = {
  title: string;
  authors: string[];
  year: number;
  date?: string;
  venue: string;
  status: 'published' | 'accepted' | 'submitted' | 'preprint';
  url?: string;
};

/** 'Cordova, L.' → 'L. Cordova' */
function displayName(author: string): string {
  const [last, first] = author.split(',').map((s) => s.trim());
  return first ? `${first} ${last}` : author;
}

const STATUS: Record<Publication['status'], string> = {
  published: 'Published',
  accepted: 'Accepted',
  submitted: 'Submitted',
  preprint: 'Preprint',
};

/** schema.org ScholarlyArticle for a publication; Shouvik's author entry points at the site's Person node. */
export function scholarlyArticle(p: Publication, personId: string): Record<string, unknown> {
  return {
    '@type': 'ScholarlyArticle',
    name: p.title,
    headline: p.title,
    author: p.authors.map((a) => (isSelf(a) ? { '@id': personId } : { '@type': 'Person', name: displayName(a) })),
    datePublished: p.date ?? String(p.year),
    isPartOf: { '@type': 'Periodical', name: p.venue },
    creativeWorkStatus: STATUS[p.status],
    ...(p.url ? { url: p.url } : {}),
  };
}
