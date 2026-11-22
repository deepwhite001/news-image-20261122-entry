// main.ts — entrypoint for news-image-20261122.
// Draws the 22 November 2026 front page and copies it to /output/entry.png.
// Node 22 standard library only; no network, no dependencies.
import { mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFrontPage } from './draw.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });

const png = buildFrontPage();

// Sanity check: a real PNG starts with the 8-byte magic signature and
// declares 1024x1024 in its IHDR. Refuse to ship a corrupt file.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('buildFrontPage did not return a valid PNG');
}
if (png.readUInt32BE(16) !== 1024 || png.readUInt32BE(20) !== 1024) {
  throw new Error('front page is not 1024x1024');
}
if (png.length > 1048576) {
  throw new Error(`front page is ${png.length} bytes, over the 1 MiB limit`);
}

const tmpPath = join(here, 'entry.png');
writeFileSync(tmpPath, png);
copyFileSync(tmpPath, join(outDir, 'entry.png'));
console.log(`wrote ${png.length} bytes to ${join(outDir, 'entry.png')}`);
