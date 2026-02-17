// ══════════════════════════════════════════════════════════════════════════════
//  LevelMap.js — Short auto-runner level (~12 seconds)
//  Mario auto-runs at 190px/s. Flag at ~2300px ≈ 12 seconds.
// ══════════════════════════════════════════════════════════════════════════════

import { Platform, PLATFORM_TYPE, TILE_SIZE } from './Platform.js';
import { Enemy } from './Enemy.js';
import { Coin  } from './Coin.js';

const T  = TILE_SIZE; // 32px

export const WORLD_WIDTH  = 2700;
export const WORLD_HEIGHT = 480;

const GY = WORLD_HEIGHT - 2 * T; // ground top Y

function ground(x0, x1) {
  return new Platform(x0, GY, x1 - x0, 2 * T, PLATFORM_TYPE.GROUND);
}

function pipe(col, heightTiles = 2) {
  return new Platform(col * T, GY - (heightTiles - 1) * T, T * 2, heightTiles * T, PLATFORM_TYPE.PIPE);
}

function coin(cx, cy) {
  return new Coin(cx - 10, cy - 10, 20);
}

// ── Flag ──────────────────────────────────────────────────────────────────────
export class Flag {
  constructor(x) {
    this.x          = x;
    this.y          = GY - 8 * T;
    this.w          = 8;
    this.h          = 8 * T;
    this.poleHeight = 8 * T;
    this.triggered  = false;
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.x - 40, this.y, 80, this.poleHeight + T)) return;
    const sx = Math.round(this.x);
    const sy = Math.round(this.y);

    // Pole
    ctx.fillStyle = '#AAA';
    ctx.fillRect(sx, sy, 6, this.poleHeight);
    // Gold ball
    ctx.fillStyle = '#FBD000';
    ctx.beginPath();
    ctx.arc(sx + 3, sy + 2, 9, 0, Math.PI * 2);
    ctx.fill();
    // Flag pennant
    ctx.fillStyle = '#E52521';
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy + 6);
    ctx.lineTo(sx + 38, sy + 20);
    ctx.lineTo(sx + 6,  sy + 34);
    ctx.closePath();
    ctx.fill();
    // Base block
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 20, GY, 48, 2 * T);
    ctx.fillStyle = '#666';
    ctx.fillRect(sx - 20, GY, 48, 6);
  }

  overlaps(mario) {
    return (
      mario.x < this.x + 44 &&
      mario.x + mario.w > this.x - 20 &&
      mario.y < this.y + this.poleHeight &&
      mario.y + mario.h > this.y
    );
  }
}

// ── Build level ───────────────────────────────────────────────────────────────
export function buildLevel() {
  const platforms = [];
  const enemies   = [];
  const coins     = [];

  // Full continuous ground — no frustrating gaps for a casual unlock game
  platforms.push(ground(0, WORLD_WIDTH));

  // ── Pipes (must jump over) ─────────────────────────────────────────────────
  // Pipe 1 at tile 22 (704px) — intro obstacle
  platforms.push(pipe(22, 2));
  // Pipe 2 at tile 44 (1408px) — taller
  platforms.push(pipe(44, 3));
  // Pipe 3 at tile 63 (2016px) — final hurdle
  platforms.push(pipe(63, 2));

  // ── Coins (floating above ground level, easy to collect) ──────────────────
  // Arc over first pipe
  for (let i = 0; i < 5; i++) {
    coins.push(coin((19 + i) * T + T / 2, GY - T * 2.5));
  }
  // Arc over second pipe
  for (let i = 0; i < 5; i++) {
    coins.push(coin((41 + i) * T + T / 2, GY - T * 2.5));
  }
  // Coins near flag
  for (let i = 0; i < 4; i++) {
    coins.push(coin((68 + i) * T + T / 2, GY - T * 2));
  }

  // ── Enemies ────────────────────────────────────────────────────────────────
  // Goomba 1 — at tile 32 (meets Mario ~4.5s in, mid-run)
  enemies.push(new Enemy(32 * T, GY - T));
  // Goomba 2 — at tile 50 (meets Mario ~6.7s in)
  enemies.push(new Enemy(50 * T, GY - T));
  // Goomba 3 + 4 close pair — at tiles 56 & 57.5 (meets ~8s in)
  enemies.push(new Enemy(56 * T,       GY - T));
  enemies.push(new Enemy(57 * T + 20,  GY - T));

  // ── Flag ───────────────────────────────────────────────────────────────────
  const flag = new Flag(72 * T); // 2304px — ~12.1s at 190px/s

  return { platforms, enemies, coins, flag };
}
