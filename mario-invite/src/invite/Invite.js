// ══════════════════════════════════════════════════════════════════════════════
//  Invite.js — Main invite screen logic
// ══════════════════════════════════════════════════════════════════════════════

import { PARTY_CONFIG } from '../config/party.js';
import { Animations }   from './Animations.js';
import { Modal }        from './Modal.js';

export class Invite {
  /**
   * @param {import('../audio/AudioEngine.js').AudioEngine} audio
   */
  constructor(audio) {
    this._audio = audio;
    this._anim  = new Animations();
    this._modal = new Modal(audio);

    this._screen    = document.getElementById('invite-screen');
    this._infoBound = false;
  }

  /**
   * Show the invite screen and start all animations / typewriter sequence.
   */
  async show() {
    const screen = this._screen;
    if (!screen) return;

    screen.classList.remove('hidden');

    // Start background animations
    this._anim.start();

    // Bind action buttons
    this._bindButtons();

    // Run typewriter sequence with cascading delays
    await this._runTypewriter();

    // Mushroom entrance
    this._anim.animateMushroomEntrance();

    // Auto-start invite music
    await this._audio.playMusic('invite');
  }

  // ── Typewriter sequence ───────────────────────────────────────────────────

  async _runTypewriter() {
    const { birthday } = PARTY_CONFIG;

    const lines = [
      { id: 'info-player', valId: 'val-player', text: birthday.name.toUpperCase() },
      { id: 'info-level',  valId: 'val-level',  text: `${birthday.age} ANOS`        },
      { id: 'info-date',   valId: 'val-date',   text: birthday.date                 },
      { id: 'info-time',   valId: 'val-time',   text: birthday.time                 },
      { id: 'info-local',  valId: 'val-local',  text: birthday.location.label.toUpperCase() },
    ];

    for (let i = 0; i < lines.length; i++) {
      const { id, valId, text } = lines[i];
      const lineEl  = document.getElementById(id);
      const valueEl = document.getElementById(valId);

      if (!lineEl || !valueEl) continue;

      // Slide in the line
      await this._delay(i === 0 ? 400 : 200);
      lineEl.classList.add('visible');

      // Type the value
      await this._typeText(valueEl, text, 60);
    }
  }

  /**
   * Typewriter effect.
   * @param {HTMLElement} el
   * @param {string} text
   * @param {number} speed — ms per character
   */
  _typeText(el, text, speed = 60) {
    return new Promise((resolve) => {
      el.textContent = '';
      el.classList.add('typing');

      let i = 0;
      const tick = () => {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
          setTimeout(tick, speed + Math.random() * 20);
        } else {
          el.classList.remove('typing');
          resolve();
        }
      };
      tick();
    });
  }

  // ── Action buttons ────────────────────────────────────────────────────────

  _bindButtons() {
    if (this._infoBound) return;
    this._infoBound = true;

    // Confirm — opens Google Sites RSVP page
    document.getElementById('btn-confirm')?.addEventListener('click', () => {
      window.open('https://sites.google.com/view/bruno5anos?usp=sharing', '_blank');
    });

    // Decline — opens WhatsApp with a "cannot attend" message
    document.getElementById('btn-decline')?.addEventListener('click', () => {
      this._openWhatsAppDecline();
    });
  }

  _openWhatsAppDecline() {
    const { whatsapp } = PARTY_CONFIG.contact;
    const msg = 'Olá! Infelizmente não poderei ir ao aniversário do Bruno. 😢';
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${whatsapp}?text=${encoded}`, '_blank');
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
