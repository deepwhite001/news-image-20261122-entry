// draw.mjs — hand-drawn 1024x1024 newspaper front page for
// "THE WORLD TODAY", Sunday 22 November 2026.
// Node standard library only. No assets, no fonts from disk:
// the 5x7 bitmap font below is typed out by hand, and the PNG
// encoder is written here too (zlib for the deflate stream).
import zlib from 'node:zlib';

// Each glyph: 7 rows of 5 bits, '1' = ink. Uppercase only;
// all copy is uppercased before drawing.
const FONT = {
  'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  'G': ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  'J': ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  'W': ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
};

// Digits and punctuation, same 5x7 grid.
Object.assign(FONT, {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '$': ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '"': ['01010', '01010', '01010', '00000', '00000', '00000', '00000'],
  '·': ['00000', '00000', '01100', '01100', '00000', '00000', '00000'],
  '—': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
});

const W = 1024;
const H = 1024;
const PAPER = [248, 243, 230];
const INK = [17, 17, 17];
const RED = [164, 30, 34];
const GREY = [90, 84, 74];

// Raw RGB canvas.
function makeCanvas() {
  const buf = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    buf[i * 3] = PAPER[0];
    buf[i * 3 + 1] = PAPER[1];
    buf[i * 3 + 2] = PAPER[2];
  }
  return buf;
}

function setPx(buf, x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}

function fillRect(buf, x, y, w, h, c) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPx(buf, xx, yy, c);
  }
}

// One glyph, scaled. Returns the advance in pixels.
function drawChar(buf, ch, x, y, s, c) {
  const g = FONT[ch] || FONT['?'];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r][col] === '1') fillRect(buf, x + col * s, y + r * s, s, s, c);
    }
  }
  return 6 * s;
}

function textWidth(text, s) {
  return text.length * 6 * s - s;
}

function drawText(buf, text, x, y, s, c) {
  let cx = x;
  for (const ch of text.toUpperCase()) cx += drawChar(buf, ch, cx, y, s, c);
  return cx;
}

function drawTextCentred(buf, text, cx, y, s, c) {
  drawText(buf, text, cx - Math.floor(textWidth(text, s) / 2), y, s, c);
}

// Greedy word wrap: returns lines that fit maxWidth pixels at scale s.
function wrap(text, s, maxWidth) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const trial = line ? line + ' ' + w : w;
    if (textWidth(trial, s) <= maxWidth || !line) line = trial;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawPara(buf, text, x, y, s, maxWidth, lineGap, c) {
  const lines = wrap(text, s, maxWidth);
  const lh = 7 * s + lineGap;
  lines.forEach((ln, i) => drawText(buf, ln, x, y + i * lh, s, c || INK));
  return y + lines.length * lh;
}

// ---- PNG encoder (truecolor, filter 0) ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePNG(buf) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Front page layout ----
const M = 36;            // side margin
const CW = W - 2 * M;    // 952 content width

function rule(buf, x, y, w, thick, c) {
  fillRect(buf, x, y, w, thick, c || INK);
}

function kicker(buf, text, x, y, s) {
  drawText(buf, text, x, y, s, RED);
  return y + 7 * s + 6;
}

function headline(buf, lines, x, y, s) {
  const lh = 7 * s + 5;
  lines.forEach((ln, i) => drawText(buf, ln, x, y + i * lh, s, INK));
  return y + lines.length * lh;
}

