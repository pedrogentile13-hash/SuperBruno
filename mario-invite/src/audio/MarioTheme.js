// ══════════════════════════════════════════════════════════════════════════════
//  MarioTheme.js — Super Mario Bros main theme (first 8 bars) via Web Audio API
//  Synthesized with OscillatorNode — zero audio files.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Note frequencies (Hz) — equal temperament
 */
const N = {
  E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880.00, B5: 987.77, C6: 1046.50,
  Bb4: 466.16, Fs4: 369.99,
  R: 0,  // rest
};

// BPM ≈ 200, quarter = 0.3s
const Q  = 0.30; // quarter note
const E  = Q / 2; // eighth
const S  = Q / 4; // sixteenth
const DQ = Q * 1.5; // dotted quarter

/**
 * Main melody — array of [freq, duration]
 * Corresponds to the classic SMB overworld first 8 bars.
 */
const MELODY = [
  // Bar 1
  [N.E5, E], [N.E5, E], [N.R, E], [N.E5, E],
  [N.R,  E], [N.C5, E], [N.E5, Q],
  [N.G5, Q], [N.R,  Q], [N.G4, Q], [N.R, Q],

  // Bar 2
  [N.C5, DQ], [N.R, S], [N.G4, Q], [N.R, Q],
  [N.E4, DQ], [N.R, S], [N.A4, Q], [N.B4, Q],
  [N.Bb4, E], [N.A4, Q],

  // Bar 3
  [N.G4, E*0.67], [N.E5, E*0.67], [N.G5, E*0.67],
  [N.A5, Q], [N.F5, E], [N.G5, E],
  [N.R,  E], [N.E5, Q], [N.C5, E], [N.D5, E], [N.B4, DQ],

  // Bar 4
  [N.C5, DQ], [N.R, S], [N.G4, Q], [N.R, Q],
  [N.E4, DQ], [N.R, S], [N.A4, Q], [N.B4, Q],
  [N.Bb4, E], [N.A4, Q],

  // Bar 5 — repeat of bar 3 melody
  [N.G4, E*0.67], [N.E5, E*0.67], [N.G5, E*0.67],
  [N.A5, Q], [N.F5, E], [N.G5, E],
  [N.R,  E], [N.E5, Q], [N.C5, E], [N.D5, E], [N.B4, DQ],

  // Bar 6
  [N.R,  E], [N.G5, E], [N.Fs4, E], [N.F5, E],
  [N.Fs4,E], [N.R,  S], [N.A4, E], [N.G5, E], [N.A5, E],
  [N.A5, S], [N.B5, E], [N.R,  S], [N.A5, E], [N.G5, DQ],

  // Bar 7
  [N.E5, E*0.67], [N.G5, E*0.67], [N.A5, E*0.67],
  [N.F5, Q], [N.G5, E], [N.R, E],
  [N.E5, Q], [N.C5, E], [N.D5, E], [N.B4, DQ],

  // Bar 8 (outro flourish)
  [N.C5, Q], [N.G4, E], [N.R, E], [N.E4, DQ],
  [N.R,  S], [N.A4, Q], [N.B4, Q],
  [N.Bb4,E], [N.A4, Q],
];

/**
 * Bass line notes — simplified
 */
const BASS = [
  [N.C5, Q], [N.C5, Q], [N.C5, Q],
  [N.C5, Q], [N.R,  Q], [N.G4, Q],
  [N.E4, Q], [N.A4, Q], [N.B4, Q],
  [N.Bb4,Q], [N.A4, Q], [N.R,  Q],
];

export class MarioTheme {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} dest
   */
  constructor(ctx, dest) {
    this._ctx   = ctx;
    this._dest  = dest;
    this._nodes = [];
    this._loopId = null;
    this._playing = false;
  }

  play() {
    if (this._playing) return;
    this._playing = true;
    this._schedule(0);
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

  _schedule(iteration) {
    if (!this._playing) return;

    const ctx  = this._ctx;
    const dest = this._dest;
    const now  = ctx.currentTime + 0.05; // small lookahead

    // ── Melody channel ──────────────────────────────────────────────────────
    let t = now;
    for (const [freq, dur] of MELODY) {
      if (freq === 0) { t += dur; continue; }

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.005);
      g.gain.setValueAtTime(0.3, t + dur * 0.8);
      g.gain.linearRampToValueAtTime(0, t + dur * 0.95);

      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + dur);
      this._nodes.push(osc);

      t += dur;
    }

    // Total duration = t - now
    const totalDur = t - now;

    // ── Simple pulse bass ───────────────────────────────────────────────────
    let bt = now;
    // Repeat bass pattern to fill duration
    const bassLoop = [...BASS, ...BASS, ...BASS, ...BASS, ...BASS];
    for (const [freq, dur] of bassLoop) {
      if (bt >= now + totalDur) break;
      if (freq === 0) { bt += dur; continue; }

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq / 2; // octave down

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, bt);
      g.gain.setValueAtTime(0,    bt + dur * 0.7);

      osc.connect(g);
      g.connect(dest);
      osc.start(bt);
      osc.stop(bt + dur);
      this._nodes.push(osc);

      bt += dur;
    }

    // Schedule loop restart
    const loopMs = (totalDur - 0.05) * 1000;
    this._loopId = setTimeout(() => {
      this._nodes = [];
      this._schedule(iteration + 1);
    }, loopMs);
  }
}
