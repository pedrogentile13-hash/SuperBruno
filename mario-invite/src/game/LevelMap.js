// ══════════════════════════════════════════════════════════════════════════════
//  LevelMap.js — Declarative map for the single level
//  Duration target: ~30-45 seconds of gameplay
// ══════════════════════════════════════════════════════════════════════════════

import { Platform, PLATFORM_TYPE, TILE_SIZE } from './Platform.js';
import { Enemy }  from './Enemy.js';
import { Coin }   from './Coin.js';

const T = TILE_SIZE; // 32px

/**
 * World dimensions
 */
export const WORLD_WIDTH  = 6400;
export const WORLD_HEIGHT = 480;

// Ground Y position (top of ground)
const GY = WORLD_HEIGHT - 2 * T;

/**
 * Helper: create a row of ground tiles
 */
function groundRow(xStart, xEnd, yTop = GY, height = 2 * T) {
  return new Platform(xStart, yTop, xEnd - xStart, height, PLATFORM_TYPE.GROUND);
}

/**
 * Helper: platform at grid coords
 */
function plat(col, row, widthTiles = 1, type = PLATFORM_TYPE.BRICK) {
  return new Platform(col * T, row * T, widthTiles * T, T, type);
}

/**
 * Helper: pipe
 */
function pipe(col, heightTiles = 2) {
  const pipeH = heightTiles * T;
  return new Platform(col * T, GY - (heightTiles - 1) * T, T * 2, pipeH, PLATFORM_TYPE.PIPE);
}

/**
 * Helper: coin at pixel coords
 */
function coin(x, y) {
  return new Coin(x - 10, y - 10, 20);
}

// ─── Flag / Goal ─────────────────────────────────────────────────────────────
export class Flag {
  constructor(x) {
    this.x = x;
    this.y = GY - 9 * T;
    this.w = 8;
    this.h = 9 * T;
    this.triggered = false;
    this.poleHeight = 9 * T;
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.x - 32, this.y, 64, this.poleHeight + T)) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);

    // Pole
    ctx.fillStyle = '#888';
    ctx.fillRect(sx, sy, 6, this.poleHeight);

    // Ball
    ctx.fillStyle = '#FBD000';
    ctx.beginPath();
    ctx.arc(sx + 3, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Flag (pennant)
    ctx.fillStyle = '#00A800';
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy + 4);
    ctx.lineTo(sx + 36, sy + 20);
    ctx.lineTo(sx + 6, sy + 36);
    ctx.closePath();
    ctx.fill();

    // Castle-style base
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 16, GY, 40, 2 * T);
  }

  /**
   * Check if mario reaches the flag.
   * @param {{ x:number, y:number, w:number, h:number }} mario
   */
  overlaps(mario) {
    return (
      mario.x < this.x + 40 &&
      mario.x + mario.w > this.x - 16 &&
      mario.y < this.y + this.poleHeight &&
      mario.y + mario.h > this.y
    );
  }
}

// ─── Build the level ─────────────────────────────────────────────────────────

/**
 * @returns {{ platforms: Platform[], enemies: Enemy[], coins: Coin[], flag: Flag }}
 */
