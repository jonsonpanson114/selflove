/**
 * PNG icon generator for selflove PWA
 * Pure Node.js - no external dependencies required
 * Generates: icon-180.png (apple-touch-icon), icon-192.png, icon-512.png
 */

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// --- CRC32 ---
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// --- PNG chunk builder ---
function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuffer, data, crcBuf]);
}

// --- PNG generator ---
function createPNG(size, drawPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  const ihdr = makeChunk("IHDR", ihdrData);

  // Build raw pixel rows (filter byte 0 + RGB per pixel)
  const rowBytes = 1 + size * 3;
  const raw = Buffer.alloc(size * rowBytes);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = drawPixel(x, y, size);
      const offset = y * rowBytes + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// --- Icon design ---
// Sage green background with concentric circles (cream > gold > cream center)
// matching the SVG aesthetic
function drawIcon(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Colors (RGB)
  const SAGE   = [74, 103, 65];
  const CREAM  = [245, 240, 232];
  const GOLD   = [196, 169, 106];
  const BORDER = [180, 168, 148]; // slightly darker cream for ring

  // Radii (relative to size)
  const CENTER_DOT  = size * 0.065;
  const GOLD_RING   = size * 0.135;
  const RING_LINE   = size * 0.415;
  const RING_WIDTH  = size * 0.012;
  const CREAM_CIRCLE = size * 0.44;

  if (dist < CENTER_DOT)  return CREAM;
  if (dist < GOLD_RING)   return GOLD;
  if (Math.abs(dist - RING_LINE) < RING_WIDTH) return BORDER;
  if (dist < CREAM_CIRCLE) return SAGE;
  return CREAM; // outer cream background (for non-maskable appearance)
}

// Maskable version: full sage green bleed, content centered in safe zone (80% diameter)
function drawIconMaskable(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  const SAGE   = [74, 103, 65];
  const CREAM  = [245, 240, 232];
  const GOLD   = [196, 169, 106];
  const BORDER = [100, 130, 90]; // darker sage for ring on sage bg

  // Safe zone = 80% of icon width = radius 40%
  // Design elements fit within 36% radius
  const CENTER_DOT   = size * 0.055;
  const GOLD_RING    = size * 0.115;
  const RING_LINE    = size * 0.32;
  const RING_WIDTH   = size * 0.01;
  const CREAM_CIRCLE = size * 0.35;

  if (dist < CENTER_DOT)  return CREAM;
  if (dist < GOLD_RING)   return GOLD;
  if (Math.abs(dist - RING_LINE) < RING_WIDTH) return BORDER;
  if (dist < CREAM_CIRCLE) return [...SAGE.map((c) => Math.min(255, c + 18))]; // lighter sage inside
  return SAGE; // full sage background
}

// --- Generate icons ---
const outDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const icons = [
  { name: "icon-180.png",  size: 180, draw: drawIcon },
  { name: "icon-192.png",  size: 192, draw: drawIcon },
  { name: "icon-512.png",  size: 512, draw: drawIconMaskable },
];

for (const { name, size, draw } of icons) {
  const png = createPNG(size, draw);
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: ${name} (${size}x${size})`);
}

console.log("Icons generated successfully.");
