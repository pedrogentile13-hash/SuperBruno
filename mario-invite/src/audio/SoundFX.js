// ══════════════════════════════════════════════════════════════════════════════
//  SoundFX.js — Classic Mario sound effects via Web Audio API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * All SFX functions accept (ctx, dest) where:
 *   ctx  — AudioContext
 *   dest — AudioNode (e.g., a GainNode)
 */
export const SoundFX = {

  // ── Jump ──────────────────────────────────────────────────────────────────
  jump(ctx, dest) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    g.connect(dest);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    osc.connect(g);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  },

  // ── Coin ──────────────────────────────────────────────────────────────────
  coin(ctx, dest) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    g.connect(dest);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(988,  ctx.currentTime);         // B5
    osc.frequency.setValueAtTime(1319, ctx.currentTime + 0.09);  // E6
    osc.connect(g);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  },

  // ── Stomp (enemy squish) ──────────────────────────────────────────────────
  stomp(ctx, dest) {
    // Noise burst + low thud
    const bufSize = ctx.sampleRate * 0.05;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    const filter = ctx.createBiquadFilter();
    filter.type            = 'lowpass';
    filter.frequency.value = 300;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(ctx.currentTime);

    // Low thud tone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    const og = ctx.createGain();
    og.gain.setValueAtTime(0.5, ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(og);
    og.connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },

  // ── Death ─────────────────────────────────────────────────────────────────
  death(ctx, dest) {
    // Classic Mario death melody: descending sweep
    const notes = [
      { freq: 523, start: 0.0,  dur: 0.12 },
      { freq: 392, start: 0.13, dur: 0.12 },
      { freq: 330, start: 0.26, dur: 0.12 },
      { freq: 262, start: 0.39, dur: 0.12 },
      { freq: 220, start: 0.52, dur: 0.22 },
      { freq: 196, start: 0.75, dur: 0.30 },
    ];

    const masterG = ctx.createGain();
    masterG.gain.value = 0.5;
    masterG.connect(dest);

    const now = ctx.currentTime;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      osc.type          = 'square';
      osc.frequency.value = n.freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, now + n.start);
      g.gain.setValueAtTime(0,   now + n.start + n.dur * 0.8);

      osc.connect(g);
      g.connect(masterG);
      osc.start(now + n.start);
      osc.stop(now  + n.start + n.dur);
    }
  },

  // ── Level Clear ───────────────────────────────────────────────────────────
  levelClear(ctx, dest) {
    const melody = [
      { freq: 523, dur: 0.12 }, // C5
      { freq: 523, dur: 0.12 }, // C5
      { freq: 523, dur: 0.12 }, // C5
      { freq: 523, dur: 0.35 }, // C5 (hold)
      { freq: 415, dur: 0.12 }, // Ab4
      { freq: 466, dur: 0.12 }, // Bb4
      { freq: 523, dur: 0.12 }, // C5
      { freq: 466, dur: 0.10 }, // Bb4
      { freq: 523, dur: 0.60 }, // C5 (hold)
    ];

    const masterG = ctx.createGain();
    masterG.gain.value = 0.45;
    masterG.connect(dest);

    const now = ctx.currentTime;
    let t = 0;
    for (const n of melody) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = n.freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, now + t);
      g.gain.setValueAtTime(0.0, now + t + n.dur * 0.85);

      osc.connect(g);
      g.connect(masterG);
      osc.start(now + t);
      osc.stop(now  + t + n.dur);

      t += n.dur;
    }
  },

  // ── Pause ─────────────────────────────────────────────────────────────────
  pause(ctx, dest) {
    const notes = [
      { freq: 659, dur: 0.10 }, // E5
      { freq: 523, dur: 0.10 }, // C5
      { freq: 392, dur: 0.15 }, // G4
    ];
    const g = ctx.createGain();
    g.gain.value = 0.3;
    g.connect(dest);
    const now = ctx.currentTime;
    let t = 0;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = n.freq;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.4, now + t);
      ng.gain.setValueAtTime(0,   now + t + n.dur * 0.85);
      osc.connect(ng);
      ng.connect(g);
      osc.start(now + t);
      osc.stop(now  + t + n.dur);
      t += n.dur;
    }
  },
};