export function buildLevel() {
  const platforms = [];
  const enemies   = [];
  const coins     = [];

  // ── Ground sections (with gaps) ────────────────────────────────────────────
  platforms.push(groundRow(0,    T * 50));          // Section 1
  platforms.push(groundRow(T * 53, T * 80));         // Section 2 (gap at 50-53)
  platforms.push(groundRow(T * 82, T * 110));        // Section 3
  platforms.push(groundRow(T * 112, T * 140));       // Section 4
  platforms.push(groundRow(T * 143, T * 170));       // Section 5
  platforms.push(groundRow(T * 170, WORLD_WIDTH));   // Final stretch to flag

  // ── Platforms & bricks ────────────────────────────────────────────────────
  // Area 1 — intro bricks
  platforms.push(plat(10, 8, 3, PLATFORM_TYPE.BRICK));
  platforms.push(plat(14, 6, 1, PLATFORM_TYPE.QUESTION));
  platforms.push(plat(16, 8, 3, PLATFORM_TYPE.BRICK));
  platforms.push(plat(20, 6, 1, PLATFORM_TYPE.QUESTION));
  platforms.push(plat(22, 6, 3, PLATFORM_TYPE.BRICK));

  // Area 2 — staircase up
  platforms.push(plat(30, 11, 1, PLATFORM_TYPE.BRICK));
  platforms.push(plat(31, 10, 1, PLATFORM_TYPE.BRICK));
  platforms.push(plat(32,  9, 1, PLATFORM_TYPE.BRICK));
  platforms.push(plat(33,  8, 2, PLATFORM_TYPE.BRICK));
  platforms.push(plat(36,  9, 1, PLATFORM_TYPE.BRICK));
  platforms.push(plat(37, 10, 1, PLATFORM_TYPE.BRICK));
  platforms.push(plat(38, 11, 1, PLATFORM_TYPE.BRICK));

  // Area 3 — floating platform cluster
  platforms.push(plat(55, 9, 4, PLATFORM_TYPE.BRICK));
  platforms.push(plat(57, 6, 1, PLATFORM_TYPE.QUESTION));
  platforms.push(plat(60, 7, 3, PLATFORM_TYPE.BRICK));

  // Area 4 — big jumps
  platforms.push(plat(70, 10, 2, PLATFORM_TYPE.BRICK));
  platforms.push(plat(73,  8, 2, PLATFORM_TYPE.QUESTION));
  platforms.push(plat(76, 10, 2, PLATFORM_TYPE.BRICK));
  platforms.push(plat(78,  7, 1, PLATFORM_TYPE.QUESTION));

  // Area 5 — pre-castle stretch
  platforms.push(plat(90,  9, 5, PLATFORM_TYPE.BRICK));
  platforms.push(plat(93,  6, 3, PLATFORM_TYPE.QUESTION));
  platforms.push(plat(98,  9, 3, PLATFORM_TYPE.BRICK));
  platforms.push(plat(105, 8, 4, PLATFORM_TYPE.BRICK));
  platforms.push(plat(110, 7, 3, PLATFORM_TYPE.QUESTION));

  // Area 6
  platforms.push(plat(120, 9, 6, PLATFORM_TYPE.BRICK));
  platforms.push(plat(127, 7, 4, PLATFORM_TYPE.BRICK));
  platforms.push(plat(133, 9, 5, PLATFORM_TYPE.BRICK));

  // ── Pipes ──────────────────────────────────────────────────────────────────
  platforms.push(pipe(25, 2));
  platforms.push(pipe(45, 3));
  platforms.push(pipe(63, 2));
  platforms.push(pipe(85, 4));
  platforms.push(pipe(113, 2));
  platforms.push(pipe(138, 3));
  platforms.push(pipe(155, 5));
  platforms.push(pipe(165, 4));

  // ── Coins ──────────────────────────────────────────────────────────────────
  // Row of coins
  for (let i = 0; i < 8; i++) {
    coins.push(coin((12 + i) * T + T / 2, 7 * T));
  }
  // Coins in gap area
  for (let i = 0; i < 3; i++) {
    coins.push(coin((51 + i) * T + T / 2, GY - T));
  }
  // Coins on floating platforms
  coins.push(coin(55 * T + T / 2, 8 * T));
  coins.push(coin(57 * T + T / 2, 8 * T));
  coins.push(coin(59 * T + T / 2, 8 * T));

  // Coins over bricks
  for (let i = 0; i < 5; i++) {
    coins.push(coin((91 + i) * T + T / 2, 8 * T));
  }
  for (let i = 0; i < 4; i++) {
    coins.push(coin((121 + i) * T + T / 2, 8 * T));
  }

  // ── Enemies ────────────────────────────────────────────────────────────────
  enemies.push(new Enemy(18 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(26 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(35 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(47 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(58 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(66 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(75 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(88 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(92 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(105 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(120 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(130 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(140 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(155 * T, GY - TILE_SIZE));
  enemies.push(new Enemy(162 * T, GY - TILE_SIZE));

  // ── Flag ───────────────────────────────────────────────────────────────────
  const flag = new Flag(180 * T);

  return { platforms, enemies, coins, flag };
}
