// ══════════════════════════════════════════════════════════════════════════════
//  Boss.js — Bowser boss fight (stomp 3× to defeat)
// ══════════════════════════════════════════════════════════════════════════════

const BOSS_W     = 52;
const BOSS_H     = 52;
const BOSS_SPEED = 50;
const BOSS_HP    = 3;
const GRAVITY    = 900;

export const BOSS_STATE = {
  WALKING: 'walking',
  HIT:     'hit',
  DEAD:    'dead',
};

export class Boss {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    this.w  = BOSS_W;
    this.h  = BOSS_H;
    this.vx = -BOSS_SPEED;
    this.vy = 0;

    this.hp        = BOSS_HP;
    this.state     = BOSS_STATE.WALKING;
    this.hitTimer  = 0;
    this.deadTimer = 0;
    this.active    = true;

    this.animTimer = 0;
    this.animFrame = 0;

    this._startX = x; // patrol origin
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  update(dt, platforms) {
    if (!this.active) return;

    if (this.state === BOSS_STATE.DEAD) {
      this.deadTimer -= dt;
      this.vy += 700 * dt;
      this.y  += this.vy * dt;
      if (this.deadTimer <= 0) this.active = false;
      return;
    }

    if (this.state === BOSS_STATE.HIT) {
      this.hitTimer -= dt;
      this.vy += GRAVITY * dt;
      this.y  += this.vy * dt;
      this._resolveCollisions(platforms);
      if (this.hitTimer <= 0) this.state = BOSS_STATE.WALKING;
      return;
    }

    // Gravity + movement
    this.vy += GRAVITY * dt;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;

    this._resolveCollisions(platforms);

    // Patrol back and forth 180px
    if (this.x < this._startX - 180) this.vx =  BOSS_SPEED;
    if (this.x > this._startX + 10)  this.vx = -BOSS_SPEED;

    // Walk animation
    this.animTimer += dt;
    if (this.animTimer >= 0.22) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  /**
   * Mario stomped on Bowser. Returns true if Bowser was damaged.
   */
  takeDamage() {
    if (this.state === BOSS_STATE.HIT || this.state === BOSS_STATE.DEAD) return false;
    this.hp--;
    this.vy = -340; // bounce up when hit
    if (this.hp <= 0) {
      this.state     = BOSS_STATE.DEAD;
      this.deadTimer = 1.5;
      this.vx        = 80;
    } else {
      this.state    = BOSS_STATE.HIT;
      this.hitTimer = 1.4; // invincibility after hit
    }
    return true;
  }

  _resolveCollisions(platforms) {
    for (const p of platforms) {
      if (!this._overlaps(p)) continue;
      const oX = this._overlapAmt(this.x, this.w, p.x, p.w);
      const oY = this._overlapAmt(this.y, this.h, p.y, p.h);
      if (oY < oX) {
        if (this.vy >= 0 && this.y + this.h - this.vy * 0.016 <= p.y + 2) {
          this.y  = p.y - this.h;
          this.vy = 0;
        } else if (this.vy < 0) {
          this.y  = p.y + p.h;
          this.vy = 0;
        }
      } else {
        if (this.vx < 0) {
          this.x  = p.x + p.w;
          this.vx = BOSS_SPEED;
        } else {
          this.x  = p.x - this.w;
          this.vx = -BOSS_SPEED;
        }
      }
    }
  }

  _overlaps(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }
  _overlapAmt(a, aw, b, bw) {
    return Math.min(a + aw, b + bw) - Math.max(a, b);
  }

  draw(ctx, camera) {
    if (!this.active) return;
    if (!camera.isVisible(this.x, this.y - 30, this.w, this.h + 30)) return;

    // Flash when in hit state
    if (this.state === BOSS_STATE.HIT && Math.floor(this.hitTimer * 8) % 2 === 0) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);
    const w  = this.w;
    const h  = this.h;

    ctx.save();

    if (this.state === BOSS_STATE.DEAD) {
      ctx.translate(sx + w / 2, sy + h / 2);
      ctx.rotate(Math.PI);
      ctx.translate(-(sx + w / 2), -(sy + h / 2));
    }

    // ── Shell / body (dark green) ───────────────────────────────────────────
    ctx.fillStyle = '#1e7a0a';
    ctx.fillRect(sx + 6, sy + h * 0.48, w - 12, h * 0.52);

    // ── Belly (yellow-tan) ──────────────────────────────────────────────────
    ctx.fillStyle = '#d4a000';
    ctx.fillRect(sx + 12, sy + h * 0.54, w - 24, h * 0.38);

    // ── Head ───────────────────────────────────────────────────────────────
    ctx.fillStyle = '#228a10';
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h * 0.42, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 3 Spikes on top (yellow) ────────────────────────────────────────────
    ctx.fillStyle = '#e8b800';
    for (let i = 0; i < 3; i++) {
      const spX = sx + 10 + i * 14;
      ctx.beginPath();
      ctx.moveTo(spX,     sy + Math.round(h * 0.20));
      ctx.lineTo(spX + 8, sy + Math.round(h * 0.20));
      ctx.lineTo(spX + 4, sy - 4);
      ctx.closePath();
      ctx.fill();
    }

    // ── Eyes (red sclera) ──────────────────────────────────────────────────
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(sx + 8,      sy + Math.round(h * 0.26), 11, 9);
    ctx.fillRect(sx + w - 19, sy + Math.round(h * 0.26), 11, 9);

    // ── Pupils ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 10, sy + Math.round(h * 0.28), 5, 5);
    ctx.fillRect(sx + w - 17, sy + Math.round(h * 0.28), 5, 5);

    // ── Angry eyebrows ──────────────────────────────────────────────────────
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 6,      sy + Math.round(h * 0.20), 14, 3);
    ctx.fillRect(sx + w - 20, sy + Math.round(h * 0.20), 14, 3);
    // Tilt inward
    ctx.fillRect(sx + 6,      sy + Math.round(h * 0.18), 3, 5);
    ctx.fillRect(sx + w - 9,  sy + Math.round(h * 0.18), 3, 5);

    // ── Claws / feet (yellow) ───────────────────────────────────────────────
    ctx.fillStyle = '#d4a000';
    const foot = this.animFrame === 0 ? 2 : -2;
    ctx.fillRect(sx,          sy + h - 6,        16, 8);
    ctx.fillRect(sx + w - 16, sy + h - 6 + foot, 16, 8);
    // Claw tips (white)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx + 1 + i * 5,      sy + h + 2,        3, 3);
      ctx.fillRect(sx + w - 15 + i * 5, sy + h - 4 + foot, 3, 3);
    }

    // ── Shell spikes ring (sides) ────────────────────────────────────────────
    ctx.fillStyle = '#e8b800';
    const spikeY = sy + Math.round(h * 0.60);
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(sx - 4 + i * (w + 2), spikeY,      6, 10);
    }

    // ── HP bar ──────────────────────────────────────────────────────────────
    const barW = w + 6;
    const barX = sx - 3;
    const barY = sy - 22;
    const barH = 7;
    ctx.fillStyle = '#000';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#550000';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#00dd00';
    ctx.fillRect(barX, barY, Math.round(barW * this.hp / BOSS_HP), barH);

    // ── "BOWSER" label ───────────────────────────────────────────────────────
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('BOWSER', sx + w / 2, barY - 2);

    ctx.restore();
  }
}
