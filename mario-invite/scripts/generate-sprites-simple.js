#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
//  generate-sprites-simple.js
//  Creates minimal placeholder PNG sprites using only Node.js built-ins.
//  No external dependencies required.
//
//  Run: node scripts/generate-sprites-simple.js
// ══════════════════════════════════════════════════════════════════════════════

import { createDeflate, deflateSync } from 'zlib';
import { writeFileSync, mkdirSync }   from 'fs';
import { fileURLToPath }              from 'url';
import { dirname, join }              from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'assets', 'sprites');
mkdirSync(OUT, { recursive: true });

// ── PNG encoding helpers ──────────────────────────────────────────────────────

function u32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(data) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1;
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len       = u32BE(data.length);
  const crcInput  = Buffer.concat([typeBytes, data]);
  const checksum  = u32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, checksum]);
}

/**
 * Encode an RGBA pixel grid as a PNG buffer.
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} rgba — width * height * 4 bytes
 * @returns {Buffer}
 */
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type = truecolor (RGB, no alpha to keep simple; we'll use RGBA=6)
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data: filter byte (0) + row bytes
  const rowSize = width * 4;
  const raw = Buffer.alloc((1 + rowSize) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowSize + 1)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (rowSize + 1) + 1 + x * 4;
      raw[di]     = rgba[si];     // R
      raw[di + 1] = rgba[si + 1]; // G
      raw[di + 2] = rgba[si + 2]; // B
      raw[di + 3] = rgba[si + 3]; // A
    }
  }

  const compressed = deflateSync(raw);

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Create an RGBA pixel canvas.
 * @param {number} w
 * @param {number} h
 * @returns {{ data: Uint8Array, set: (x, y, r, g, b, a?) => void, fill: (x, y, w, h, r, g, b, a?) => void }}
 */
function createPixelCanvas(w, h) {
  const data = new Uint8Array(w * h * 4);

  function set(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = (y * w + x) * 4;
    data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = a;
  }

  function fill(x0, y0, fw, fh, r, g, b, a = 255) {
    for (let y = y0; y < y0 + fh; y++) {
      for (let x = x0; x < x0 + fw; x++) {
        set(x, y, r, g, b, a);
      }
    }
  }

  function circle(cx, cy, radius, r, g, b, a = 255) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
          set(x, y, r, g, b, a);
        }
      }
    }
  }

  return { data, set, fill, circle };
}

function save(pc, width, height, name) {
  const buf = encodePNG(width, height, pc.data);
  writeFileSync(join(OUT, name), buf);
  console.log(`  ✓ ${name} (${width}×${height})`);
}

// ── mario.png — 4-frame spritesheet (idle, run1, run2, jump) 128×40 ──────────
;(function mario() {
  const FW = 32, FH = 40;
  const W  = FW * 4;
  const pc = createPixelCanvas(W, FH);

  function frame(ox, legL = 0, legR = 0) {
    // Hat (red)
    pc.fill(ox+6, 0,  20, 8,  229, 37, 33);
    pc.fill(ox+2, 5,  28, 5,  229, 37, 33);
    // Face
    pc.fill(ox+6, 9,  20, 10, 255, 204, 136);
    // Eye
    pc.fill(ox+20, 11, 4, 4, 0, 0, 0);
    // Mustache
    pc.fill(ox+6, 18, 20, 3, 139, 69, 19);
    // Overalls body
    pc.fill(ox+4, 21, 24, 12, 0, 0, 229);
    // Shirt
    pc.fill(ox+8, 21, 16, 8,  229, 37, 33);
    // Buckles
    pc.fill(ox+6,  22, 4, 3,  251, 208, 0);
    pc.fill(ox+22, 22, 4, 3,  251, 208, 0);
    // Left leg
    pc.fill(ox+4,  33+legL, 10, 7, 0, 0, 229);
    pc.fill(ox+2,  38+legL, 12, FH-38-Math.max(0,legL), 107, 50, 0);
    // Right leg
    pc.fill(ox+18, 33+legR, 10, 7, 0, 0, 229);
    pc.fill(ox+18, 38+legR, 12, FH-38-Math.max(0,legR), 107, 50, 0);
  }

  frame(0,    0,  0);  // idle
  frame(FW,  -3,  3);  // run1
  frame(FW*2, 3, -3);  // run2
  frame(FW*3,-4, -4);  // jump

  save(pc, W, FH, 'mario.png');
})();

