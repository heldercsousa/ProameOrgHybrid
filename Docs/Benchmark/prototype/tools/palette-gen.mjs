// Generates assets/../themes.css: three palette themes (A, B, C) x light/dark.
//   A = the original brand seed #A8CF45 (hand-tuned in styles.css until now)
//   B = top-scored colour extracted from the new logo (default)
//   C = second-scored logo colour (falls back to a 50/50 blend when it is too close to B)
// Method: Material Color Utilities (QuantizerCelebi -> Score -> SchemeTonalSpot), the same
// pipeline as Material Theme Builder "from image". Run: `npm run palette` inside tools/.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import {
  argbFromHex, hexFromArgb, Hct, QuantizerCelebi, Score, SchemeTonalSpot, Blend,
} from '@material/material-color-utilities';

const here = path.dirname(fileURLToPath(import.meta.url));
const protoDir = path.resolve(here, '..');
const LOGO = path.join(protoDir, 'assets', 'Logo-PROAME-2.png');
const OUT = path.join(protoDir, 'themes.css');
const SEED_A = '#A8CF45';
const MIN_CONTRAST = 4.5;

// ---- logo pixels -> ARGB sample -------------------------------------------------------
async function logoPixels() {
  const { data, info } = await sharp(await readFile(LOGO))
    .resize({ width: 512, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue; // skip transparent / antialiased edges
    out.push((0xff << 24) | (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  }
  return { argb: Uint32Array.from(out), width: info.width, height: info.height };
}

// ---- WCAG 2.x contrast (independent of the MCU library, used as the gate) -------------
function luminance(argb) {
  const ch = [(argb >> 16) & 255, (argb >> 8) & 255, argb & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---- seed selection -------------------------------------------------------------------
const { argb, width, height } = await logoPixels();
const counts = QuantizerCelebi.quantize(argb, 128);
const ranked = Score.score(counts, { desired: 4 });
const seedB = ranked[0];
let seedC = ranked[1];
const hueGap = Math.abs(Hct.fromInt(seedB).hue - Hct.fromInt(seedC).hue);
if (seedC === undefined || Math.min(hueGap, 360 - hueGap) < 15) {
  seedC = Blend.harmonize(seedB, argbFromHex(SEED_A)); // harmonised blend fallback
}
const seeds = { a: argbFromHex(SEED_A), b: seedB, c: seedC };

// ---- scheme -> token map (names match styles.css) -----------------------------------
const roles = {
  primary: 'primary', onPrimary: 'on-primary', primaryContainer: 'primary-container',
  onPrimaryContainer: 'on-primary-container', secondary: 'secondary',
  secondaryContainer: 'secondary-container', onSecondaryContainer: 'on-secondary-container',
  tertiary: 'tertiary', tertiaryContainer: 'tertiary-container',
  onTertiaryContainer: 'on-tertiary-container', error: 'error',
  errorContainer: 'error-container', onErrorContainer: 'on-error-container',
  surface: 'surface', surfaceDim: 'surface-dim', surfaceContainerLowest: 'surface-c-lowest',
  surfaceContainerLow: 'surface-c-low', surfaceContainer: 'surface-c',
  surfaceContainerHigh: 'surface-c-high', surfaceContainerHighest: 'surface-c-highest',
  onSurface: 'on-surface', onSurfaceVariant: 'on-surface-variant', outline: 'outline',
  outlineVariant: 'outline-variant', inverseSurface: 'inverse-surface',
  inverseOnSurface: 'inverse-on-surface',
};

function tokensFor(seed, isDark) {
  const sc = new SchemeTonalSpot(Hct.fromInt(seed), isDark, 0);
  const t = {};
  for (const [prop, name] of Object.entries(roles)) {
    if (sc[prop] === undefined) throw new Error(`Scheme has no role "${prop}"`);
    t[name] = hexFromArgb(sc[prop]);
  }
  const h = Hct.fromInt(seed);
  const hueWarn = 70; // amber, for warn containers
  const hueInfo = Hct.fromInt(sc.tertiary).hue;
  const ink = (tone) => hexFromArgb(Hct.from(h.hue, Math.min(h.chroma, 40), tone).toInt());
  t['brand'] = hexFromArgb(seed);
  t['on-brand'] = ink(10);
  if (isDark) {
    t['deep'] = ink(6); t['deep-2'] = ink(18); t['on-deep'] = ink(90);
    t['warn-container'] = hexFromArgb(Hct.from(hueWarn, 40, 30).toInt());
    t['on-warn-container'] = hexFromArgb(Hct.from(hueWarn, 30, 90).toInt());
    t['info-container'] = hexFromArgb(Hct.from(hueInfo, 30, 30).toInt());
    t['on-info-container'] = hexFromArgb(Hct.from(hueInfo, 15, 90).toInt());
  } else {
    t['deep'] = ink(18); t['deep-2'] = ink(28); t['on-deep'] = ink(94);
    t['warn-container'] = hexFromArgb(Hct.from(hueWarn, 45, 90).toInt());
    t['on-warn-container'] = hexFromArgb(Hct.from(hueWarn, 40, 15).toInt());
    t['info-container'] = hexFromArgb(Hct.from(hueInfo, 30, 90).toInt());
    t['on-info-container'] = hexFromArgb(Hct.from(hueInfo, 30, 15).toInt());
  }
  return t;
}

// ---- WCAG AA gate on every text-bearing pair ------------------------------------------
const PAIRS = [
  ['on-primary', 'primary'], ['on-primary-container', 'primary-container'],
  ['on-secondary-container', 'secondary-container'], ['on-tertiary-container', 'tertiary-container'],
  ['on-error-container', 'error-container'], ['on-surface', 'surface'],
  ['on-surface', 'surface-c-lowest'], ['on-surface', 'surface-c-high'],
  ['on-surface-variant', 'surface'], ['on-surface-variant', 'surface-c-high'],
  ['primary', 'surface'], ['primary', 'surface-c-low'],
  ['on-brand', 'brand'], ['on-deep', 'deep'], ['on-warn-container', 'warn-container'],
  ['on-info-container', 'info-container'], ['inverse-on-surface', 'inverse-surface'],
];

const failures = [];
const report = [];
const palettes = {};
for (const [key, seed] of Object.entries(seeds)) {
  palettes[key] = {};
  for (const mode of ['light', 'dark']) {
    const t = tokensFor(seed, mode === 'dark');
    palettes[key][mode] = t;
    for (const [fg, bg] of PAIRS) {
      const r = contrast(argbFromHex(t[fg]), argbFromHex(t[bg]));
      report.push(`${key.toUpperCase()} ${mode.padEnd(5)} ${fg} / ${bg}: ${r.toFixed(2)}:1`);
      if (r < MIN_CONTRAST) failures.push(`${key}/${mode} ${fg} on ${bg} = ${r.toFixed(2)}`);
    }
  }
}

// ---- emit CSS ------------------------------------------------------------------------
const header = `/* GENERATED by tools/palette-gen.mjs — do not hand-edit.
   Source logo: assets/Logo-PROAME-2.png (${width}x${height}, ${argb.length} opaque samples).
   Seeds: A ${hexFromArgb(seeds.a)} (original brand) · B ${hexFromArgb(seeds.b)} (top-scored logo colour, default)
          · C ${hexFromArgb(seeds.c)} (second logo colour / harmonised blend).
   Method: QuantizerCelebi -> Score -> SchemeTonalSpot (Material Color Utilities 0.3.0).
   Selectors: [data-palette][data-theme]. Token names match styles.css :root / [data-theme]. */\n`;
let css = header;
for (const key of ['a', 'b', 'c']) {
  for (const mode of ['light', 'dark']) {
    const t = palettes[key][mode];
    css += `\n[data-palette="${key}"][data-theme="${mode}"] {\n`;
    for (const [name, hex] of Object.entries(t)) css += `  --${name}: ${hex};\n`;
    css += `}\n`;
  }
}
await writeFile(OUT, css);

console.log(report.join('\n'));
console.log(`\nSeeds: A ${hexFromArgb(seeds.a)} | B ${hexFromArgb(seeds.b)} | C ${hexFromArgb(seeds.c)}`);
console.log(`Wrote ${OUT}`);
if (failures.length) {
  console.error(`\nWCAG AA FAILURES:\n${failures.join('\n')}`);
  process.exitCode = 1;
}
