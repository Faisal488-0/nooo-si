// NOOO SOUND LAB — every sound is synthesized locally with the Web Audio API.
// Rules: nothing is created before a user gesture, one sound at a time, global mute + volume.

let ctx = null;
let master = null;
let active = [];
let stopTimer = null;
let muted = false;
let volume = 0.6;

try {
  muted = localStorage.getItem('nooo.muted') === '1';
  const v = Number(localStorage.getItem('nooo.volume'));
  if (Number.isFinite(v) && v >= 0 && v <= 1 && localStorage.getItem('nooo.volume') !== null) volume = v;
} catch { /* ignore */ }

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    // A gentle compressor keeps every pad clear and loud without clipping.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 24; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    const lift = ctx.createGain();
    lift.gain.value = 1.8;
    master.connect(comp); comp.connect(lift); lift.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const isMuted = () => muted;
export const getVolume = () => volume;

export function setMuted(m) {
  muted = !!m;
  try { localStorage.setItem('nooo.muted', muted ? '1' : '0'); } catch { /* ignore */ }
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  if (muted) stop();
}

export function setVolume(v) {
  volume = Math.min(1, Math.max(0, Number(v)));
  try { localStorage.setItem('nooo.volume', String(volume)); } catch { /* ignore */ }
  if (master && !muted) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
}

export function stop() {
  clearTimeout(stopTimer);
  try { window.speechSynthesis?.cancel(); } catch { /* speech unavailable */ }
  for (const n of active) {
    try { n.stop?.(); } catch { /* already stopped */ }
    try { n.disconnect(); } catch { /* ignore */ }
  }
  active = [];
}

const track = (...nodes) => { active.push(...nodes); return nodes[0]; };

function osc(type, freq, t0, t1, out) {
  const o = track(ctx.createOscillator());
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.connect(out);
  o.start(t0);
  o.stop(t1);
  return o;
}

function env(t0, attack, hold, release, peak = 1) {
  const g = track(ctx.createGain());
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.setValueAtTime(peak, t0 + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  return g;
}

function vowelChain(dest) {
  // Two band-pass "formants" around an "oh" vowel.
  const f1 = track(ctx.createBiquadFilter());
  const f2 = track(ctx.createBiquadFilter());
  f1.type = 'bandpass'; f1.frequency.value = 520; f1.Q.value = 6;
  f2.type = 'bandpass'; f2.frequency.value = 880; f2.Q.value = 8;
  const mix = track(ctx.createGain());
  mix.gain.value = 2.2;
  f1.connect(mix); f2.connect(mix); mix.connect(dest);
  return [f1, f2];
}

function noiseBuffer(seconds) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return buf;
}


// ---- Real human voice (the browser's own text-to-speech; nothing is downloaded) ----
const SPEECH_LANG = { ar: 'ar-SA', en: 'en-US' };

export function canSpeak() { return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }

function pickVoice(langTag) {
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  const base = langTag.slice(0, 2).toLowerCase();
  const same = voices.filter((v) => v.lang?.toLowerCase().startsWith(base));
  return same.find((v) => v.lang.toLowerCase() === langTag.toLowerCase() && v.localService) || same.find((v) => v.localService) || same[0] || null;
}

/** Speaks text with the device voice. Call only from a user gesture. Returns false if unavailable or muted. */
export function speak(text, { pitch = 1, rate = 1, lang: l } = {}) {
  if (muted || !canSpeak() || !text) return false;
  const code = (l || document.documentElement.lang || 'en').slice(0, 2) === 'ar' ? 'ar' : 'en';
  stop();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SPEECH_LANG[code];
  const v = pickVoice(u.lang);
  if (v) u.voice = v;
  u.pitch = pitch; u.rate = rate; u.volume = Math.max(0.05, volume);
  window.speechSynthesis.speak(u);
  return true;
}

const sayNo = () => (document.documentElement.lang === 'ar' ? 'لا!' : 'No!');
const SPEECH_VOICES = {
  human: () => speak(sayNo(), { pitch: 1, rate: 0.9 }),
  deep: () => speak(document.documentElement.lang === 'ar' ? 'لااااا!' : 'Nooooo!', { pitch: 0.1, rate: 0.55 }),
  tiny: () => speak(document.documentElement.lang === 'ar' ? 'لا لا لا لا!' : 'No no no no!', { pitch: 2, rate: 1.5 }),
  announcer: () => speak(document.documentElement.lang === 'ar' ? 'والجواب النهائي هو: لا.' : 'And the final answer is: no.', { pitch: 0.6, rate: 0.8 })
};

const MORSE_NO = '-. --- --- ---';

