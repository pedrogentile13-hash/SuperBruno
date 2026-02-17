// ══════════════════════════════════════════════════════════════════════════════
//  Camera.js — Horizontal scroll camera that follows Mario
// ══════════════════════════════════════════════════════════════════════════════

export class Camera {
  constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.x = 0;
    this.y = 0;
    this.width  = canvasWidth;
    this.height = canvasHeight;
    this.worldWidth  = worldWidth;
    this.worldHeight = worldHeight;

    // Smoothing factor (0 = instant, 1 = never moves)
    this.smoothing = 0.12;

    // Target X center offset: keep Mario at 30% from left
    this.targetOffsetRatio = 0.3;
  }

  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  resize(canvasWidth, canvasHeight) {
    this.width  = canvasWidth;
    this.height = canvasHeight;
  }

  /**
   * Update camera position to smoothly follow the target entity.
   * @param {{ x: number, width: number }} target
   * @param {number} dt — delta time in seconds (unused but kept for API consistency)
   */
  update(target, dt) {
    const desiredX = target.x - this.width * this.targetOffsetRatio;

    // Smooth lerp
    this.x += (desiredX - this.x) * this.smoothing;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
    this.y = 0;
  }

  /**
   * Apply camera transform to canvas context.
   * @param {CanvasRenderingContext2D} ctx
   */
  applyTransform(ctx) {
    ctx.save();
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  /**
   * Restore canvas context from camera transform.
   * @param {CanvasRenderingContext2D} ctx
   */
  restoreTransform(ctx) {
    ctx.restore();
  }

  /**
   * Convert world X to screen X.
   * @param {number} worldX
   * @returns {number}
   */
  worldToScreenX(worldX) {
    return worldX - this.x;
  }

  /**
   * Convert world Y to screen Y.
   * @param {number} worldY
   * @returns {number}
   */
  worldToScreenY(worldY) {
    return worldY - this.y;
  }

  /**
   * Check if a world rectangle is within the camera viewport (with margin).
   * @param {number} wx
   * @param {number} wy
   * @param {number} ww
   * @param {number} wh
   * @param {number} [margin=64]
   * @returns {boolean}
   */
  isVisible(wx, wy, ww, wh, margin = 64) {
    return (
      wx + ww > this.x - margin &&
      wx       < this.x + this.width  + margin &&
      wy + wh  > this.y - margin &&
      wy        < this.y + this.height + margin
    );
  }
}
