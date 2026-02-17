// ══════════════════════════════════════════════════════════════════════════════
//  HUD.js — Simplified HUD: SCORE + COINS (no timer pressure)
// ══════════════════════════════════════════════════════════════════════════════

export class HUD {
  constructor() {
    this._scoreEl = document.getElementById('hud-score');
    this._coinsEl = document.getElementById('hud-coins');
    this._timeEl  = document.getElementById('hud-time');

    this.score = 0;
    this.coins = 0;

    // Hide timer — no countdown in auto-runner
    if (this._timeEl) {
      this._timeEl.closest?.('.hud-section')?.style && (this._timeEl.closest('.hud-section').style.display = 'none');
    }

    this._render();
  }

  addScore(pts) { this.score += pts; this._render(); }
  addCoin()     { this.coins += 1;   this._render(); }

  // No-op kept for API compat with Game.js
  setLives() {}
  tickTime()  { return false; } // never times out
  update()    { this._render(); }

  _render() {
    if (this._scoreEl) this._scoreEl.textContent = String(this.score).padStart(6, '0');
    if (this._coinsEl) this._coinsEl.textContent = `×${String(this.coins).padStart(2, '0')}`;
  }
}
