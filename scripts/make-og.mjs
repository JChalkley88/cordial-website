// Generates the default social share image (public/og-default.png, 1200x630)
// from brand tokens, embedding the self-hosted Karla font so text renders
// regardless of system fonts. Run with: node scripts/make-og.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const karla600 = readFileSync('node_modules/@fontsource/karla/files/karla-latin-600-normal.woff2').toString('base64');
const karla400 = readFileSync('node_modules/@fontsource/karla/files/karla-latin-400-normal.woff2').toString('base64');
const ss3 = readFileSync('node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2').toString('base64');

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <style>
    @font-face { font-family:'Karla'; font-weight:400; src:url(data:font/woff2;base64,${karla400}) format('woff2'); }
    @font-face { font-family:'Karla'; font-weight:600; src:url(data:font/woff2;base64,${karla600}) format('woff2'); }
    @font-face { font-family:'SS3'; font-weight:600; src:url(data:font/woff2;base64,${ss3}) format('woff2'); }
  </style>
  <rect width="1200" height="630" fill="#2D4A5C"/>
  <text x="100" y="288" font-family="Karla" font-weight="600" font-size="132" letter-spacing="-2" fill="#F2EBDC">Cordial</text>
  <text x="104" y="336" font-family="SS3" font-weight="600" font-size="30" letter-spacing="14" fill="#F2EBDC">ADVISORY</text>
  <rect x="104" y="372" width="76" height="4" fill="#5C3349"/>
  <text x="100" y="486" font-family="Karla" font-weight="600" font-size="36" letter-spacing="-0.5" fill="#F2EBDC" opacity="0.8">We take the friction out of good businesses.</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync('public/og-default.png', png);
const meta = await sharp(png).metadata();
console.log(`og-default.png written: ${meta.width}x${meta.height}, ${Math.round(png.length / 1024)}kB`);
