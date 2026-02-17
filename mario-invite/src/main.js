// ══════════════════════════════════════════════════════════════════════════════
//  main.js — Entry point: orchestrates all screens and modules
// ══════════════════════════════════════════════════════════════════════════════

import { AudioEngine } from './audio/AudioEngine.js';
import { Game, GAME_STATE } from './game/Game.js';
import { Invite }     from './invite/Invite.js';
import { Transition } from './invite/Transition.js';
import { PARTY_CONFIG } from './config/party.js';

// ── Apply theme CSS variables from config ─────────────────────────────────────
;(function applyTheme() {
  const { primaryColor, secondaryColor, accentColor } = PARTY_CONFIG.theme;
  const root = document.documentElement;
  root.style.setProperty('--color-red',  primaryColor);
  root.style.setProperty('--color-yellow', secondaryColor);
  root.style.setProperty('--color-blue',   accentColor);
})();

// ── Shared singletons ─────────────────────────────────────────────────────────
const audio      = new AudioEngine();
const transition = new Transition();
const invite     = new Invite(audio);

// ── DOM references ────────────────────────────────────────────────────────────
const startScreen    = document.getElementById('start-screen');
const gameScreen     = document.getElementById('game-screen');
const inviteScreen   = document.getElementById('invite-screen');
const startBtn       = document.getElementById('start-btn');
const restartBtn     = document.getElementById('restart-btn');
const gameCanvas     = document.getElementById('game-canvas');

let game = null;

// ── State machine ─────────────────────────────────────────────────────────────

function showStart() {
  startScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  inviteScreen.classList.add('hidden');
}

function showGame() {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  inviteScreen.classList.add('hidden');
}

async function showInvite() {
  // Hide game screen during transition
  await transition.gameToInvite(() => {
    gameScreen.classList.add('hidden');
    game?.stop();
    invite.show();
  });
}

// ── Start screen ──────────────────────────────────────────────────────────────

startBtn?.addEventListener('click', async () => {
  // Initialize audio on first user gesture
  audio.init();
  await audio.resume();

  showGame();
  startGame();
});

// ── Game setup ────────────────────────────────────────────────────────────────

function startGame() {
  if (game) {
    game.stop();
  }

  game = new Game(gameCanvas, audio);
  game.start();
  audio.playMusic('game');

  // Listen for level complete
  document.addEventListener('LEVEL_COMPLETE', onLevelComplete, { once: true });
}

async function onLevelComplete(e) {
  // Give LEVEL CLEAR overlay 3 seconds (already shown by Game.js)
  await delay(3000);
  await showInvite();
}

// ── Restart button ────────────────────────────────────────────────────────────

restartBtn?.addEventListener('click', () => {
  document.getElementById('game-over-overlay').classList.add('hidden');
  audio.init();
  audio.resume();
  if (game) {
    game.reset();
    audio.playMusic('game');
    // Re-register level complete listener
    document.addEventListener('LEVEL_COMPLETE', onLevelComplete, { once: true });
  }
});

// ── Prevent context menu on touch (long-press) ───────────────────────────────
document.addEventListener('contextmenu', e => e.preventDefault());

// ── Prevent default scroll on arrow keys ────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault();
  }
});

// ── Prevent pinch/zoom on mobile ─────────────────────────────────────────────
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// ── Utility ───────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Initial state ─────────────────────────────────────────────────────────────
showStart();

// ── PWA: handle visibility change (pause/resume audio) ───────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (game?.state === GAME_STATE.PLAYING) {
      audio.stopMusic();
    }
  } else {
    if (game?.state === GAME_STATE.PLAYING) {
      audio.playMusic('game');
    }
  }
});
