// ══════════════════════════════════════════════════════════════════════════════
//  Transition.js — Curtain & screen transitions
// ══════════════════════════════════════════════════════════════════════════════

export class Transition {
  constructor() {
    this._curtain = document.getElementById('curtain');
  }

  /**
   * Animate game → invite:
   *  1. Wait for LEVEL CLEAR overlay to show (already visible)
   *  2. Curtain falls (black screen)
   *  3. Swap screens
   *  4. Curtain rises (fade out to invite)
   *
   * @param {() => void} onSwap — callback executed at peak of curtain (between screens)
   * @returns {Promise<void>}
   */
  async gameToInvite(onSwap) {
    // Step 1: Curtain falls
    await this._curtainDown();

    // Step 2: Swap content
    onSwap?.();

    // Small pause at black
    await this._delay(300);

    // Step 3: Curtain rises revealing invite
    await this._curtainUp();
  }

  /**
   * Fade in an element from opacity 0.
   * @param {HTMLElement} el
   * @param {number} durationMs
   */
  fadeIn(el, durationMs = 600) {
    el.style.opacity = '0';
    el.classList.remove('hidden');
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${durationMs}ms ease`;
      el.style.opacity = '1';
    });
  }

  /**
   * Fade out then hide.
   * @param {HTMLElement} el
   * @param {number} durationMs
   */
  async fadeOut(el, durationMs = 400) {
    el.style.transition = `opacity ${durationMs}ms ease`;
    el.style.opacity = '0';
    await this._delay(durationMs);
    el.classList.add('hidden');
    el.style.opacity = '';
    el.style.transition = '';
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _curtainDown() {
    return new Promise((resolve) => {
      const el = this._curtain;
      el.classList.remove('hidden', 'ascending');
      el.classList.add('descending');
      el.addEventListener('animationend', () => {
        el.classList.remove('descending');
        resolve();
      }, { once: true });
    });
  }

  _curtainUp() {
    return new Promise((resolve) => {
      const el = this._curtain;
      el.classList.remove('descending');
      el.classList.add('ascending');
      el.addEventListener('animationend', () => {
        el.classList.add('hidden');
        el.classList.remove('ascending');
        resolve();
      }, { once: true });
    });
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
