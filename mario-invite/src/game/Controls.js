// ══════════════════════════════════════════════════════════════════════════════
//  Controls.js — Keyboard + Touch input manager
// ══════════════════════════════════════════════════════════════════════════════

export class Controls {
  constructor() {
    // Current input state
    this.left  = false;
    this.right = false;
    this.jump  = false;

    this._prevJump = false; // for edge detection

    this._bindKeyboard();
    this._bindTouch();
  }

  /** Returns true only on the frame jump was first pressed. */
  get jumpPressed() {
    return this.jump && !this._prevJump;
  }

  /** Call at end of each update frame. */
  lateUpdate() {
    this._prevJump = this.jump;
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  _bindKeyboard() {
    const keyMap = {
      ArrowLeft:  'left',
      KeyA:       'left',
      ArrowRight: 'right',
      KeyD:       'right',
      ArrowUp:    'jump',
      KeyW:       'jump',
      Space:      'jump',
      KeyZ:       'jump',
    };

    window.addEventListener('keydown', (e) => {
      const action = keyMap[e.code];
      if (action) {
        this[action] = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const action = keyMap[e.code];
      if (action) {
        this[action] = false;
      }
    });
  }

  // ── Touch ──────────────────────────────────────────────────────────────────

  _bindTouch() {
    const btnLeft  = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump  = document.getElementById('btn-jump');

    if (!btnLeft || !btnRight || !btnJump) return;

    this._bindButton(btnLeft,  'left');
    this._bindButton(btnRight, 'right');
    this._bindButton(btnJump,  'jump');
  }

  _bindButton(el, action) {
    const onStart = (e) => {
      e.preventDefault();
      this[action] = true;
      el.classList.add('pressed');
    };

    const onEnd = (e) => {
      e.preventDefault();
      this[action] = false;
      el.classList.remove('pressed');
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchend',   onEnd,   { passive: false });
    el.addEventListener('touchcancel',onEnd,   { passive: false });

    // Mouse fallback for desktop testing
    el.addEventListener('mousedown', onStart);
    el.addEventListener('mouseup',   onEnd);
    el.addEventListener('mouseleave',onEnd);
  }

  /** Reset all inputs (e.g., on game over). */
  reset() {
    this.left  = false;
    this.right = false;
    this.jump  = false;
    this._prevJump = false;
  }
}
