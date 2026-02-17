// ══════════════════════════════════════════════════════════════════════════════
//  HUD.js — Updates the HTML HUD overlay (score, coins, lives, time)
// ══════════════════════════════════════════════════════════════════════════════

export class HUD {
  constructor() {
    this._score  = document.getElementById('hud-score');
    this._coins  = document.getElementById('hud-coins');
    this._time   = document.getElementById('hud-time');
    this._lives  = document.getElementById('hud-lives');

    this.score  = 0;
    this.coins  = 0;
    this.lives  = 3;
    this.time   = 400;

    this._dirty = true;
    this._render();
  }

  /** Add points and update display. */
  addScore(points) {
    this.score += points;
    this._dirty = true;
  }

  /** Collect a coin. */
  addCoin() {
    this.coins += 1;
    this._dirty = true;
  }

  /** Set remaining lives. */
  setLives(n) {
    this.lives = n;
    this._dirty = true;
  }

  /**
   * Tick the countdown timer.
   * @param {number} dt — seconds
   * @returns {boolean} true if time ran out
   */
  tickTime(dt) {
    this.time = Math.max(0, this.time - dt * 0.85);
    this._dirty = true;
    return this.time <= 0;
  }

  /**
   * Sync display if dirty.
   */
  update() {
    if (!this._dirty) return;
    this._render();
    this._dirty = false;
  }

  _render() {
    if (this._score) this._score.textContent = String(this.score).padStart(6, '0');
    if (this._coins) this._coins.textContent = `×${String(this.coins).padStart(2, '0')}`;
    if (this._time)  this._time.textContent  = String(Math.ceil(this.time)).padStart(3, '0');
    if (this._lives) this._lives.textContent = String(this.lives);

    // Warn when time is low
    if (this._time) {
      this._time.style.color = this.time < 100 ? '#E52521' : '#ffffff';
    }
  }
}
