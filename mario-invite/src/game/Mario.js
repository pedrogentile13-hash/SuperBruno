// ══════════════════════════════════════════════════════════════════════════════
//  Mario.js — Auto-runner (runs right automatically, player only jumps)
// ══════════════════════════════════════════════════════════════════════════════

export const MARIO_STATE = {
  RUNNING: 'running',
  JUMPING: 'jumping',
  FALLING: 'falling',
  DEAD:    'dead',
  WIN:     'win',
};

const MARIO_W   = 28;
const MARIO_H   = 32;
const GRAVITY   = 860;
const JUMP_VY   = -380;
const RUN_SPEED = 190; // always auto-runs right
const DEAD_BOUNCE = -460;

export class Mario {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = MARIO_W;
    this.h = MARIO_H;

    this.vx = RUN_SPEED;
    this.vy = 0;

    this.state    = MARIO_STATE.RUNNING;
    this.onGround = false;

    this.invincible      = false;
    this.invincibleTimer = 0;
    this.deathTimer      = 0;

    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 0.1;

    // Jump feel: buffer + coyote
    this.jumpBufferTimer = 0;
    this.jumpBufferTime  = 0.15;
    this.coyoteTimer     = 0;
    this.coyoteTime      = 0.12;
    this.hasJumped       = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  /** @param {{ jump: boolean }} input */
  update(input, dt, platforms) {
    if (this.state === MARIO_STATE.DEAD) {
      this.vy = Math.min(this.vy + GRAVITY * dt, 700);
      this.y += this.vy * dt;
      this.deathTimer -= dt;
      return;
    }
    if (this.state === MARIO_STATE.WIN) return;

    // Auto-run: always move right
    this.vx = RUN_SPEED;

    // Jump buffer
    if (input.jump) this.jumpBufferTimer = this.jumpBufferTime;
    else            this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    // Coyote time
    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
      this.hasJumped   = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.hasJumped) {
      this.vy = JUMP_VY;
      this.jumpBufferTimer = 0;
      this.coyoteTimer     = 0;
      this.hasJumped       = true;
      this.onGround        = false;
    }

    // Cut jump short on release
    if (!input.jump && this.vy < -160 && this.hasJumped) {
      this.vy += 480 * dt;
    }

    // Gravity + move
    this.vy = Math.min(this.vy + GRAVITY * dt, 700);
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Collisions
    this.onGround = false;
    for (const p of platforms) {
      if (!this._overlaps(p)) continue;
      const ox = this._overlapAmt(this.x, this.w, p.x, p.w);
      const oy = this._overlapAmt(this.y, this.h, p.y, p.h);
      if (oy <= ox) {
        if (this.vy >= 0 && this.y + this.h - this.vy * 0.05 <= p.y + 2) {
          this.y = p.y - this.h; this.vy = 0; this.onGround = true;
        } else if (this.vy < 0) {
          this.y = p.y + p.h; this.vy = 40;
          if (p.type === 'question' && !p.hit) { p.hit = true; p.hitAnim = 0.15; }
        }
      } else {
        // Wall — hop over (just bump vx back to 0, next frame resets)
        this.x = p.x - this.w;
      }
    }

    // Update state
    if      (this.vy < -10)                   this.state = MARIO_STATE.JUMPING;
    else if (this.vy >  10 && !this.onGround) this.state = MARIO_STATE.FALLING;
    else                                       this.state = MARIO_STATE.RUNNING;

    // Walk animation
    if (this.onGround) {
      this.animTimer += dt;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }
    }

    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }
  }

  _overlaps(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  _overlapAmt(a, aw, b, bw) {
    return Math.min(a + aw, b + bw) - Math.max(a, b);
  }

  die() {
    if (this.invincible || this.state === MARIO_STATE.DEAD) return;
    this.state      = MARIO_STATE.DEAD;
    this.vy         = DEAD_BOUNCE;
    this.vx         = 0;
    this.deathTimer = 2.0;
  }

  bounce() {
    this.vy       = -250;
    this.onGround = false;
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, this.w, this.h)) return;
    if (this.invincible && Math.floor(Date.now() / 80) % 2 === 0) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);
    ctx.save();

    if (this.state === MARIO_STATE.DEAD) {
      ctx.translate(sx + this.w / 2, sy + this.h / 2);
      ctx.rotate(Math.PI);
      ctx.translate(-(sx + this.w / 2), -(sy + this.h / 2));
    }

    this._drawSprite(ctx, sx, sy);
    ctx.restore();
  }

  _drawSprite(ctx, sx, sy) {
    const w = this.w, h = this.h;
    const jumping = this.state === MARIO_STATE.JUMPING || this.state === MARIO_STATE.FALLING;
    const f = this.animFrame;

    // Hat
    ctx.fillStyle = '#E52521';
    ctx.fillRect(sx + 2, sy, w - 4, 8);
    ctx.fillRect(sx,     sy + 5, w, 4);
    // Face
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(sx + 4, sy + 9, w - 8, 10);
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + w - 10, sy + 10, 4, 4);
    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(sx + 4, sy + 17, w - 8, 3);
    // Body
    ctx.fillStyle = '#0000E5';
    ctx.fillRect(sx + 2, sy + 19, w - 4, h - 22);
    ctx.fillStyle = '#E52521';
    ctx.fillRect(sx + 4, sy + 19, w - 8, 8);
    ctx.fillStyle = '#FBD000';
    ctx.fillRect(sx + 4, sy + 20, 4, 3);
    ctx.fillRect(sx + w - 8, sy + 20, 4, 3);

    // Legs
    const lL = jumping ? 0 : (f === 1 ? -3 : f === 2 ? 3 : 0);
    const lR = jumping ? 0 : (f === 1 ?  3 : f === 2 ? -3 : 0);
    ctx.fillStyle = '#0000E5';
    ctx.fillRect(sx + 4,      sy + h - 12 + lL, 9, 8);
    ctx.fillRect(sx + w - 13, sy + h - 12 + lR, 9, 8);
    ctx.fillStyle = '#6B3200';
    ctx.fillRect(sx + 2,      sy + h - 8 + lL, 11, 8);
    ctx.fillRect(sx + w - 13, sy + h - 8 + lR, 11, 8);
  }
}
