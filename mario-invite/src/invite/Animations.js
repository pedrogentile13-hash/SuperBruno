// ══════════════════════════════════════════════════════════════════════════════
//  Animations.js — Floating coins, stars, clouds, mushrooms (CSS + JS)
// ══════════════════════════════════════════════════════════════════════════════

export class Animations {
  constructor() {
    this._floatingCoinsEl = document.getElementById('floating-coins');
    this._starsEl         = document.getElementById('stars-container');
    this._cloudsEl        = document.getElementById('clouds-layer');
    this._mushroomRow     = document.getElementById('mushroom-row');

    this._coinIntervals = [];
    this._running = false;
  }

  /**
   * Start all idle animations.
   */
  start() {
    if (this._running) return;
    this._running = true;

    this._createStars(20);
    this._createClouds(5);
    this._startFloatingCoins();
  }

  stop() {
    this._running = false;
    for (const id of this._coinIntervals) clearInterval(id);
    this._coinIntervals = [];
  }

  // ── Stars ──────────────────────────────────────────────────────────────────

  _createStars(count) {
    const container = this._starsEl;
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      const x    = Math.random() * 100;
      const y    = Math.random() * 55; // top 55% = sky
      const dur  = 1.5 + Math.random() * 2;
      const delay = Math.random() * 3;

      star.style.left    = `${x}%`;
      star.style.top     = `${y}%`;
      star.style.setProperty('--duration', `${dur}s`);
      star.style.setProperty('--delay',    `${delay}s`);

      // Vary size slightly
      const size = 4 + Math.floor(Math.random() * 5);
      star.style.width  = `${size}px`;
      star.style.height = `${size}px`;

      container.appendChild(star);
    }
  }

  // ── Clouds ─────────────────────────────────────────────────────────────────

  _createClouds(count) {
    const container = this._cloudsEl;
    if (!container) return;

    container.innerHTML = '';

    const cloudData = [
      { width: 90,  height: 45 },
      { width: 70,  height: 35 },
      { width: 110, height: 55 },
      { width: 60,  height: 30 },
      { width: 80,  height: 40 },
    ];

    for (let i = 0; i < count; i++) {
      const d     = cloudData[i % cloudData.length];
      const cloud = document.createElement('div');
      cloud.className = 'cloud';

      const y     = 5 + Math.random() * 45;
      const speed = 15 + Math.random() * 25;
      const delay = -(Math.random() * speed); // start mid-way across

      cloud.style.width   = `${d.width}px`;
      cloud.style.height  = `${d.height}px`;
      cloud.style.top     = `${y}%`;
      cloud.style.setProperty('--speed', `${speed}s`);
      cloud.style.setProperty('--delay', `${delay}s`);
      cloud.style.borderRadius = '50%';
      cloud.style.boxShadow    = `${d.width * 0.3}px -${d.height * 0.3}px 0 ${d.width * 0.25}px rgba(255,255,255,0.9)`;

      container.appendChild(cloud);
    }
  }

  // ── Floating Coins ─────────────────────────────────────────────────────────

  _startFloatingCoins() {
    const container = this._floatingCoinsEl;
    if (!container) return;

    const coinEmojis = ['🪙', '⭐', '🍄', '🪙', '🌟'];

    const spawnCoin = () => {
      if (!this._running) return;

      const el = document.createElement('div');
      el.className = 'f-coin';

      // Place on left or right side
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const x    = side === 'left'
        ? 2 + Math.random() * 12
        : 88 + Math.random() * 10;

      const y   = 20 + Math.random() * 65; // % from top
      const dur = 3 + Math.random() * 3;
      const del = Math.random() * 2;
      const emoji = coinEmojis[Math.floor(Math.random() * coinEmojis.length)];

      el.textContent = emoji;
      el.style.left  = `${x}%`;
      el.style.top   = `${y}%`;
      el.style.setProperty('--dur',   `${dur}s`);
      el.style.setProperty('--delay', `${del}s`);

      container.appendChild(el);

      // Remove after a few cycles
      setTimeout(() => {
        el.remove();
      }, (dur + del + 0.5) * 3000);
    };

    // Initial batch
    for (let i = 0; i < 8; i++) spawnCoin();

    // Continuous spawn
    const id = setInterval(() => {
      if (!this._running) return;
      spawnCoin();
    }, 2500);

    this._coinIntervals.push(id);
  }

  // ── Mushroom row entrance animation ─────────────────────────────────────────

  animateMushroomEntrance() {
    if (!this._mushroomRow) return;
    const mushrooms = this._mushroomRow.querySelectorAll('.mushroom');
    mushrooms.forEach((m, i) => {
      m.style.opacity   = '0';
      m.style.transform = 'scale(0)';
      setTimeout(() => {
        m.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        m.style.opacity    = '1';
        m.style.transform  = '';
      }, i * 200);
    });
  }
}
