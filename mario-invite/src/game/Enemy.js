// ══════════════════════════════════════════════════════════════════════════════
//  Enemy.js — Goomba enemy class
// ══════════════════════════════════════════════════════════════════════════════

import { TILE_SIZE } from './Platform.js';

const ENEMY_W = 28;
const ENEMY_H = 28;
const WALK_SPEED = 60;

export const ENEMY_STATE = {
  WALKING: 'walking',
  DEAD:    'dead',
  SQUISH:  'squish',
};

export class Enemy {
  /**
   * @param {number} x — world X
   * @param {number} y — world Y (bottom of screen)
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = ENEMY_W;
    this.h = ENEMY_H;

    this.vx = -WALK_SPEED;
    this.vy = 0;

    this.state       = ENEMY_STATE.WALKING;
    this.onGround    = false;
    this.deathTimer  = 0;

    // Walk animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 0.15; // seconds per frame

    this.active = true;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  /**
   * @param {number} dt
   * @param {import('./Platform.js').Platform[]} platforms
   */
  update(dt, platforms) {
    if (!this.active) return;

    if (this.state === ENEMY_STATE.SQUISH) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.active = false;
      return;
    }

    if (this.state === ENEMY_STATE.DEAD) {
      this.deathTimer -= dt;
      this.vy += 600 * dt; // gravity while flying off
      this.y  += this.vy * dt;
      if (this.deathTimer <= 0) this.active = false;
      return;
    }

    // Gravity
    this.vy += 700 * dt;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;

    this.onGround = false;
    this._resolveCollisions(platforms);

    // Reverse on wall (no platform below or hit wall)
    if (!this.onGround && this.vy > 0) {
      // will be corrected by collision
    }

    // Walk animation
    this.animTimer += dt;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  _resolveCollisions(platforms) {
    for (const p of platforms) {
      if (!this._overlaps(p)) continue;

      const overlapX = this._overlapAmount(this.x, this.w, p.x, p.w);
      const overlapY = this._overlapAmount(this.y, this.h, p.y, p.h);

      if (overlapY < overlapX) {
        if (this.vy > 0 && this.y + this.h - this.vy * 0.016 <= p.y + 1) {
          this.y       = p.y - this.h;
          this.vy      = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y  = p.y + p.h;
          this.vy = 0;
        }
      } else {
        // Wall hit — reverse direction
        if (this.vx < 0) {
          this.x  = p.x + p.w;
          this.vx = WALK_SPEED;
        } else {
          this.x  = p.x - this.w;
          this.vx = -WALK_SPEED;
        }
      }
    }
  }

  _overlaps(rect) {
    return (
      this.x < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  _overlapAmount(a, aw, b, bw) {
    return Math.min(a + aw, b + bw) - Math.max(a, b);
  }

  /**
   * Mario stomped on this enemy.
   */
  squish() {
    this.state      = ENEMY_STATE.SQUISH;
    this.deathTimer = 0.4;
    this.vy = 0;
    this.vx = 0;
  }

  /**
   * Enemy hit by fireball or star (fly off).
   * @param {number} direction — -1 = left, 1 = right
   */
  kill(direction = 1) {
    this.state      = ENEMY_STATE.DEAD;
    this.deathTimer = 1.5;
    this.vy = -300;
    this.vx = direction * 100;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Camera.js').Camera} camera
   */
  draw(ctx, camera) {
    if (!this.active) return;
    if (!camera.isVisible(this.x, this.y, this.w, this.h)) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);
    const w  = this.w;
    const h  = this.h;

    ctx.save();

    if (this.state === ENEMY_STATE.DEAD) {
      ctx.scale(1, -1);
      ctx.translate(0, -sy * 2 - h);
    }

    if (this.state === ENEMY_STATE.SQUISH) {
      // Squished flat
      ctx.translate(sx + w / 2, sy + h);
      ctx.scale(1.4, 0.3);
      ctx.translate(-(sx + w / 2), -(sy + h));
    }

    // Body
    ctx.fillStyle = '#A05000';
    ctx.fillRect(sx + 2, sy + h * 0.5, w - 4, h * 0.5);

    // Head
    ctx.fillStyle = '#C06000';
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h * 0.45, w * 0.48, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFF';
    const eyeOffX = this.animFrame === 0 ? 2 : 1;
    ctx.fillRect(sx + 4,       sy + h * 0.28, 8, 7);
    ctx.fillRect(sx + w - 12,  sy + h * 0.28, 8, 7);

    // Pupils — look left when walking left
    ctx.fillStyle = '#000';
    const pupilDir = this.vx < 0 ? -1 : 1;
    ctx.fillRect(sx + 4  + pupilDir, sy + h * 0.30, 4, 4);
    ctx.fillRect(sx + w - 12 + pupilDir, sy + h * 0.30, 4, 4);

    // Eyebrows (angry)
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 3,      sy + h * 0.24, 9, 2);
    ctx.fillRect(sx + w - 12, sy + h * 0.24, 9, 2);
    // Tilt towards center
    ctx.fillRect(sx + 3,           sy + h * 0.22, 2, 4);
    ctx.fillRect(sx + w - 5,       sy + h * 0.22, 2, 4);

    // Feet (walking animation)
    ctx.fillStyle = '#6B3200';
    const footOffset = this.animFrame === 0 ? 0 : 4;
    ctx.fillRect(sx + 2,               sy + h - 6, 10, 6);
    ctx.fillRect(sx + w - 12 + footOffset, sy + h - 6, 10, 6);

    ctx.restore();
  }
}
