// ══════════════════════════════════════════════════════════════════════════════
//  Mario.js — Player character
// ══════════════════════════════════════════════════════════════════════════════

import { TILE_SIZE } from './Platform.js';

export const MARIO_STATE = {
  IDLE:    'idle',
  RUNNING: 'running',
  JUMPING: 'jumping',
  FALLING: 'falling',
  DEAD:    'dead',
  WIN:     'win',
};

const MARIO_W  = 28;
const MARIO_H  = 32;
const GRAVITY  = 900;   // px/s²
const JUMP_VY  = -400;  // px/s (negative = up)
const RUN_SPEED = 180;  // px/s
const MAX_VX    = 220;
const DEAD_BOUNCE = -500;

export class Mario {
  /**
   * @param {number} x — spawn world X
   * @param {number} y — spawn world Y
   */
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.w    = MARIO_W;
    this.h    = MARIO_H;

    this.vx   = 0;
    this.vy   = 0;

    this.state     = MARIO_STATE.IDLE;
    this.onGround  = false;
    this.facingLeft = false;

    // Lives
    this.lives = 3;

    // Invincibility after hit
    this.invincible     = false;
    this.invincibleTimer = 0;

    // Death animation
    this.deathTimer = 0;
    this.deathStartY = y;

    // Walk animation
    this.animFrame  = 0;
    this.animTimer  = 0;
    this.animSpeed  = 0.1; // seconds per frame
    this.animFrames = [0, 1, 2]; // run cycle: 3 frames

    // Jump coyote time
    this.coyoteTimer   = 0;
    this.coyoteTime    = 0.1;
    this.jumpBufferTimer = 0;
    this.jumpBufferTime  = 0.12;
    this.hasJumped = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  /**
   * @param {object} input
   * @param {boolean} input.left
   * @param {boolean} input.right
   * @param {boolean} input.jump
   * @param {number} dt
   * @param {import('./Platform.js').Platform[]} platforms
   */
  update(input, dt, platforms) {
    if (this.state === MARIO_STATE.DEAD) {
      this._updateDeath(dt);
      return;
    }
    if (this.state === MARIO_STATE.WIN) return;

    // Horizontal movement
    const targetVx = input.right ? RUN_SPEED : input.left ? -RUN_SPEED : 0;
    const accel    = 900;

    if (targetVx !== 0) {
      this.vx += Math.sign(targetVx) * accel * dt;
      this.vx   = Math.max(-MAX_VX, Math.min(MAX_VX, this.vx));
      this.facingLeft = this.vx < 0;
    } else {
      // Friction
      const friction = this.onGround ? 1200 : 600;
      const decel = Math.min(Math.abs(this.vx), friction * dt);
      this.vx -= Math.sign(this.vx) * decel;
      if (Math.abs(this.vx) < 2) this.vx = 0;
    }

    // Jump input buffer
    if (input.jump) {
      this.jumpBufferTimer = this.jumpBufferTime;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Coyote time (can still jump briefly after walking off edge)
    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
      this.hasJumped   = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump
    const canJump = this.coyoteTimer > 0 && !this.hasJumped;
    if (this.jumpBufferTimer > 0 && canJump) {
      this.vy = JUMP_VY;
      this.jumpBufferTimer = 0;
      this.coyoteTimer     = 0;
      this.hasJumped       = true;
      this.onGround        = false;
    }

    // Variable jump height — release jump early = lower arc
    if (!input.jump && this.vy < -200 && this.hasJumped) {
      this.vy += 600 * dt; // dampen upward velocity quickly
    }

    // Gravity
    this.vy = Math.min(this.vy + GRAVITY * dt, 700);

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Platform collision
    this.onGround = false;
    this._resolveCollisions(platforms);

    // Keep in world (left wall)
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }

    // Update state
    if (this.vy < -10) {
      this.state = MARIO_STATE.JUMPING;
    } else if (this.vy > 10 && !this.onGround) {
      this.state = MARIO_STATE.FALLING;
    } else if (Math.abs(this.vx) > 10) {
      this.state = MARIO_STATE.RUNNING;
    } else {
      this.state = MARIO_STATE.IDLE;
    }

    // Animation
    if (this.state === MARIO_STATE.RUNNING) {
      this.animTimer += dt;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }
    } else {
      this.animFrame = 0;
    }

