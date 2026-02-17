// ══════════════════════════════════════════════════════════════════════════════
//  Modal.js — "INFORMAÇÕES" pop-up styled as Mario Kart PAUSE screen
// ══════════════════════════════════════════════════════════════════════════════

import { PARTY_CONFIG } from '../config/party.js';

export class Modal {
  /**
   * @param {import('../audio/AudioEngine.js').AudioEngine} audio
   */
  constructor(audio) {
    this._audio   = audio;
    this._overlay = document.getElementById('info-modal');
    this._box     = this._overlay?.querySelector('.modal-box');

    this._bindEvents();
  }

  open() {
    if (!this._overlay) return;
    this._overlay.classList.remove('hidden');
    this._overlay.setAttribute('aria-hidden', 'false');
    this._audio?.playSFX('pause');

    // Trap focus
    const closeBtn = document.getElementById('modal-close');
    closeBtn?.focus();
  }

  close() {
    if (!this._overlay) return;
    this._overlay.classList.add('hidden');
    this._overlay.setAttribute('aria-hidden', 'true');
  }

  isOpen() {
    return this._overlay && !this._overlay.classList.contains('hidden');
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _bindEvents() {
    if (!this._overlay) return;

    // Close buttons
    const closeIds = ['modal-close', 'modal-close-bottom'];
    for (const id of closeIds) {
      document.getElementById(id)?.addEventListener('click', () => this.close());
    }

    // WhatsApp button
    document.getElementById('modal-whatsapp')?.addEventListener('click', () => {
      this._openWhatsApp();
    });

    // Click outside to close
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  _openWhatsApp() {
    const { whatsapp, message } = PARTY_CONFIG.contact;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsapp}?text=${encoded}`, '_blank');
  }
}
