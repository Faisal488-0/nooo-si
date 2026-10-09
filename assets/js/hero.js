// The giant NOOO! button. 24 distinct reactions, rotated so the same one never repeats twice
// in a row. Hard caps keep rapid clicking from piling up animations.

import { el, svgNode, reducedMotion } from './lib/dom.js';
import { renderScene } from './lib/scene.js';
import { t, lang } from './i18n.js';
import { play, SOUND_IDS } from './sound.js';

const MAX_FX_NODES = 80;
const MIN_GAP_MS = 160;
const WORLD_NOS = ['NO', 'لا', 'NEIN', 'NON', 'NYET', 'NEJ', 'IIE', 'NAHI', 'HAPANA', 'OCHI', 'NEE', 'HAYIR', 'NIE', 'NÃO', 'TIDAK', 'KHÔNG', 'ANIYO', 'CHA'];

let layer;
let btn;
let says;
let counter;
let clicks = 0;
let lastAt = 0;
let lastReaction = -1;

const rand = (a, b) => a + Math.random() * (b - a);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function spawn(node, ms) {
  if (layer.childElementCount > MAX_FX_NODES) return null;
  layer.append(node);
  setTimeout(() => node.remove(), ms);
  return node;
}

function center() {
  const r = btn.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function flyer(text, { x, y, dx, dy, rot = 0, cls = '', ms = 1100, size = 32 }) {
  const n = el('span', { class: `fx-fly ${cls}`, text });
  n.style.cssText = `left:${x}px;top:${y}px;--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg;font-size:${size}px;animation-duration:${ms}ms`;
  return spawn(n, ms + 50);
}

function bodyClass(cls, ms) {
  document.body.classList.add(cls);
  setTimeout(() => document.body.classList.remove(cls), ms);
}

function btnClass(cls, ms) {
  btn.classList.remove(cls);
  void btn.offsetWidth; // restart animation
  btn.classList.add(cls);
  setTimeout(() => btn.classList.remove(cls), ms);
}

function popScene(preset, ms = 1600, cls = 'fx-scene') {
  const wrap = el('div', { class: cls });
  wrap.append(svgNode(renderScene(preset, { idSuffix: `fx${Date.now()}` })));
  const { x, y } = center();
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;
  return spawn(wrap, ms);
}

const REACTIONS = [
  // 1 shake
  () => bodyClass('fx-shake', 500),
  // 2 sticker explosion
  () => {
    const { x, y } = center();
    const stickers = ['NO!', 'NOPE', '🙅', '⛔', 'لا!', 'NAH', '✋', 'DENIED'];
    for (let i = 0; i < 16; i += 1) {
      const a = (i / 16) * Math.PI * 2;
      flyer(pickOne(stickers), { x, y, dx: Math.cos(a) * rand(160, 320), dy: Math.sin(a) * rand(140, 280), rot: rand(-60, 60), cls: 'fx-sticker', ms: 1000 });
    }
  },
  // 3 flying letters
  () => {
    const { x, y } = center();
    for (const ch of 'NOOOOO') flyer(ch, { x, y, dx: rand(-420, 420), dy: rand(-360, 120), rot: rand(-400, 400), cls: 'fx-letter', size: rand(40, 90), ms: 1300 });
  },
  // 4 shocked cat
  () => popScene({ character: 'cat', expression: 'shocked', background: 'burst', palette: 'lemon', sticker: lang() === 'ar' ? 'لااا!' : 'NOOO!', seed: 1 }),
  // 5 space mode
  () => {
    bodyClass('fx-space', 2200);
    for (let i = 0; i < 24; i += 1) flyer('✦', { x: rand(0, innerWidth), y: rand(0, innerHeight), dx: rand(-30, 30), dy: rand(-30, 30), cls: 'fx-star', size: rand(10, 26), ms: 2000 });
  },
  // 6 echo
  () => {
    const { x, y } = center();
    for (let i = 0; i < 5; i += 1) setTimeout(() => flyer('NOOO', { x, y, dx: 0, dy: 0, cls: 'fx-echo', size: 70, ms: 900 }), i * 120);
  },
  // 7 scream wave
  () => {
    const { x, y } = center();
    for (let i = 0; i < 4; i += 1) {
      const ring = el('span', { class: 'fx-ring' });
      ring.style.cssText = `left:${x}px;top:${y}px;animation-delay:${i * 130}ms`;
      spawn(ring, 1300);
    }
  },
  // 8 DENIED stamp
  () => {
    const s = el('span', { class: 'fx-stamp', text: lang() === 'ar' ? 'مرفوض' : 'DENIED' });
    spawn(s, 1400);
  },
  // 9 glitch
  () => btnClass('fx-glitch', 700),
  // 10 rain of "no" from around the world
  () => {
    for (let i = 0; i < 22; i += 1) {
      const n = flyer(pickOne(WORLD_NOS), { x: rand(0, innerWidth), y: -40, dx: rand(-40, 40), dy: innerHeight + 80, cls: 'fx-rain', size: rand(16, 34), ms: rand(1400, 2200) });
      if (n) n.style.animationDelay = `${rand(0, 500)}ms`;
    }
  },
  // 11 robot with binary stream
  () => {
    popScene({ character: 'robot', expression: 'angry', background: 'grid', palette: 'cyan', sticker: '01001110', seed: 2 });
    const { x, y } = center();
    for (let i = 0; i < 8; i += 1) flyer(Math.random() > 0.5 ? '1' : '0', { x, y, dx: rand(-260, 260), dy: rand(-260, 100), cls: 'fx-bit', size: 28, ms: 1100 });
  },
  // 12 morse lamp (gentle opacity blinks, no full-screen flashing)
  () => {
    const lamp = el('span', { class: 'fx-lamp', text: '-. ---' });
    spawn(lamp, 1800);
  },
  // 13 zoom punch
  () => btnClass('fx-zoom', 600),
  // 14 spin
  () => btnClass('fx-spin', 800),
  // 15 bouncing letters
  () => btnClass('fx-bounce', 900),
  // 16 hue party
  () => bodyClass('fx-hue', 1200),
  // 17 speech bubbles from the edges
  () => {
    for (let i = 0; i < 6; i += 1) {
      const left = i % 2 === 0;
      const n = el('span', { class: `fx-bubble ${left ? 'l' : 'r'}`, text: pickOne(WORLD_NOS) + '!' });
      n.style.top = `${rand(15, 80)}vh`;
      n.style.animationDelay = `${i * 90}ms`;
      spawn(n, 1500);
    }
  },
  // 18 UFO abducts a "yes"
  () => {
    const ufo = el('div', { class: 'fx-ufo' });
    ufo.append(svgNode(renderScene({ character: 'ufo', expression: 'smug', background: 'space', palette: 'night', seed: 3 }, { sticker: false })));
    const yes = el('span', { class: 'fx-yes', text: lang() === 'ar' ? 'نعم؟' : 'YES?' });
    spawn(ufo, 2100);
    spawn(yes, 2100);
  },
  // 19 YES gets crossed out into NO
  () => {
    const n = el('span', { class: 'fx-cross' }, el('s', { text: lang() === 'ar' ? 'نعم' : 'YES' }), el('b', { text: lang() === 'ar' ? ' لا' : ' NO' }));
    spawn(n, 1600);
  },
  // 20 balloon pop
  () => {
    const { x, y } = center();
    const b = el('span', { class: 'fx-balloon', text: '🎈' });
    b.style.cssText = `left:${x}px;top:${y}px`;
    spawn(b, 900);
    setTimeout(() => { for (let i = 0; i < 10; i += 1) flyer('NO', { x, y: y - 120, dx: rand(-200, 200), dy: rand(-160, 160), cls: 'fx-sticker', size: 22, ms: 800 }); }, 700);
  },
  // 21 typewriter
  () => {
    const msg = lang() === 'ar' ? 'تم رفض الطلب.' : 'Request denied.';
    const n = el('span', { class: 'fx-type', text: '' });
    spawn(n, 2000);
    Array.from(msg).forEach((ch, i) => setTimeout(() => { n.textContent += ch; }, i * 55));
  },
  // 22 stretch
  () => btnClass('fx-stretch', 900),
  // 23 ghost floats away
  () => popScene({ character: 'ghost', expression: 'sleepy', background: 'dots', palette: 'mint', sticker: 'no~', seed: 4 }, 1900, 'fx-scene fx-float'),
  // 24 emoji storm
  () => {
    const { x, y } = center();
    const em = ['🙅', '🙅‍♂️', '⛔', '🚫', '✋', '🛑', '❌'];
    for (let i = 0; i < 18; i += 1) flyer(pickOne(em), { x, y, dx: rand(-480, 480), dy: rand(-420, 260), rot: rand(-180, 180), cls: 'fx-emoji', size: rand(26, 54), ms: 1300 });
  }
];

export const REACTION_COUNT = REACTIONS.length;

function react() {
  if (reducedMotion()) {
    btnClass('fx-calm', 400);
    return;
  }
  let i;
  do { i = Math.floor(Math.random() * REACTIONS.length); } while (i === lastReaction);
  lastReaction = i;
  REACTIONS[i]();
}

function updateSays() {
  const lines = t('heroSays');
  const idx = clicks <= 4 ? clicks - 1 : 3 + ((clicks - 4) % (lines.length - 3));
  says.textContent = lines[Math.max(0, idx)];
  counter.textContent = t('clicks')(clicks);
  says.classList.remove('pop');
  void says.offsetWidth;
  says.classList.add('pop');
}

export function initHero() {
  layer = document.getElementById('fx-layer');
  btn = document.getElementById('nooo-btn');
  says = document.getElementById('hero-says');
  counter = document.getElementById('hero-count');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const now = performance.now();
    if (now - lastAt < MIN_GAP_MS) return;
    lastAt = now;
    clicks += 1;
    updateSays();
    react();
    play(clicks <= 3 ? 'dramatic' : pickOne(SOUND_IDS.filter((s) => s !== 'morse')));
  });
}

export function refreshHeroLang() {
  if (clicks > 0) updateSays();
}
