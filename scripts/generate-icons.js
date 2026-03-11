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

// --- Icon design: Orbital Rosette ---
// Sage green background with 6-circle rosette pattern in gold
const SAGE  = [74, 103, 65];
const GOLD  = [196, 169, 106];
const SAGE_LIGHT = [92, 120, 82];

// Check if point (px, py) is near the edge of a circle centered at (cx, cy) with radius r
function nearCircle(px, py, cx, cy, r, width) {
  const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
  return Math.abs(d - r) < width;
}

function drawRosette(x, y, size, maskable) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.25;         // rosette circle radius
  const LINE_W = size * 0.008;   // line thickness
  const OUTER_R = size * 0.375;  // outer boundary ring
  const OUTER_W = size * 0.005;
  const CENTER_DOT = size * 0.025;
  const CLIP_R = maskable ? size * 0.5 : size * 0.44;

  const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (distFromCenter > CLIP_R) return maskable ? SAGE : [245, 240, 232]; // bg

  // 6 satellite centers for the rosette
  const satellites = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    satellites.push([cx + R * Math.cos(angle), cy + R * Math.sin(angle)]);
  }

  // Center gold dot
  if (distFromCenter < CENTER_DOT) return [238, 210, 150]; // bright gold center

  // Check if near any rosette circle
  for (const [scx, scy] of satellites) {
    if (nearCircle(x, y, scx, scy, R, LINE_W)) {
      const t = Math.min(1, (LINE_W - Math.abs(Math.sqrt((x - scx) ** 2 + (y - scy) ** 2) - R)) / LINE_W);
      return GOLD.map((c) => Math.round(c * (0.7 + 0.3 * t)));
    }
  }

  // Outer ring
  if (nearCircle(x, y, cx, cy, OUTER_R, OUTER_W)) {
    return GOLD.map((c) => Math.round(c * 0.65));
  }

  return SAGE;
}

function drawIcon(x, y, size) {
  return drawRosette(x, y, size, false);
}

function drawIconMaskable(x, y, size) {
  return drawRosette(x, y, size, true);
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
