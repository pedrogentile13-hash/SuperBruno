// ══════════════════════════════════════════════════════════════════════════════
//  Coin.js — Collectible coins
// ══════════════════════════════════════════════════════════════════════════════

export class Coin {
  /**
   * @param {number} x — world X center
   * @param {number} y — world Y center
   * @param {number} [size=20]
   */
  constructor(x, y, size = 20) {
    this.x = x;
    this.y = y;
    this.w = size;
    this.h = size;

    this.collected = false;

    // Idle animation
    this.animTimer = Math.random() * Math.PI * 2; // random phase
    this.baseY = y;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  /**
   * @param {number} dt — seconds
   */
  update(dt) {
    if (this.collected) return;
    this.animTimer += dt * 3;
    // Gentle hover
    this.y = this.baseY + Math.sin(this.animTimer) * 4;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Camera.js').Camera} camera
   */
  draw(ctx, camera) {
    if (this.collected) return;
    if (!camera.isVisible(this.x, this.y, this.w, this.h)) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y);
    const r  = this.w / 2;

    // Coin body
    ctx.fillStyle = '#FBD000';
    ctx.beginPath();
    ctx.arc(sx + r, sy + r, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = '#FFE840';
    ctx.beginPath();
    ctx.arc(sx + r - 2, sy + r - 2, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = '#C89800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx + r, sy + r, r - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Shine dot
    ctx.fillStyle = '#FFFFC0';
    ctx.beginPath();
    ctx.arc(sx + r - 4, sy + r - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * AABB collision check against a rect.
   * @param {{ x:number, y:number, w:number, h:number }} rect
   * @returns {boolean}
   */
  overlaps(rect) {
    if (this.collected) return false;
    return (
      this.x < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  collect() {
    this.collected = true;
  }
}

// ── Popup score label that floats up ─────────────────────────────────────────
export class ScorePopup {
  constructor(x, y, text, color = '#FBD000') {
    this.x     = x;
    this.y     = y;
    this.text  = text;
    this.color = color;
    this.life  = 1.0; // seconds
    this.vy    = -80; // pixels/second
    this.done  = false;
  }

  update(dt) {
    this.y    += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.done = true;
  }

  draw(ctx) {
    if (this.done) return;
    ctx.globalAlpha = Math.min(1, this.life * 2);
    ctx.fillStyle   = this.color;
    ctx.font        = '8px "Press Start 2P", monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(this.text, Math.round(this.x), Math.round(this.y));
    ctx.globalAlpha = 1;
  }
}
