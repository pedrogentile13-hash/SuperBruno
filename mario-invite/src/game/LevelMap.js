// ══════════════════════════════════════════════════════════════════════════════
//  LevelMap.js — Mario vs Bowser auto-runner (~12 seconds)
//  Mario runs at 190px/s. Bowser boss at ~2200px ≈ 11.6 seconds.
// ══════════════════════════════════════════════════════════════════════════════

import { Platform, PLATFORM_TYPE, TILE_SIZE } from './Platform.js';
import { Enemy } from './Enemy.js';
import { Coin  } from './Coin.js';
import { Boss  } from './Boss.js';

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

// ── Bowser's Castle backdrop drawn on canvas ───────────────────────────────────
// Called WITHIN camera transform — use world coordinates directly.
export function drawCastle(ctx, camera) {
  const cx = 2220;           // world X of castle left edge
  const cy = GY - 5 * T;    // world Y of castle top

  if (!camera.isVisible(cx - 20, cy - 40, 200, 5 * T + 60)) return;

  const sx = Math.round(cx);
  const sy = Math.round(cy);

  ctx.save();

  // Main tower (dark gray)
  ctx.fillStyle = '#555';
  ctx.fillRect(sx, sy, 100, 5 * T);

  // Battlements (top merlons)
  ctx.fillStyle = '#444';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(sx + 6 + i * 24, sy - 20, 14, 22);
  }

  // Gate arch (dark)
  ctx.fillStyle = '#222';
  ctx.fillRect(sx + 30, sy + 5 * T - 52, 40, 52);
  ctx.beginPath();
  ctx.arc(sx + 50, sy + 5 * T - 52, 20, Math.PI, 0, false);
  ctx.fill();

  // Window slits
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(sx + 14, sy + 20, 12, 22);
  ctx.fillRect(sx + 74, sy + 20, 12, 22);

  // "BOWSER'S CASTLE" label
  ctx.fillStyle = '#ff6600';
  ctx.font = 'bold 6px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText("BOWSER'S", sx + 50, sy - 24);
  ctx.fillText('CASTLE', sx + 50, sy - 14);

  ctx.restore();
}

// ── Build level ───────────────────────────────────────────────────────────────
export function buildLevel() {
  const platforms = [];
  const enemies   = [];
  const coins     = [];

  // Full continuous ground — no frustrating gaps for a casual unlock game
  platforms.push(ground(0, WORLD_WIDTH));

  // ── Pipes (must jump over) ─────────────────────────────────────────────────
  platforms.push(pipe(22, 2)); // Pipe 1 at 704px
  platforms.push(pipe(44, 3)); // Pipe 2 at 1408px (taller)
  platforms.push(pipe(60, 2)); // Pipe 3 at 1920px (before castle)

  // ── Coins ──────────────────────────────────────────────────────────────────
  // Arc over pipe 1
  for (let i = 0; i < 5; i++) coins.push(coin((19 + i) * T + T / 2, GY - T * 2.5));
  // Arc over pipe 2
  for (let i = 0; i < 5; i++) coins.push(coin((41 + i) * T + T / 2, GY - T * 2.5));
  // Coins leading to castle
  for (let i = 0; i < 5; i++) coins.push(coin((63 + i) * T + T / 2, GY - T * 2));

  // ── Goomba minions ─────────────────────────────────────────────────────────
  enemies.push(new Enemy(32 * T,       GY - T));   // ~4.5s
  enemies.push(new Enemy(50 * T,       GY - T));   // ~6.7s
  enemies.push(new Enemy(56 * T,       GY - T));   // ~8s pair
  enemies.push(new Enemy(57 * T + 20,  GY - T));

  // ── Boss — Bowser at Bowser's Castle ───────────────────────────────────────
  // Positioned at tile 69 (2208px) — Mario arrives ~11.6s at 190px/s
  const boss = new Boss(69 * T, GY - 52);

  return { platforms, enemies, coins, boss };
}