const VOICES = {
  dramatic(t) {
    const g = env(t, 0.05, 1.0, 0.6, 0.5); g.connect(master);
    const [f1, f2] = vowelChain(g);
    const o = osc('sawtooth', 220, t, t + 1.8, f1); o.connect(f2);
    o.frequency.exponentialRampToValueAtTime(90, t + 1.6);
    const lfo = osc('sine', 6, t, t + 1.8, track(ctx.createGain()));
    const depth = track(ctx.createGain()); depth.gain.value = 8; lfo.disconnect(); lfo.connect(depth); depth.connect(o.frequency);
    return 1.8;
  },
  robot(t) {
    const notes = [[330, 0, 0.18], [220, 0.22, 0.45]];
    for (const [f, s, d] of notes) {
      const g = env(t + s, 0.01, d - 0.05, 0.05, 0.25); g.connect(master);
      const o = osc('square', f, t + s, t + s + d + 0.1, g);
      const ring = osc('sine', 40, t + s, t + s + d + 0.1, track(ctx.createGain()));
      const rg = track(ctx.createGain()); rg.gain.value = 30; ring.disconnect(); ring.connect(rg); rg.connect(o.frequency);
    }
    return 0.8;
  },
  cat(t) {
    const g = env(t, 0.04, 0.35, 0.3, 0.35); g.connect(master);
    const lp = track(ctx.createBiquadFilter()); lp.type = 'lowpass'; lp.Q.value = 9; lp.connect(g);
    lp.frequency.setValueAtTime(700, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.25); lp.frequency.linearRampToValueAtTime(600, t + 0.7);
    const o = osc('sawtooth', 520, t, t + 0.8, lp);
    o.frequency.linearRampToValueAtTime(760, t + 0.2); o.frequency.linearRampToValueAtTime(430, t + 0.7);
    return 0.8;
  },
  alien(t) {
    const g = env(t, 0.1, 1.0, 0.4, 0.3); g.connect(master);
    const o = osc('sine', 880, t, t + 1.6, g);
    o.frequency.exponentialRampToValueAtTime(330, t + 1.4);
    const lfo = osc('sine', 9, t, t + 1.6, track(ctx.createGain()));
    const d = track(ctx.createGain()); d.gain.value = 60; lfo.disconnect(); lfo.connect(d); d.connect(o.frequency);
    return 1.6;
  },
  bit8(t) {
    const seq = [784, 659, 523, 392, 262];
    seq.forEach((f, i) => {
      const s = t + i * 0.11;
      const g = env(s, 0.005, 0.08, 0.02, 0.18); g.connect(master);
      osc('square', f, s, s + 0.12, g);
    });
    return 0.7;
  },
  whisper(t) {
    const src = track(ctx.createBufferSource()); src.buffer = noiseBuffer(1.4);
    const bp = track(ctx.createBiquadFilter()); bp.type = 'bandpass'; bp.Q.value = 4;
    bp.frequency.setValueAtTime(1800, t); bp.frequency.exponentialRampToValueAtTime(600, t + 1.2);
    const g = env(t, 0.15, 0.6, 0.5, 0.5);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 1.4);
    return 1.4;
  },
  echo(t) {
    const delay = track(ctx.createDelay(1)); delay.delayTime.value = 0.28;
    const fb = track(ctx.createGain()); fb.gain.value = 0.45;
    delay.connect(fb); fb.connect(delay); delay.connect(master);
    const g = env(t, 0.03, 0.35, 0.25, 0.4); g.connect(master); g.connect(delay);
    const [f1, f2] = vowelChain(g);
    const o = osc('sawtooth', 200, t, t + 0.7, f1); o.connect(f2);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    return 2.2;
  },
  alarm(t) {
    const g = env(t, 0.02, 1.3, 0.2, 0.2); g.connect(master);
    const o = osc('triangle', 600, t, t + 1.6, g);
    for (let i = 0; i < 4; i += 1) {
      o.frequency.linearRampToValueAtTime(1100, t + i * 0.38 + 0.19);
      o.frequency.linearRampToValueAtTime(600, t + i * 0.38 + 0.38);
    }
    return 1.6;
  },
  rimshot(t) {
    // Ba-dum-tss: two drum hits and a cymbal crash.
    const hit = (at, f) => {
      const g = env(at, 0.002, 0.04, 0.12, 0.9); g.connect(master);
      const o = osc('sine', f, at, at + 0.2, g);
      o.frequency.exponentialRampToValueAtTime(f * 0.4, at + 0.15);
    };
    hit(t, 190); hit(t + 0.16, 140);
    const src = track(ctx.createBufferSource()); src.buffer = noiseBuffer(1);
    const hp = track(ctx.createBiquadFilter()); hp.type = 'highpass'; hp.frequency.value = 6000;
    const g = env(t + 0.4, 0.002, 0.02, 0.7, 0.55);
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(t + 0.4); src.stop(t + 1.2);
    return 1.3;
  },
  trombone(t) {
    // Sad trombone: wah, wah, wah, waaaah.
    [[311, 0, 0.32], [294, 0.4, 0.32], [277, 0.8, 0.32], [262, 1.2, 1.0]].forEach(([f, s0, d], i) => {
      const g = env(t + s0, 0.04, d - 0.08, 0.08, 0.5); g.connect(master);
      const lp = track(ctx.createBiquadFilter()); lp.type = 'lowpass'; lp.Q.value = 3; lp.connect(g);
      lp.frequency.setValueAtTime(500, t + s0); lp.frequency.linearRampToValueAtTime(1500, t + s0 + 0.12); lp.frequency.linearRampToValueAtTime(700, t + s0 + d);
      const o = osc('sawtooth', f, t + s0, t + s0 + d + 0.1, lp);
      if (i === 3) {
        o.frequency.linearRampToValueAtTime(f * 0.93, t + s0 + 0.5);
        const lfo = osc('sine', 6, t + s0, t + s0 + d + 0.1, track(ctx.createGain()));
        const dp = track(ctx.createGain()); dp.gain.value = 5; lfo.disconnect(); lfo.connect(dp); dp.connect(o.frequency);
      }
    });
    return 2.3;
  },
  buzzer(t) {
    // Game-show wrong answer.
    const g = env(t, 0.01, 0.75, 0.1, 0.45); g.connect(master);
    for (const f of [110, 116]) osc('square', f, t, t + 1, g);
    return 0.95;
  },
  airhorn(t) {
    const g = env(t, 0.01, 0.9, 0.25, 0.4); g.connect(master);
    for (const f of [440, 554, 659]) {
      const o = osc('sawtooth', f, t, t + 1.3, g);
      o.frequency.setValueAtTime(f * 0.96, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
    }
    return 1.3;
  },
  boing(t) {
    const g = env(t, 0.005, 0.5, 0.35, 0.5); g.connect(master);
    const o = osc('sine', 200, t, t + 1, g);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    const lfo = osc('sine', 18, t, t + 1, track(ctx.createGain()));
    const d = track(ctx.createGain()); d.gain.value = 140; lfo.disconnect(); lfo.connect(d); d.connect(o.frequency);
    o.frequency.exponentialRampToValueAtTime(260, t + 0.8);
    return 1.0;
  },
  gong(t) {
    for (const [f, a] of [[110, 0.5], [165, 0.3], [233, 0.22], [349, 0.15]]) {
      const g = env(t, 0.005, 0.1, 2.2, a); g.connect(master);
      osc('sine', f, t, t + 2.5, g);
    }
    return 2.6;
  },
  morse(t) { return playMorseAt(t, MORSE_NO); },
  kazoo(t) {
    const g = env(t, 0.05, 0.7, 0.3, 0.3); g.connect(master);
    const bp = track(ctx.createBiquadFilter()); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 2; bp.connect(g);
    const o = osc('sawtooth', 330, t, t + 1.1, bp);
    o.frequency.setValueAtTime(330, t); o.frequency.linearRampToValueAtTime(392, t + 0.3); o.frequency.linearRampToValueAtTime(262, t + 1.0);
    const lfo = osc('sine', 7, t, t + 1.1, track(ctx.createGain()));
    const d = track(ctx.createGain()); d.gain.value = 10; lfo.disconnect(); lfo.connect(d); d.connect(o.frequency);
    return 1.1;
  }
};

