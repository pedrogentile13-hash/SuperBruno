// ══════════════════════════════════════════════════════════════════════════════
//  AudioEngine.js — Central Web Audio API engine
//  All synthesis happens here. Zero external audio files.
// ══════════════════════════════════════════════════════════════════════════════

export class AudioEngine {
  constructor() {
    this._ctx          = null;
    this._masterGain   = null;
    this._musicGain    = null;
    this._sfxGain      = null;

    this._currentMusic = null; // { stop: () => void }
    this._musicType    = null; // 'game' | 'invite' | null
    this._initialized  = false;
    this._musicEnabled = true;

    // Config (volumes 0–1)
    this.masterVolume  = 0.5;
    this.musicVolume   = 0.35;
    this.sfxVolume     = 0.7;
  }

  /**
   * Must be called after a user gesture (iOS policy).
   */
  init() {
    if (this._initialized) return this;

    this._ctx        = new (window.AudioContext || window.webkitAudioContext)();
    this._masterGain = this._makeGain(this.masterVolume);
    this._musicGain  = this._makeGain(this.musicVolume);
    this._sfxGain    = this._makeGain(this.sfxVolume);

    this._musicGain.connect(this._masterGain);
    this._sfxGain.connect(this._masterGain);
    this._masterGain.connect(this._ctx.destination);

    this._initialized = true;
    return this;
  }

  /** Resume if suspended (iOS requires this after unlock). */
  async resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      await this._ctx.resume();
    }
  }

  // ── Music ──────────────────────────────────────────────────────────────────

  /**
   * @param {'game'|'invite'} type
   */
  async playMusic(type = 'game') {
    await this.resume();
    if (!this._initialized || !this._musicEnabled) return;
    if (this._musicType === type && this._currentMusic) return;

    this.stopMusic();

    this._musicType = type;

    const { MarioTheme }     = await import('./MarioTheme.js');
    const { MarioKartTheme } = await import('./MarioKartTheme.js');

    if (type === 'game') {
      this._currentMusic = new MarioTheme(this._ctx, this._musicGain);
    } else {
      this._currentMusic = new MarioKartTheme(this._ctx, this._musicGain);
    }

    this._currentMusic.play();
  }

  stopMusic() {
    if (this._currentMusic) {
      try { this._currentMusic.stop(); } catch (_) {}
      this._currentMusic = null;
      this._musicType    = null;
    }
  }

  toggleMusic(type = 'invite') {
    if (this._musicType === type && this._currentMusic) {
      this.stopMusic();
      this._musicEnabled = false;
      return false;
    }
    this._musicEnabled = true;
    this.playMusic(type);
    return true;
  }

  isMusicPlaying() {
    return !!this._currentMusic;
  }

  // ── SFX ───────────────────────────────────────────────────────────────────

  /**
   * @param {'jump'|'coin'|'stomp'|'death'|'levelClear'|'pause'} name
   */
  async playSFX(name) {
    if (!this._initialized) return;
    await this.resume();

    const { SoundFX } = await import('./SoundFX.js');
    SoundFX[name]?.(this._ctx, this._sfxGain);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _makeGain(value) {
    const g = this._ctx.createGain();
    g.gain.value = value;
    return g;
  }

  /**
   * Create and start an oscillator node.
   * @param {AudioNode} dest
   * @param {number} freq — Hz
   * @param {number} startTime — AudioContext.currentTime offset
   * @param {number} duration — seconds
   * @param {'square'|'sawtooth'|'sine'|'triangle'} type
   * @param {number} gainValue
   * @returns {void}
   */
  scheduleNote(dest, freq, startTime, duration, type = 'square', gainValue = 0.3) {
    const g   = this._ctx.createGain();
    const osc = this._ctx.createOscillator();

    osc.type          = type;
    osc.frequency.value = freq;

    g.gain.setValueAtTime(gainValue, startTime);
    g.gain.setValueAtTime(0, startTime + duration * 0.85);

    osc.connect(g);
    g.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  get ctx()       { return this._ctx; }
  get musicGain() { return this._musicGain; }
  get sfxGain()   { return this._sfxGain; }
}