    // Invincibility blink
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }
  }

  _resolveCollisions(platforms) {
    for (const p of platforms) {
      if (!this._overlaps(p)) continue;

      const overlapX = this._overlapAmount(this.x, this.w, p.x, p.w);
      const overlapY = this._overlapAmount(this.y, this.h, p.y, p.h);

      if (overlapY <= overlapX) {
        // Vertical resolution
        if (this.vy >= 0 && this.y + this.h - this.vy * 0.05 <= p.y + 2) {
          // Landing on top
          this.y        = p.y - this.h;
          this.vy       = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          // Hitting ceiling
          this.y  = p.y + p.h;
          this.vy = 50;
          // Trigger question block
          if (p.type === 'question' && !p.hit) {
            p.hit      = true;
            p.hitAnim  = 0.15;
            p.coinSpent = true;
          }
        }
      } else {
        // Horizontal resolution
        if (this.vx > 0) {
          this.x  = p.x - this.w;
        } else if (this.vx < 0) {
          this.x  = p.x + p.w;
        }
        this.vx = 0;
      }
    }
  }

  _overlaps(rect) {
    return (
      this.x     < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y     < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  _overlapAmount(a, aw, b, bw) {
    return Math.min(a + aw, b + bw) - Math.max(a, b);
  }

  /**
   * Mario dies: play death bounce.
   */
  die() {
    if (this.invincible || this.state === MARIO_STATE.DEAD) return;
    this.state      = MARIO_STATE.DEAD;
    this.vy         = DEAD_BOUNCE;
    this.vx         = 0;
    this.deathTimer = 2.0;
    this.deathStartY = this.y;
    this.lives -= 1;
  }

  _updateDeath(dt) {
    this.vy = Math.min(this.vy + GRAVITY * dt, 700);
    this.y += this.vy * dt;
    this.deathTimer -= dt;
  }

  /**
   * Bounce after stomping an enemy.
   */
  bounce() {
    this.vy = -280;
    this.onGround = false;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Camera.js').Camera} camera
   */
  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, this.w, this.h)) return;

    // Invincibility blink
    if (this.invincible && Math.floor(Date.now() / 80) % 2 === 0) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);
    const w  = this.w;
    const h  = this.h;

    ctx.save();

    // Flip horizontally if facing left
    if (this.facingLeft) {
      ctx.translate(sx + w / 2, sy + h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(sx + w / 2), -(sy + h / 2));
    }

    if (this.state === MARIO_STATE.DEAD) {
      this._drawDead(ctx, sx, sy, w, h);
    } else {
      this._drawMario(ctx, sx, sy, w, h);
    }

    ctx.restore();
  }

  _drawMario(ctx, sx, sy, w, h) {
    // Hat
    ctx.fillStyle = '#E52521';
    ctx.fillRect(sx + 2, sy, w - 4, 8);
    ctx.fillRect(sx,     sy + 5, w, 4);

    // Face
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(sx + 4, sy + 9, w - 8, 10);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + w - 10, sy + 10, 4, 4);

    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(sx + 4, sy + 17, w - 8, 3);

    // Body (overalls)
    const isRunning  = this.state === MARIO_STATE.RUNNING;
    const isJumping  = this.state === MARIO_STATE.JUMPING || this.state === MARIO_STATE.FALLING;

    ctx.fillStyle = '#0000E5';
    ctx.fillRect(sx + 2, sy + 19, w - 4, h - 22);

    // Shirt
    ctx.fillStyle = '#E52521';
    ctx.fillRect(sx + 4, sy + 19, w - 8, 8);

    // Buckles
    ctx.fillStyle = '#FBD000';
    ctx.fillRect(sx + 4,     sy + 20, 4, 3);
    ctx.fillRect(sx + w - 8, sy + 20, 4, 3);

    // Legs/Shoes
    if (isJumping) {
      // Both feet kicked back
      ctx.fillStyle = '#0000E5';
      ctx.fillRect(sx + 4,     sy + h - 12, 9,  8);
      ctx.fillRect(sx + w - 13, sy + h - 12, 9, 8);
      ctx.fillStyle = '#6B3200';
      ctx.fillRect(sx + 2,     sy + h - 8, 11, 8);
      ctx.fillRect(sx + w - 13, sy + h - 8, 11, 8);
    } else if (isRunning) {
      // Alternating legs
      const f = this.animFrame;
      const leftY  = f === 0 ? 0 : f === 1 ? -3 : 3;
      const rightY = f === 0 ? 0 : f === 1 ? 3 : -3;
      ctx.fillStyle = '#0000E5';
      ctx.fillRect(sx + 4,     sy + h - 12 + leftY,  9, 8);
      ctx.fillRect(sx + w - 13, sy + h - 12 + rightY, 9, 8);
      ctx.fillStyle = '#6B3200';
      ctx.fillRect(sx + 2,     sy + h - 8 + leftY,  11, 8);
      ctx.fillRect(sx + w - 13, sy + h - 8 + rightY, 11, 8);
    } else {
      // Idle
      ctx.fillStyle = '#0000E5';
      ctx.fillRect(sx + 4,     sy + h - 12, 9,  9);
      ctx.fillRect(sx + w - 13, sy + h - 12, 9, 9);
      ctx.fillStyle = '#6B3200';
      ctx.fillRect(sx + 2,     sy + h - 6, 11, 6);
      ctx.fillRect(sx + w - 13, sy + h - 6, 11, 6);
    }
  }

  _drawDead(ctx, sx, sy, w, h) {
    // Simple dead sprite — flat and rotated
    ctx.translate(sx + w / 2, sy + h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(sx + w / 2), -(sy + h / 2));

    // Hat
    ctx.fillStyle = '#E52521';
    ctx.fillRect(sx + 2, sy, w - 4, 8);
    ctx.fillRect(sx, sy + 5, w, 4);

    // Face
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(sx + 4, sy + 9, w - 8, 10);

    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 6, sy + 12, 3, 3);
    ctx.fillRect(sx + w - 9, sy + 12, 3, 3);

    // X eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 5, sy + 11, 6, 2);
    ctx.fillRect(sx + 7, sy + 9, 2, 6);
    ctx.fillRect(sx + w - 11, sy + 11, 6, 2);
    ctx.fillRect(sx + w - 9, sy + 9, 2, 6);
  }
}
