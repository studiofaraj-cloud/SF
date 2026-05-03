import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1428"/>
      <stop offset="100%" stop-color="#0a1f4a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="60%">
      <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0a1f4a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="#3b82f6"/>

  <text x="${W / 2}" y="270" text-anchor="middle"
        font-family="Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="84" font-weight="800" fill="#ffffff">Studio Faraj</text>

  <line x1="${W / 2 - 60}" y1="298" x2="${W / 2 + 60}" y2="298" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>

  <text x="${W / 2}" y="358" text-anchor="middle"
        font-family="Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="34" font-weight="500" fill="#e2e8f0">Sviluppo Web Professionale</text>

  <text x="${W / 2}" y="420" text-anchor="middle"
        font-family="Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="24" font-weight="400" fill="#94a3b8">Padova, Veneto  •  Web Design  •  E-Commerce  •  SEO</text>

  <text x="${W / 2}" y="575" text-anchor="middle"
        font-family="Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="26" font-weight="500" fill="#3b82f6">www.studiofaraj.it</text>
</svg>`;

const out = resolve(process.cwd(), 'public/assets/og-image.jpg');
await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(out);
console.log('Wrote', out);
