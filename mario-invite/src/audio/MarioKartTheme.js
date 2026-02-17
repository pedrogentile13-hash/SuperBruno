// ══════════════════════════════════════════════════════════════════════════════
//  MarioKartTheme.js — Mario Kart SNES theme (Rainbow Road style melody)
//  Synthesized entirely via Web Audio API — no audio files.
// ══════════════════════════════════════════════════════════════════════════════

const N = {
  G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63,
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33,
  E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  Bb4: 466.16, Eb4: 311.13, Ab4: 415.30, Db5: 554.37,
  F3: 174.61, Bb3: 233.08,
  R: 0,
};

// BPM ≈ 165 — festive, upbeat
const Q  = 60 / 165;         // quarter
const E  = Q / 2;
const H  = Q * 2;
const DQ = Q * 1.5;
const S  = Q / 4;

// ── Melody (simplified Rainbow Road / MK SNES feel) ──────────────────────────
const MELODY = [
  // Intro fanfare
  [N.G4, E], [N.G4, E], [N.G4, E], [N.G4, Q],
  [N.Eb4, E],[N.G4, E], [N.Bb4, Q],[N.G4, H],

  // Main phrase A
  [N.D5, Q], [N.C5, E], [N.Bb4, E],[N.A4, Q], [N.G4, Q],
  [N.C5, Q], [N.Bb4,E], [N.A4, E], [N.G4, Q], [N.F4, E],[N.G4,E],
  [N.A4, Q], [N.G4, E], [N.F4, E], [N.E4, Q], [N.D4, Q],
  [N.G4, H], [N.R,  Q], [N.G4, Q],

  // Phrase A repeat with variation
  [N.D5, Q], [N.C5, E], [N.Bb4, E],[N.A4, Q], [N.G4, Q],
  [N.Eb4,Q], [N.F4, E], [N.G4, E], [N.Ab4,Q], [N.Bb4,Q],
  [N.A4, Q], [N.Ab4,E], [N.G4, E], [N.F4, Q], [N.Eb4,Q],
  [N.G4, H], [N.R,  H],

  // Bridge — rising sequence
  [N.G4, E], [N.A4, E], [N.Bb4,E], [N.C5, E], [N.D5, Q], [N.D5, Q],
  [N.D5, E], [N.E5, E], [N.F5, E], [N.G5, Q],  [N.G5, H],
  [N.F5, Q], [N.E5, E], [N.D5, E], [N.C5, Q],  [N.B4, Q],
  [N.A4, Q], [N.G4, Q], [N.G4, H],

  // Fanfare reprise
  [N.G4, E], [N.G4, E], [N.A4, E], [N.Bb4,Q], [N.G4, Q],
  [N.C5, DQ],[N.Bb4,S], [N.A4, Q], [N.G4, H],

  // Outro
  [N.D5, E], [N.C5, E], [N.Bb4,E],[N.A4,E],
  [N.G4, Q], [N.G4, Q], [N.G4, H],
  [N.R,  H],
];

// ── Accompaniment (chord stabs) ───────────────────────────────────────────────
const CHORDS = [
  // G major
  [[N.G3, N.B3, N.D4], Q],
  [[N.G3, N.B3, N.D4], Q],
  [[N.C4, N.E4, N.G4], Q],
  [[N.C4, N.E4, N.G4], Q],
  [[N.D4, N.F4, N.A4], Q],
  [[N.D4, N.F4, N.A4], Q],
  [[N.G3, N.B3, N.D4], Q],
  [[N.G3, N.B3, N.D4], Q],
  // Eb, Bb
  [[N.Eb4, N.G4, N.Bb4], Q],
  [[N.Eb4, N.G4, N.Bb4], Q],
  [[N.Bb3, N.D4, N.F4],  Q],
  [[N.Bb3, N.D4, N.F4],  Q],
  // Repeat
  [[N.G3, N.B3, N.D4], Q],
  [[N.G3, N.B3, N.D4], Q],
  [[N.C4, N.E4, N.G4], Q],
  [[N.C4, N.E4, N.G4], Q],
];

// ── Bass walk ─────────────────────────────────────────────────────────────────
const BASS_WALK = [
  [N.G3, E], [N.G3, E], [N.C4, E], [N.C4, E],
  [N.D4, E], [N.D4, E], [N.G3, E], [N.G3, E],
  [N.Eb4,E], [N.Eb4,E], [N.Bb3,E], [N.Bb3,E],
  [N.G3, E], [N.G3, E], [N.C4, E], [N.C4, E],
];

export class MarioKartTheme {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} dest
   */
  constructor(ctx, dest) {
    this._ctx    = ctx;
    this._dest   = dest;
    this._nodes  = [];
    this._loopId = null;
    this._playing = false;
  }

  play() {
    if (this._playing) return;
    this._playing = true;
    this._schedule();
  }

  stop() {
    this._playing = false;
    if (this._loopId) {
      clearTimeout(this._loopId);
      this._loopId = null;
    }
    for (const n of this._nodes) {
      try { n.stop(); } catch(_) {}
    }
    this._nodes = [];
  }

  _schedule() {
    if (!this._playing) return;

    const ctx  = this._ctx;
    const dest = this._dest;
    const now  = ctx.currentTime + 0.05;

    // ── Melody ──────────────────────────────────────────────────────────────
    let t = now;
    for (const [freq, dur] of MELODY) {
      if (freq === N.R) { t += dur; continue; }

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      // Add slight vibrato
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 5.5;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0,    t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.01);
      g.gain.setValueAtTime(0.28, t + dur * 0.78);
      g.gain.linearRampToValueAtTime(0,   t + dur);

      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      lfo.start(t);
      osc.stop(t + dur);
      lfo.stop(t + dur);
      this._nodes.push(osc, lfo);

      t += dur;
    }

    const totalDur = t - now;

    // ── Chord stabs ─────────────────────────────────────────────────────────
    let ct = now;
    let ci = 0;
    while (ct < now + totalDur) {
      const [freqs, dur] = CHORDS[ci % CHORDS.length];
      for (const freq of freqs) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, ct);
        g.gain.setValueAtTime(0,    ct + dur * 0.5);

        osc.connect(g);
        g.connect(dest);
        osc.start(ct);
        osc.stop(ct + dur);
        this._nodes.push(osc);
      }
      ct += dur;
      ci++;
    }

    // ── Bass ────────────────────────────────────────────────────────────────
    let bt = now;
    let bi = 0;
    while (bt < now + totalDur) {
      const [freq, dur] = BASS_WALK[bi % BASS_WALK.length];

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, bt);
      g.gain.setValueAtTime(0,    bt + dur * 0.6);

      const filt = ctx.createBiquadFilter();
      filt.type            = 'lowpass';
      filt.frequency.value = 400;

      osc.connect(filt);
      filt.connect(g);
      g.connect(dest);
      osc.start(bt);
      osc.stop(bt + dur);
      this._nodes.push(osc);

      bt += dur;
      bi++;
    }

    // ── Schedule loop ───────────────────────────────────────────────────────
    const loopMs = (totalDur - 0.05) * 1000;
    this._loopId = setTimeout(() => {
      this._nodes = [];
      this._schedule();
    }, loopMs);
  }
}
