// Writes the pre-sized logo asset set into assets/logo/ from the working file
// assets/Logo-PROAME-2.png (2048x768, transparent). No runtime scaling in the prototype:
// every <img> uses one of these files at its exact display size (1x / 2x / 3x).
// Run: `npm run logos` inside tools/.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const protoDir = path.resolve(here, '..');
const SRC = path.join(protoDir, 'assets', 'Logo-PROAME-2.png');
const OUT = path.join(protoDir, 'assets', 'logo');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
// Symbol = the figure above the wordmark (source pixel box, 2048x768 space).
// Bottom edge stops above the letter tops (O/A start near y=318) so no wordmark pixels leak in.
const SYMBOL_BOX = { left: 600, top: 40, width: 500, height: 272 };

const src = await readFile(SRC);
await mkdir(OUT, { recursive: true });

const write = (name, pipeline) => pipeline.png({ compressionLevel: 9 }).toFile(path.join(OUT, name));

// Full wordmark: height 40 / 80 / 120 CSS px (1x / 2x / 3x).
for (const [scale, h] of [[1, 40], [2, 80], [3, 120]]) {
  await write(`logo-full@${scale}x.png`, sharp(src).resize({ height: h }));
}

// Symbol: square-ish crop of the figure, same heights for the narrow-screen header.
const symbol = () => sharp(src).extract(SYMBOL_BOX);
for (const [scale, h] of [[1, 40], [2, 80], [3, 120]]) {
  await write(`logo-symbol@${scale}x.png`, symbol().resize({ height: h }));
}

// Square marks: symbol centred on an opaque white square of `size`, `fill` = share of the side.
async function squareMark(size, fill, opaque = true) {
  const inner = Math.round(size * fill);
  const glyph = await symbol().resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background: opaque ? WHITE : { r: 0, g: 0, b: 0, alpha: 0 } } });
  return base.composite([{ input: glyph, gravity: 'centre' }]);
}

await write('favicon-32.png', await squareMark(32, 0.9));
await write('favicon-48.png', await squareMark(48, 0.9));
await write('apple-touch-icon.png', (await squareMark(180, 0.8)).removeAlpha()); // iOS fills transparency black: opaque
await write('icon-192.png', await squareMark(192, 0.8));
await write('icon-512.png', await squareMark(512, 0.8));
// Maskable: content inside the 80% safe zone (centre 0.8 of the side -> glyph at 0.6).
await write('icon-maskable-512.png', await squareMark(512, 0.6));
// Store icons: Play 512 and App Store 1024 (App Store must have no alpha: opaque white).
await write('store-512.png', await squareMark(512, 0.8));
await write('store-1024.png', (await squareMark(1024, 0.8)).flatten({ background: WHITE }).removeAlpha());

// Open Graph 1200x630: full wordmark centred on white.
const wordmark = await sharp(src).resize({ height: 300 }).png().toBuffer();
await write('og-image.png', sharp({ create: { width: 1200, height: 630, channels: 4, background: WHITE } })
  .composite([{ input: wordmark, gravity: 'centre' }]));

console.log(`Wrote logo set to ${OUT}`);