function playMorseAt(t0, code, onSymbol) {
  const unit = 0.09;
  let t = t0;
  for (const sym of code) {
    if (sym === '.' || sym === '-') {
      const len = sym === '.' ? unit : unit * 3;
      const g = env(t, 0.005, len - 0.01, 0.01, 0.25); g.connect(master);
      osc('sine', 680, t, t + len + 0.02, g);
      if (onSymbol) setTimeout(() => onSymbol(true, len * 1000), (t - ctx.currentTime) * 1000);
      t += len + unit;
    } else if (sym === ' ') t += unit * 2;
    else if (sym === '/') t += unit * 4;
  }
  return t - t0 + 0.1;
}

export const SPEECH_IDS = Object.keys(SPEECH_VOICES);
export const SOUND_IDS = [...Object.keys(SPEECH_VOICES).filter(() => canSpeak()), ...Object.keys(VOICES)];

/** Plays one voice. Returns false if muted or audio is unavailable. Call only from a user gesture. */
export function play(id) {
  if (muted) return false;
  if (SPEECH_VOICES[id] && canSpeak()) return SPEECH_VOICES[id]();
  if (!ensure()) return false;
  stop();
  const fn = VOICES[id] ?? VOICES.dramatic;
  const dur = fn(ctx.currentTime + 0.02);
  stopTimer = setTimeout(stop, (dur + 0.4) * 1000);
  return true;
}

export function playMorse(code, onSymbol) {
  if (muted) return false;
  if (!ensure()) return false;
  stop();
  const dur = playMorseAt(ctx.currentTime + 0.05, code.replace(/#/g, ''), onSymbol);
  stopTimer = setTimeout(stop, (dur + 0.4) * 1000);
  return true;
}

/** Joke punchline: rimshot sound effect (the synth path is always available). */
export const rimshot = () => play('rimshot');