export function buildFrontPage() {
  const b = makeCanvas();

  // Masthead
  drawTextCentred(b, 'THE WORLD TODAY', W / 2, 34, 9, INK);
  drawTextCentred(b, 'SUNDAY, 22 NOVEMBER 2026', W / 2, 116, 2, GREY);
  rule(b, M, 146, CW, 5);
  rule(b, M, 156, CW, 1);

  // ---- Lead story: war in Europe ----
  let y = 176;
  y = kicker(b, 'WAR IN EUROPE', M, y, 2);
  y = headline(b, [
    "RUSSIA'S BIGGEST AIR RAID",
    'OF THE YEAR SPILLS INTO POLAND',
  ], M, y, 4);
  y = drawPara(b,
    'More than 110 missiles and 400 drones struck Ukraine overnight in one ' +
    'of the heaviest attacks of the war. Two missiles and a drone came down ' +
    'in south-east Poland. No one was hurt. NATO\'s chief, in Warsaw, vowed ' +
    'the alliance will defend every inch of Polish soil.',
    M, y + 8, 2, CW, 4);
  rule(b, M, y + 12, CW, 1);
  y += 30;

  // ---- Two-column row: Mexico / Baltic ----
  const colW = Math.floor((CW - 24) / 2);
  const col2 = M + colW + 24;
  let yL = y, yR = y;
  yL = kicker(b, 'LATIN AMERICA', M, yL, 2);
  yL = headline(b, ['MEXICO CAPTURES', 'MOST-WANTED CARTEL BOSS'], M, yL, 3);
  yL = drawPara(b,
    'Troops seized a drug kingpin on the FBI\'s most-wanted list after a ' +
    'gun battle in Sinaloa. Eleven people were killed in the violence that ' +
    'followed the arrest.',
    M, yL + 6, 2, colW, 4);
  yR = kicker(b, 'THE BALTIC', col2, yR, 2);
  yR = headline(b, ['DRONES SET RUSSIAN', 'CARGO SHIP ABLAZE'], col2, yR, 3);
  yR = drawPara(b,
    'Two drones hit the military-linked freighter Sparta II in the Gulf of ' +
    'Finland. The burning ship drifted into Finnish waters as the war at ' +
    'sea reached a NATO coastline.',
    col2, yR + 6, 2, colW, 4);
  y = Math.max(yL, yR) + 14;
  rule(b, M, y, CW, 1);
  y += 18;

  // ---- Two-column row: Bangladesh / United States ----
  yL = y; yR = y;
  yL = kicker(b, 'SOUTH ASIA', M, yL, 2);
  yL = headline(b, ['DOZENS OF HOUSES TORCHED', 'AS BANGLADESH UNREST GROWS'], M, yL, 3);
  yL = drawPara(b,
    'Nearly 30 homes were set ablaze in Narail as supporters of rival ' +
    'parties clashed. Protests demanding the return of ousted prime ' +
    'minister Sheikh Hasina spread to more districts.',
    M, yL + 6, 2, colW, 4);
  yR = kicker(b, 'UNITED STATES', col2, yR, 2);
  yR = headline(b, ['TRUMP VOWS 10% CAP', 'ON CREDIT CARD RATES'], col2, yR, 3);
  yR = drawPara(b,
    'The president said he will work with Democrats to cap card interest ' +
    'at 10 percent. The pledge puts household borrowing costs at the ' +
    'centre of the economic debate.',
    col2, yR + 6, 2, colW, 4);
  y = Math.max(yL, yR) + 14;
  rule(b, M, y, CW, 1);
  y += 18;

  // ---- Bottom band: GTA VI (left) + ALSO TODAY (right) ----
  yL = y; yR = y;
  yL = kicker(b, 'CULTURE', M, yL, 2);
  yL = headline(b, ['GTA VI SMASHES RECORDS', 'WITH $3.79BN FIRST DAY'], M, yL, 3);
  yL = drawPara(b,
    'The long-awaited game took an estimated $3.79 billion on launch day, ' +
    'the biggest debut in games history, as players hunted for its hidden ' +
    'secrets.',
    M, yL + 6, 2, colW, 4);
  yR = kicker(b, 'ALSO TODAY', col2, yR, 2);
  const items = [
    'Fire at a sweet factory near Jakarta kills three; 36 workers missing.',
    'At least 24 die as a boat carrying mourners capsizes in Nigeria.',
    'UN talks agree to draft rules on killer robots by 2028.',
    'Amazon nears a $7.5bn deal for Israeli AI startup Decart.',
  ];
  let iy = yR + 4;
  for (const it of items) {
    drawText(b, '\u00b7', col2, iy, 2, RED);
    iy = drawPara(b, it, col2 + 18, iy, 2, colW - 18, 3);
    iy += 6;
  }
  y = Math.max(yL, iy) + 16;

  // Footer
  rule(b, M, y, CW, 1);
  drawTextCentred(b, 'THE WORLD TODAY \u00b7 SUNDAY 22 NOVEMBER 2026 \u00b7 SIX STORIES, ONE DAY',
    W / 2, y + 12, 2, GREY);

  return encodePNG(b);
}
