#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
//  generate-sprites.js — Creates placeholder pixel-art sprite PNGs
//  Run: node scripts/generate-sprites.js
//  Outputs to: assets/sprites/
// ══════════════════════════════════════════════════════════════════════════════

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPRITES_DIR = join(__dirname, '..', 'assets', 'sprites');

mkdirSync(SPRITES_DIR, { recursive: true });

function save(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(SPRITES_DIR, name), buf);
  console.log(`  ✓ ${name}`);
}

// ── mario.png — 4-frame spritesheet (idle, run1, run2, jump) ──────────────────
;(function mario() {
  const FW = 32, FH = 40;
  const FRAMES = 4;
  const canvas = createCanvas(FW * FRAMES, FH);
  const ctx    = canvas.getContext('2d');

  function drawMarioFrame(ctx, ox, state) {
    // Hat
    ctx.fillStyle = '#E52521';
    ctx.fillRect(ox + 6, 0, 20, 8);
    ctx.fillRect(ox + 2, 6, 28, 4);

    // Face
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(ox + 6, 10, 20, 10);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(ox + 20, 12, 4, 4);

    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(ox + 6, 18, 20, 3);

    // Body
    ctx.fillStyle = '#0000E5';
    ctx.fillRect(ox + 4, 21, 24, 12);
    ctx.fillStyle = '#E52521';
    ctx.fillRect(ox + 8, 21, 16, 8);

    // Buckles
    ctx.fillStyle = '#FBD000';
    ctx.fillRect(ox + 6, 22, 4, 3);
    ctx.fillRect(ox + 22, 22, 4, 3);

    // Legs
    ctx.fillStyle = '#0000E5';
    if (state === 'jump') {
      ctx.fillRect(ox + 4,  33, 10, 7);
      ctx.fillRect(ox + 18, 33, 10, 7);
      ctx.fillStyle = '#6B3200';
      ctx.fillRect(ox + 2,  38, 12, FH - 38);
      ctx.fillRect(ox + 18, 38, 12, FH - 38);
    } else {
      const legShift = state === 'run1' ? -3 : state === 'run2' ? 3 : 0;
      ctx.fillRect(ox + 4,  33 + legShift, 10, 7);
      ctx.fillRect(ox + 18, 33 - legShift, 10, 7);
      ctx.fillStyle = '#6B3200';
      ctx.fillRect(ox + 2,  38 + legShift, 12, FH - 38 - legShift);
      ctx.fillRect(ox + 18, 38 - legShift, 12, FH - 38 + legShift);
    }
  }

  const states = ['idle', 'run1', 'run2', 'jump'];
  states.forEach((s, i) => drawMarioFrame(ctx, i * FW, s));
  save(canvas, 'mario.png');
})();

// ── goomba.png — 2-frame spritesheet (walk1, walk2) ──────────────────────────
;(function goomba() {
  const FW = 32, FH = 32;
  const canvas = createCanvas(FW * 2, FH);
  const ctx    = canvas.getContext('2d');

  function drawGoomba(ctx, ox, frame) {
    // Body
    ctx.fillStyle = '#A05000';
    ctx.fillRect(ox + 2, FH * 0.55, FW - 4, FH * 0.45);

    // Head ellipse
    ctx.fillStyle = '#C06000';
    ctx.beginPath();
    ctx.ellipse(ox + FW / 2, FH * 0.45, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes white
    ctx.fillStyle = '#FFF';
    ctx.fillRect(ox + 4, FH * 0.28, 8, 7);
    ctx.fillRect(ox + 20, FH * 0.28, 8, 7);

    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(ox + 5, FH * 0.30, 4, 4);
    ctx.fillRect(ox + 21, FH * 0.30, 4, 4);

    // Eyebrows
    ctx.fillStyle = '#000';
    ctx.fillRect(ox + 3, FH * 0.24, 9, 2);
    ctx.fillRect(ox + 20, FH * 0.24, 9, 2);

    // Feet
    ctx.fillStyle = '#6B3200';
    const fo = frame === 0 ? 0 : 3;
    ctx.fillRect(ox + 2,      FH - 8, 10, 8);
    ctx.fillRect(ox + FW - 12 + fo, FH - 8, 10, 8);
  }

  drawGoomba(ctx, 0,  0);
  drawGoomba(ctx, FW, 1);
  save(canvas, 'goomba.png');
})();

// ── tiles.png — tileset: ground, brick, question, pipe ───────────────────────
;(function tiles() {
  const T = 32;
  // 4 tile types side by side
  const canvas = createCanvas(T * 4, T);
  const ctx    = canvas.getContext('2d');

  // Ground tile
  ctx.fillStyle = '#C84B0C';
  ctx.fillRect(0, 0, T, T);
  ctx.fillStyle = '#00A800';
  ctx.fillRect(0, 0, T, 8);

  // Brick tile
  ctx.fillStyle = '#C84B0C';
  ctx.fillRect(T, 0, T, T);
  ctx.fillStyle = '#8B3000';
  ctx.strokeStyle = '#8B3000';
  ctx.lineWidth = 2;
  ctx.strokeRect(T + 1, 1, T - 2, T - 2);

  // Question tile
  ctx.fillStyle = '#FBD000';
  ctx.fillRect(T * 2, 0, T, T);
  ctx.fillStyle = '#8B6000';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', T * 2 + T / 2, T / 2);

  // Pipe top tile
  ctx.fillStyle = '#00C800';
  ctx.fillRect(T * 3, 0, T, T);
  ctx.fillStyle = '#006000';
  ctx.fillRect(T * 3 + T - 8, 0, 8, T);
  ctx.fillStyle = '#008000';
  ctx.fillRect(T * 3, T - 6, T, 6);

  save(canvas, 'tiles.png');
})();

// ── items.png — coin, mushroom, flag ─────────────────────────────────────────
;(function items() {
  const S = 32;
  const canvas = createCanvas(S * 3, S);
  const ctx    = canvas.getContext('2d');

  // Coin
  ctx.fillStyle = '#FBD000';
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFE840';
  ctx.beginPath();
  ctx.arc(S / 2 - 2, S / 2 - 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C89800';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 11, 0, Math.PI * 2);
  ctx.stroke();

  // Mushroom
  ctx.fillStyle = '#E52521';
  ctx.beginPath();
  ctx.arc(S + S / 2, S * 0.45, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.fillRect(S + 6, S * 0.45, S - 12, S * 0.45);
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(S + 10, S * 0.38, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(S + S - 10, S * 0.38, 4, 0, Math.PI * 2);
  ctx.fill();

  // Flag
  ctx.fillStyle = '#888';
  ctx.fillRect(S * 2 + 14, 2, 4, S - 4);
  ctx.fillStyle = '#00A800';
  ctx.beginPath();
  ctx.moveTo(S * 2 + 18, 4);
  ctx.lineTo(S * 2 + 30, 14);
  ctx.lineTo(S * 2 + 18, 24);
  ctx.closePath();
  ctx.fill();

  save(canvas, 'items.png');
})();

console.log('\nSprites generated successfully in assets/sprites/');
