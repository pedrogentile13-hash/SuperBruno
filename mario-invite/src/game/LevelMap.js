// ══════════════════════════════════════════════════════════════════════════════
//  LevelMap.js — Mario vs Bowser auto-runner (~12 seconds)
//  Mario runs at 190px/s. Bowser boss at ~2200px ≈ 11.6 seconds.
// ══════════════════════════════════════════════════════════════════════════════

import { Platform, PLATFORM_TYPE, TILE_SIZE } from './Platform.js';
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

  return { platforms, enemies, coins };
}
