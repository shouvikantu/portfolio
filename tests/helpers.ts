import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

export function readDist(path: string): string {
  return readFileSync(`dist/${path}`, 'utf8');
}

export function distHtml(path: string): Document {
  return parseHTML(readDist(path)).document as unknown as Document;
}
