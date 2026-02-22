// ══════════════════════════════════════════════════════════════════════════════
//  Game.js — Main game engine
// ══════════════════════════════════════════════════════════════════════════════

import { Mario, MARIO_STATE } from './Mario.js';
import { Camera }    from './Camera.js';
import { HUD }       from './HUD.js';
import { Controls }  from './Controls.js';
import { ScorePopup } from './Coin.js';
import { ENEMY_STATE } from './Enemy.js';
import { buildLevel, WORLD_WIDTH, WORLD_HEIGHT } from './LevelMap.js';
import { TILE_SIZE } from './Platform.js';

export const GAME_STATE = {
  PLAYING:     'playing',
  PAUSED:      'paused',
  LEVEL_CLEAR: 'level_clear',
  GAME_OVER:   'game_over',
};

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../audio/AudioEngine.js').AudioEngine} audio
   */
  constructor(canvas, audio) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.audio   = audio;

    this.state   = GAME_STATE.PLAYING;

    this.controls = new Controls();
    this.hud      = new HUD();

    // Level objects
    const level     = buildLevel();
    this.platforms  = level.platforms;
    this.enemies    = level.enemies;
    this.coins      = level.coins;

    // Mario spawn
    this.mario = new Mario(2 * TILE_SIZE, WORLD_HEIGHT - 4 * TILE_SIZE);
    this.mario.lives = 3;

    this.camera = new Camera(canvas.width, canvas.height, WORLD_WIDTH, WORLD_HEIGHT);

    this.popups = [];  // ScorePopup[]

    // Flag — player must touch it to win
    this._flag = { x: WORLD_WIDTH - 200, triggered: false };

    this._lastTime = 0;
    this._raf      = null;

    this._gameOverTimer   = 0;
    this._levelClearTimer = 0;
    this._respawnTimer    = 0;
    this._isRespawning    = false;

    // Background parallax layers
    this._bgOffset  = 0;
    this._skyOffset = 0;

    this._resize();
    this._bindResize();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  start() {
    this._raf = requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  reset() {
    this.stop();

    const level    = buildLevel();
    this.platforms = level.platforms;
    this.enemies   = level.enemies;
    this.coins     = level.coins;

    this.mario     = new Mario(2 * TILE_SIZE, WORLD_HEIGHT - 4 * TILE_SIZE);
    this.mario.lives = 3;

    this.camera = new Camera(
      this.canvas.width, this.canvas.height, WORLD_WIDTH, WORLD_HEIGHT
    );

    this.hud   = new HUD();
    this.popups = [];

    this._flag             = { x: WORLD_WIDTH - 200, triggered: false };

    this.state             = GAME_STATE.PLAYING;
    this._gameOverTimer    = 0;
    this._levelClearTimer  = 0;
    this._isRespawning     = false;
    this._respawnTimer     = 0;

    this.controls.reset();
    this.start();
  }

  // ── Main loop ───────────────────────────────────────────────────────────────

  _loop(timestamp) {
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;

    this._update(dt);
    this._draw();

    this._raf = requestAnimationFrame(this._loop.bind(this));
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  _update(dt) {
    if (this.state === GAME_STATE.PAUSED) return;

    // --- Respawn grace period after death ---
    if (this._isRespawning) {
      this._respawnTimer -= dt;
      if (this._respawnTimer <= 0) {
        this._isRespawning = false;
        this._respawn();
      }
      return;
    }

    // --- GAME OVER timer ---
    if (this.state === GAME_STATE.GAME_OVER) {
      this._gameOverTimer -= dt;
      if (this._gameOverTimer <= 0) {
        document.getElementById('game-over-overlay').classList.remove('hidden');
      }
      return;
    }

    // --- LEVEL CLEAR timer ---
    if (this.state === GAME_STATE.LEVEL_CLEAR) {
      this._levelClearTimer -= dt;
      if (this._levelClearTimer <= 0) {
        this._triggerWin();
      }
      return;
    }

    // --- Update platforms ---
    for (const p of this.platforms) p.update(dt);

    // --- Update Mario ---
    this.mario.update(this.controls, dt, this.platforms);
    this.controls.lateUpdate();

    // --- Fell into pit ---
    if (this.mario.y > WORLD_HEIGHT + 100 && this.mario.state !== MARIO_STATE.DEAD) {
      this._killMario();
    }

    // --- Handle death ---
    if (this.mario.state === MARIO_STATE.DEAD) {
      if (!this._isRespawning) {
        this._isRespawning  = true;
        this._respawnTimer  = 2.5;
      }
      this.camera.update(this.mario, dt);
      return;
    }

    // --- Update enemies ---
    for (const e of this.enemies) {
      e.update(dt, this.platforms);
    }

    // --- Check enemy collisions with Mario ---
    this._checkEnemyCollisions();

    // --- Flag collision — must touch the bandeira to win ---
    if (!this._flag.triggered && this.state === GAME_STATE.PLAYING) {
      const mCx = this.mario.x + this.mario.w / 2;
      if (mCx > this._flag.x && mCx < this._flag.x + 48) {
        this._flag.triggered = true;
        this.mario.state = MARIO_STATE.WIN;
        this.mario.vx    = 0;
        this.hud.addScore(2000);
        this.state            = GAME_STATE.LEVEL_CLEAR;
        this._levelClearTimer = 3.5;
        this.audio.playSFX('levelClear');
        this.audio.stopMusic();
        document.getElementById('level-clear-overlay').classList.remove('hidden');
        document.getElementById('level-clear-score').innerHTML =
          `SCORE: ${String(this.hud.score).padStart(6, '0')}<br>COINS: ×${String(this.hud.coins).padStart(2, '0')}`;
      }
    }

    // --- Check coin collisions ---
    for (const c of this.coins) {
      if (c.overlaps(this.mario)) {
        c.collect();
        this.hud.addCoin();
        this.hud.addScore(200);
        this.audio.playSFX('coin');
        this.popups.push(new ScorePopup(c.cx, c.y, '+200'));
      }
      c.update(dt);
    }

    // --- Update popups ---
    for (const p of this.popups) p.update(dt);
    this.popups = this.popups.filter(p => !p.done);

    // --- Camera ---
    this.camera.update(this.mario, dt);

    // --- HUD ---
    this.hud.setLives(this.mario.lives);
    this.hud.update();

    // --- BG scroll ---
    this._bgOffset  = this.camera.x * 0.5;
    this._skyOffset = this.camera.x * 0.2;
  }

  // ── Enemy / Mario collision ─────────────────────────────────────────────────

  _checkEnemyCollisions() {
    if (this.mario.invincible) return;

    for (const e of this.enemies) {
      if (!e.active || e.state !== ENEMY_STATE.WALKING) continue;

      const mx = this.mario.x, my = this.mario.y, mw = this.mario.w, mh = this.mario.h;
      const ex = e.x,         ey = e.y,         ew = e.w,         eh = e.h;

      const overlapping = mx < ex + ew && mx + mw > ex && my < ey + eh && my + mh > ey;
      if (!overlapping) continue;

      // Mario falls on enemy from above (stomp)
      const mBottom    = my + mh;
      const eTop       = ey;
      const mPrevBottom = mBottom - this.mario.vy * 0.016;

      if (this.mario.vy > 0 && mPrevBottom <= eTop + 8) {
        e.squish();
        this.mario.bounce();
        this.hud.addScore(100);
        this.audio.playSFX('stomp');
        this.popups.push(new ScorePopup(e.cx, e.y, '+100'));
      } else {
        // Mario hit from side
        if (!this.mario.invincible) {
          this._killMario();
        }
      }
    }
  }

  // ── Death / Respawn ─────────────────────────────────────────────────────────

  _killMario() {
    if (this.mario.state === MARIO_STATE.DEAD) return;
    this.mario.die();
    this.audio.playSFX('death');
    this.audio.stopMusic();
  }

  _respawn() {
    // Infinite retries — no game over, just restart from beginning
    this.mario = new Mario(2 * TILE_SIZE, WORLD_HEIGHT - 4 * TILE_SIZE);
    this.mario.invincible      = true;
    this.mario.invincibleTimer = 1.5;
    this.audio.playMusic('game');
  }

  _triggerWin() {
    document.dispatchEvent(new CustomEvent('LEVEL_COMPLETE', {
      detail: { score: this.hud.score, coins: this.hud.coins }
    }));
  }

  // ── Draw ────────────────────────────────────────────────────────────────────

  _draw() {
    const ctx    = this.ctx;
    const canvas = this.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background sky
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background clouds (parallax)
    this._drawBackground(ctx);

    // Apply camera transform
    this.camera.applyTransform(ctx);

    // Draw platforms
    for (const p of this.platforms) p.draw(ctx, this.camera);

    // Draw coins
    for (const c of this.coins) c.draw(ctx, this.camera);

    // Draw flag
    this._drawFlag(ctx);

    // Draw enemies
    for (const e of this.enemies) e.draw(ctx, this.camera);

    // Draw Mario
    this.mario.draw(ctx, this.camera);

    this.camera.restoreTransform(ctx);

    // Draw popups (screen space with camera offset)
    ctx.save();
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
    for (const p of this.popups) p.draw(ctx);
    ctx.restore();
  }

  _drawFlag(ctx) {
    const GY      = WORLD_HEIGHT - 2 * TILE_SIZE; // ground top Y
    const poleX   = this._flag.x + 4;             // pole center offset
    const poleH   = 160;
    const poleTop = GY - poleH;

    // Pole
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(poleX, poleTop, 6, poleH + 2 * TILE_SIZE);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(poleX, poleTop, 2, poleH + 2 * TILE_SIZE);

    // Flag banner (🏁 style — two colored blocks)
    const fw = 38, fh = 30;
    ctx.fillStyle = '#E52521';
    ctx.fillRect(poleX + 6, poleTop + 4, fw, fh / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(poleX + 6, poleTop + 4 + fh / 2, fw, fh / 2);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(poleX + 6, poleTop + 4, fw, fh);

    // Star on flag
    ctx.fillStyle = '#FBD000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', poleX + 6 + fw / 2, poleTop + 4 + fh / 2);
  }

  _drawBackground(ctx) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    grad.addColorStop(0,   '#5C94FC');
    grad.addColorStop(1,   '#87CEEB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Simple cloud shapes (parallax)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const clouds = [
      { x: 60,  y: 40, r: 24 },
      { x: 180, y: 30, r: 18 },
      { x: 320, y: 55, r: 30 },
      { x: 460, y: 25, r: 22 },
      { x: 600, y: 50, r: 20 },
    ];

    const bx = this._bgOffset % (W + 200);

    for (const c of clouds) {
      const cx = ((c.x - bx * 0.3) % (W + 150) + W + 150) % (W + 150) - 75;
      ctx.beginPath();
      ctx.arc(cx,       c.y,      c.r,       0, Math.PI * 2);
      ctx.arc(cx + 24,  c.y - 8,  c.r * 0.7, 0, Math.PI * 2);
      ctx.arc(cx - 20,  c.y - 4,  c.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Resize ──────────────────────────────────────────────────────────────────

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const W   = this.canvas.parentElement
      ? this.canvas.parentElement.clientWidth
      : window.innerWidth;
    const H   = this.canvas.parentElement
      ? this.canvas.parentElement.clientHeight
      : window.innerHeight;

    // HUD height is 44px, controls 90px
    const gameH = H - 44 - 90;

    this.canvas.width  = Math.round(W  * dpr);
    this.canvas.height = Math.round(gameH * dpr);
    this.canvas.style.width  = `${W}px`;
    this.canvas.style.height = `${gameH}px`;

    this.ctx.scale(dpr, dpr);

    this.camera.resize(W, gameH);
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      this._resize();
    });
  }
}
