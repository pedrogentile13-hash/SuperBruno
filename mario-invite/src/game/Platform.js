// ══════════════════════════════════════════════════════════════════════════════
//  Platform.js — Platforms and block tiles
// ══════════════════════════════════════════════════════════════════════════════

export const TILE_SIZE = 32;

/**
 * Platform types
 */
export const PLATFORM_TYPE = {
  GROUND:   'ground',
  BRICK:    'brick',
  QUESTION: 'question',
  PIPE:     'pipe',
  SOLID:    'solid',
};

export class Platform {
  /**
   * @param {number} x — world X in pixels
   * @param {number} y — world Y in pixels
   * @param {number} w — width  in pixels
   * @param {number} h — height in pixels
   * @param {string} type — PLATFORM_TYPE constant
   */
  constructor(x, y, w, h, type = PLATFORM_TYPE.SOLID) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;

    // Used when Mario hits a question block from below
    this.hit       = false;
    this.hitAnim   = 0;   // bounce timer
    this.coinSpent = false;
  }

  update(dt) {
    if (this.hitAnim > 0) {
      this.hitAnim -= dt;
    }
  }

  /**
   * Draw this platform.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Camera.js').Camera} camera
   */
  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, this.w, this.h)) return;

    const sx = Math.round(this.x);
    const sy = Math.round(this.y + (this.hitAnim > 0 ? -6 * Math.sin(this.hitAnim * Math.PI / 0.15) : 0));

    switch (this.type) {
      case PLATFORM_TYPE.GROUND:
        this._drawGround(ctx, sx, sy);
        break;
      case PLATFORM_TYPE.BRICK:
        this._drawBrick(ctx, sx, sy);
        break;
      case PLATFORM_TYPE.QUESTION:
        this._drawQuestion(ctx, sx, sy);
        break;
      case PLATFORM_TYPE.PIPE:
        this._drawPipe(ctx, sx, sy);
        break;
      default:
        this._drawSolid(ctx, sx, sy);
    }
  }

  /* ── Private draw helpers ─────────────────────────────────────────────────── */

  _drawGround(ctx, sx, sy) {
    const cols = Math.ceil(this.w / TILE_SIZE);
    const rows = Math.ceil(this.h / TILE_SIZE);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const tx = sx + c * TILE_SIZE;
        const ty = sy + r * TILE_SIZE;
        const tw = Math.min(TILE_SIZE, this.w - c * TILE_SIZE);
        const th = Math.min(TILE_SIZE, this.h - r * TILE_SIZE);

        // Base
        ctx.fillStyle = r === 0 ? '#C84B0C' : '#A03800';
        ctx.fillRect(tx, ty, tw, th);

        // Top edge highlights (top row)
        if (r === 0) {
          ctx.fillStyle = '#E87010';
          ctx.fillRect(tx, ty, tw, 4);
        }

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, th - 1);
      }
    }
    // Grass cap on top row
    ctx.fillStyle = '#00A800';
    ctx.fillRect(sx, sy, this.w, 6);
    ctx.fillStyle = '#008000';
    ctx.fillRect(sx, sy + 6, this.w, 3);
  }

  _drawBrick(ctx, sx, sy) {
    const cols = Math.ceil(this.w / TILE_SIZE);
    const rows = Math.ceil(this.h / TILE_SIZE);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const tx = sx + c * TILE_SIZE;
        const ty = sy + r * TILE_SIZE;
        const tw = Math.min(TILE_SIZE, this.w - c * TILE_SIZE);
        const th = Math.min(TILE_SIZE, this.h - r * TILE_SIZE);

        ctx.fillStyle = '#C84B0C';
        ctx.fillRect(tx, ty, tw, th);
        // Highlight
        ctx.fillStyle = '#E87010';
        ctx.fillRect(tx, ty, tw, 4);
        ctx.fillRect(tx, ty, 4, th);
        // Shadow
        ctx.fillStyle = '#8B3000';
        ctx.fillRect(tx, ty + th - 4, tw, 4);
        ctx.fillRect(tx + tw - 4, ty, 4, th);
        // Mortar lines
        ctx.fillStyle = '#8B3000';
        if (r % 2 === 0) {
          ctx.fillRect(tx + TILE_SIZE * 0.5, ty + TILE_SIZE * 0.5, tw * 0.5, 2);
          ctx.fillRect(tx, ty + TILE_SIZE * 0.5, tw * 0.25, 2);
        } else {
          ctx.fillRect(tx, ty + TILE_SIZE * 0.5, tw * 0.5, 2);
        }
        ctx.strokeStyle = '#8B3000';
        ctx.lineWidth = 2;
        ctx.strokeRect(tx + 1, ty + 1, tw - 2, th - 2);
      }
    }
  }

  _drawQuestion(ctx, sx, sy) {
    const w = this.w;
    const h = this.h;

    if (this.hit && !this.coinSpent) {
      // Used block
      ctx.fillStyle = '#888';
      ctx.fillRect(sx, sy, w, h);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(sx, sy, w, 4);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, w - 2, h - 2);
    } else {
      // Active question block
      ctx.fillStyle = '#FBD000';
      ctx.fillRect(sx, sy, w, h);
      ctx.fillStyle = '#FFE840';
      ctx.fillRect(sx, sy, w, 4);
      ctx.fillStyle = '#C89800';
      ctx.fillRect(sx, sy + h - 4, w, 4);
      ctx.strokeStyle = '#8B6000';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, w - 2, h - 2);
      // '?' mark
      ctx.fillStyle = '#8B6000';
      ctx.font = `bold ${Math.round(h * 0.6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', sx + w / 2, sy + h / 2);
    }
  }

  _drawPipe(ctx, sx, sy) {
    const w = this.w;
    const h = this.h;

    // Pipe body
    ctx.fillStyle = '#00A800';
    ctx.fillRect(sx + 4, sy + TILE_SIZE, w - 8, h - TILE_SIZE);
    // Pipe left highlight
    ctx.fillStyle = '#00C800';
    ctx.fillRect(sx + 4, sy + TILE_SIZE, 8, h - TILE_SIZE);
    // Pipe shadow
    ctx.fillStyle = '#006000';
    ctx.fillRect(sx + w - 12, sy + TILE_SIZE, 8, h - TILE_SIZE);
    // Pipe head
    ctx.fillStyle = '#00C800';
    ctx.fillRect(sx, sy, w, TILE_SIZE);
    ctx.fillStyle = '#00E800';
    ctx.fillRect(sx, sy, w, 6);
    ctx.fillStyle = '#006000';
    ctx.fillRect(sx, sy + TILE_SIZE - 6, w, 6);
    // Border
    ctx.strokeStyle = '#004400';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 4.5, sy + TILE_SIZE + 0.5, w - 9, h - TILE_SIZE - 1);
    ctx.strokeRect(sx + 0.5, sy + 0.5, w - 1, TILE_SIZE - 1);
  }

  _drawSolid(ctx, sx, sy) {
    ctx.fillStyle = '#888';
    ctx.fillRect(sx, sy, this.w, this.h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, this.w - 2, this.h - 2);
  }
}
