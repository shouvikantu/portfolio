// Renders public/og.png (1200×630) for link previews. Run with: npm run og
import sharp from 'sharp';
import { barHeights } from '../src/lib/waveform.ts';

const W = 1200, H = 630, PAD = 80;
const bars = barHeights(80, 7);
const gap = (W - PAD * 2) / bars.length;
const waveTop = 330, waveH = 120;
const rects = bars.map((h, i) => {
  const bh = Math.max(4, h * waveH);
  const played = i / bars.length < 0.42;
  return `<rect x="${(PAD + i * gap).toFixed(1)}" y="${(waveTop + (waveH - bh) / 2).toFixed(1)}" width="${(gap * 0.5).toFixed(1)}" height="${bh.toFixed(1)}" rx="2.5" fill="${played ? '#e8552f' : '#17202c'}" opacity="${played ? 1 : 0.22}"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#eef0f4"/>
  <text x="${PAD}" y="118" font-family="JetBrains Mono, Menlo, monospace" font-size="24" fill="#5b6875" letter-spacing="2">SHOUVIK · 00:03 / 00:14</text>
  <text x="${PAD}" y="235" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="800" font-size="92" fill="#17202c" letter-spacing="-3">Shouvik Ahmed Antu</text>
  ${rects}
  <rect x="${PAD - 6}" y="500" width="492" height="50" rx="4" fill="#ffe36e"/>
  <text x="${PAD}" y="536" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="36" fill="#17202c">Conversational AI for learning</text>
  <text x="${W - PAD}" y="536" text-anchor="end" font-family="JetBrains Mono, Menlo, monospace" font-size="26" fill="#5b6875">shouvikantu.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('wrote public/og.png');