// ── goomba.png — 2-frame spritesheet 64×32 ───────────────────────────────────
;(function goomba() {
  const FW = 32, FH = 32;
  const pc = createPixelCanvas(FW*2, FH);

  function goombaFrame(ox, footR) {
    // Body
    pc.fill(ox+2, 18, FW-4, 14, 160, 80, 0);
    // Head circle
    pc.circle(ox+16, 14, 13, 192, 96, 0);
    // Eyes
    pc.fill(ox+4, 9, 8, 7, 255,255,255);
    pc.fill(ox+20, 9, 8, 7, 255,255,255);
    // Pupils
    pc.fill(ox+5, 10, 4, 4, 0,0,0);
    pc.fill(ox+21, 10, 4, 4, 0,0,0);
    // Angry brows
    pc.fill(ox+3, 7, 9, 2, 0,0,0);
    pc.fill(ox+20, 7, 9, 2, 0,0,0);
    // Feet
    pc.fill(ox+2, FH-8, 10, 8, 107,50,0);
    pc.fill(ox+FW-12+footR, FH-8, 10, 8, 107,50,0);
  }

  goombaFrame(0, 0);
  goombaFrame(FW, 3);

  save(pc, FW*2, FH, 'goomba.png');
})();

// ── tiles.png — 4 tile types 128×32 ──────────────────────────────────────────
;(function tiles() {
  const T  = 32;
  const pc = createPixelCanvas(T*4, T);

  // Ground tile
  pc.fill(0, 0, T, T, 200, 75, 12);
  pc.fill(0, 0, T, 8, 0, 168, 0);

  // Brick tile
  pc.fill(T, 0, T, T, 200, 75, 12);
  // mortar lines
  for (let x = T; x < T*2; x++) {
    pc.set(x, T/2, 139, 48, 0);
  }
  for (let y = 0; y < T; y++) {
    pc.set(T + T/2, y, 139, 48, 0);
  }

  // Question tile
  pc.fill(T*2, 0, T, T, 251, 208, 0);
  // ? symbol (rough pixel art)
  const qpx = [[13,4],[14,4],[15,4],[16,4],[17,4],[12,5],[18,5],[18,6],[16,7],[17,7],[16,8],[16,10],[16,11]];
  for (const [x, y] of qpx) pc.set(T*2 + x, y, 139, 96, 0);

  // Pipe tile
  pc.fill(T*3, 0, T, T, 0, 168, 0);
  pc.fill(T*3+T-8, 0, 8, T, 0, 96, 0);
  pc.fill(T*3, T-6, T, 6, 0, 80, 0);

  save(pc, T*4, T, 'tiles.png');
})();

// ── items.png — coin, mushroom, flag 96×32 ───────────────────────────────────
;(function items() {
  const S  = 32;
  const pc = createPixelCanvas(S*3, S);

  // Coin
  pc.circle(S/2, S/2, 12, 251, 208, 0);
  pc.circle(S/2-2, S/2-2, 7, 255, 232, 64);

  // Mushroom
  pc.circle(S+S/2, 14, 13, 229, 37, 33);
  pc.fill(S+6, 14, S-12, 14, 255, 255, 255);
  pc.circle(S+10, 12, 4, 255, 255, 255);
  pc.circle(S+22, 12, 4, 255, 255, 255);

  // Flag
  pc.fill(S*2+14, 2, 4, S-4, 136, 136, 136);
  // Pennant
  for (let y = 4; y <= 24; y++) {
    const w = Math.round((y - 4) * 0.7);
    pc.fill(S*2+18, y, w, 1, 0, 168, 0);
  }

  save(pc, S*3, S, 'items.png');
})();

console.log('\n✅ Placeholder sprites generated in assets/sprites/');
