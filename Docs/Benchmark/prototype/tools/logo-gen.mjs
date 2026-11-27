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

// Light wordmark for dark surfaces (footer, dark header): the wordmark becomes white, the figure keeps its colours.
// The wordmark is saturated green like the figure, so colour cannot separate them. Instead the opaque
// pixels are traced into 8-connected islands and an island whose top edge lies below WORDMARK_TOP
// (letter tops start near y=318; the figure starts near y=60) is wordmark. Anti-aliased pixels take
// the colour of a neighbouring wordmark island, so no green/dark fringe is left on the letters.
const WORDMARK_TOP = 300; // source px
const ALPHA_MIN = 16;     // islands are traced above this alpha, so faint halos do not bridge islands

async function lightWordmark() {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = Buffer.from(data);
  const label = new Int32Array(w * h).fill(-1);
  const queue = new Int32Array(w * h);
  const islands = [];
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || px[start * 4 + 3] < ALPHA_MIN) continue;
    const id = islands.length;
    const box = { top: Infinity, bottom: -1, count: 0 };
    let head = 0, tail = 0;
    queue[tail++] = start; label[start] = id;
    while (head < tail) {
      const p = queue[head++];
      const x = p % w, y = (p - x) / w;
      box.count++; box.top = Math.min(box.top, y); box.bottom = Math.max(box.bottom, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (label[q] !== -1 || px[q * 4 + 3] < ALPHA_MIN) continue;
        label[q] = id; queue[tail++] = q;
      }
    }
    islands.push(box);
  }
  const isWordmark = (id) => islands[id].top >= WORDMARK_TOP;
  const wordmarkIslands = islands.filter((b) => b.top >= WORDMARK_TOP).length;
  console.log(`light wordmark: ${wordmarkIslands} wordmark islands, ${islands.length - wordmarkIslands} figure islands`);
  for (let p = 0; p < w * h; p++) {
    if (px[p * 4 + 3] === 0) continue;
    let wordmark = label[p] !== -1 && isWordmark(label[p]);
    if (label[p] === -1) { // faint edge pixel: follow the nearest traced island
      const x = p % w, y = (p - x) / w;
      for (let dy = -1; dy <= 1 && !wordmark; dy++) for (let dx = -1; dx <= 1 && !wordmark; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const l = label[ny * w + nx];
        wordmark = l !== -1 && isWordmark(l);
      }
    }
    if (wordmark) { px[p * 4] = 255; px[p * 4 + 1] = 255; px[p * 4 + 2] = 255; }
  }
  return sharp(px, { raw: { width: w, height: h, channels: 4 } });
}

// Light wordmark (white letters, coloured figure): height 40 / 80 / 120 CSS px (1x / 2x / 3x).
const light = await lightWordmark();
for (const [scale, h] of [[1, 40], [2, 80], [3, 120]]) {
  await write(`logo-light@${scale}x.png`, light.clone().resize({ height: h }));
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
