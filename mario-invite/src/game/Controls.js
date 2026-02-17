// ══════════════════════════════════════════════════════════════════════════════
//  Controls.js — Auto-runner: only JUMP input (tap anywhere / Space / Up)
// ══════════════════════════════════════════════════════════════════════════════

export class Controls {
  constructor() {
    this.jump      = false;
    this.left      = false; // unused in auto-runner, kept for API compat
    this.right     = false;
    this._prevJump = false;

    this._bindKeyboard();
    this._bindTouch();
  }

  lateUpdate() {
    this._prevJump = this.jump;
  }

  reset() {
    this.jump = false;
    this.left = false;
    this.right = false;
    this._prevJump = false;
  }

  // ── Keyboard — any key that makes sense = jump ─────────────────────────────
  _bindKeyboard() {
    const JUMP_KEYS = new Set(['Space','ArrowUp','ArrowRight','KeyW','KeyZ','Enter']);

    window.addEventListener('keydown', (e) => {
      if (JUMP_KEYS.has(e.code)) {
        this.jump = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (JUMP_KEYS.has(e.code)) {
        this.jump = false;
      }
    });
  }

  // ── Touch — tap the jump button OR anywhere on game screen ────────────────
  _bindTouch() {
    const btnJump   = document.getElementById('btn-jump');
    const gameScreen = document.getElementById('game-screen');

    // Tap anywhere on game screen = jump
    gameScreen?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jump = true;
    }, { passive: false });

    gameScreen?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.jump = false;
    }, { passive: false });

    gameScreen?.addEventListener('touchcancel', (e) => {
      this.jump = false;
    }, { passive: false });

    // Also bind the explicit button (for visual affordance)
    if (btnJump) {
      this._bindBtn(btnJump);
    }

    // Mouse click on game screen (desktop testing)
    gameScreen?.addEventListener('mousedown', () => { this.jump = true;  });
    gameScreen?.addEventListener('mouseup',   () => { this.jump = false; });
  }

  _bindBtn(el) {
    el.addEventListener('touchstart', (e) => { e.stopPropagation(); e.preventDefault(); this.jump = true;  el.classList.add('pressed');    }, { passive: false });
    el.addEventListener('touchend',   (e) => { e.stopPropagation(); e.preventDefault(); this.jump = false; el.classList.remove('pressed'); }, { passive: false });
    el.addEventListener('touchcancel',(e) => {                                           this.jump = false; el.classList.remove('pressed'); }, { passive: false });
    el.addEventListener('mousedown',  (e) => { e.stopPropagation(); this.jump = true;  el.classList.add('pressed');    });
    el.addEventListener('mouseup',    (e) => { e.stopPropagation(); this.jump = false; el.classList.remove('pressed'); });
    el.addEventListener('mouseleave', (e) => {                       this.jump = false; el.classList.remove('pressed'); });
  }
}
