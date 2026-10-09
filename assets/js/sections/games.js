// Mini games: Don't Press NO, Find the NO, NO Reaction Test, NOOO Typing Race.
import { el, $, shuffle, reducedMotion } from '../lib/dom.js';
import { t, lang } from '../i18n.js';
import { play } from '../sound.js';

const timers = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); };

// ---------- 1. Don't Press NO ----------
function g1() {
  const box = $('#g1-area');
  let start = 0;
  let iv = null;
  const status = el('p', { class: 'g-status', 'aria-live': 'polite' });
  const btn = el('button', { type: 'button', class: 'g1-btn', text: t('g1Btn') });
  const finish = (won) => {
    clearInterval(iv);
    btn.disabled = true;
    status.textContent = won ? t('g1Win') : t('g1Lose')(((performance.now() - start) / 1000).toFixed(1));
    play(won ? 'bit8' : 'dramatic');
    box.append(el('button', { type: 'button', class: 'btn btn-sm', text: t('gameAgain'), onclick: g1 }));
  };
  btn.addEventListener('click', () => finish(false));
  const startBtn = el('button', { type: 'button', class: 'btn', text: t('gameStart'), onclick: () => {
    startBtn.remove();
    box.prepend(btn);
    start = performance.now();
    iv = setInterval(() => {
      const left = 10 - (performance.now() - start) / 1000;
      if (left <= 0) { finish(true); return; }
      status.textContent = `${t('g1Taunts')[Math.floor((10 - left) / 1.7) % t('g1Taunts').length]} — ${t('g1Left')(Math.ceil(left))}`;
      if (!reducedMotion()) btn.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 16}px) rotate(${(Math.random() - 0.5) * 8}deg)`;
    }, 450);
  } });
  box.replaceChildren(startBtn, status);
}

// ---------- 2. Find the NO ----------
function g2() {
  const box = $('#g2-area');
  const decoys = ['ON', 'N0', 'NQ', 'MO', 'NÖ', 'OM', 'HO', 'NC', 'И0'];
  let round = 0;
  let t0 = 0;
  const status = el('p', { class: 'g-status', 'aria-live': 'polite' });
  const grid = el('div', { class: 'g2-grid' });
  const next = () => {
    round += 1;
    if (round > 5) {
      status.textContent = t('g2Done')(((performance.now() - t0) / 1000).toFixed(1));
      grid.replaceChildren();
      play('bit8');
      box.append(el('button', { type: 'button', class: 'btn btn-sm', text: t('gameAgain'), onclick: g2 }));
      return;
    }
    status.textContent = t('g2Round')(round);
    const n = 16 + round * 4;
    const target = Math.floor(Math.random() * n);
    grid.style.setProperty('--cols', String(Math.ceil(Math.sqrt(n))));
    grid.replaceChildren(...Array.from({ length: n }, (_, i) => el('button', {
      type: 'button', class: 'g2-tile', text: i === target ? 'NO' : decoys[Math.floor(Math.random() * decoys.length)],
      onclick: (e) => { if (i === target) next(); else { e.currentTarget.classList.add('wrong'); } }
    })));
  };
  const startBtn = el('button', { type: 'button', class: 'btn', text: t('gameStart'), onclick: () => { startBtn.remove(); t0 = performance.now(); next(); } });
  box.replaceChildren(startBtn, status, grid);
}

// ---------- 3. Reaction test ----------
function g3() {
  const box = $('#g3-area');
  let state = 'idle';
  let goAt = 0;
  const pad = el('button', { type: 'button', class: 'g3-pad', text: t('g3Tap') });
  const status = el('p', { class: 'g-status', 'aria-live': 'polite' });
  pad.addEventListener('click', () => {
    if (state === 'idle' || state === 'done') {
      state = 'wait';
      pad.className = 'g3-pad wait';
      pad.textContent = t('g3Wait');
      status.textContent = '';
      later(() => { if (state !== 'wait') return; state = 'go'; goAt = performance.now(); pad.className = 'g3-pad go'; pad.textContent = t('g3Go'); }, 1200 + Math.random() * 2500);
    } else if (state === 'wait') {
      clearAll();
      state = 'done';
      pad.className = 'g3-pad';
      pad.textContent = t('g3Tap');
      status.textContent = t('g3Early');
    } else if (state === 'go') {
      state = 'done';
      const ms = Math.round(performance.now() - goAt);
      pad.className = 'g3-pad';
      pad.textContent = t('g3Tap');
      status.textContent = t('g3Result')(ms);
      play('robot');
    }
  });
  box.replaceChildren(pad, status);
}

// ---------- 4. Typing race ----------
const PHRASES = {
  en: ['No, thank you.', 'Not today, Monday.', 'My answer is a polite no.', 'I am fully booked until never.', 'Request denied with love.'],
  ar: ['لا، شكرًا.', 'مو اليوم يا أول الأسبوع.', 'جوابي «لا» مهذبة.', 'جدولي ممتلئ لين أبدًا.', 'الطلب مرفوض مع الحب.']
};
function g4() {
  const box = $('#g4-area');
  const L = lang();
  const phrase = PHRASES[L][Math.floor(Math.random() * PHRASES[L].length)];
  const target = el('p', { class: 'g4-target', dir: L === 'ar' ? 'rtl' : 'ltr', text: phrase });
  const input = el('input', { type: 'text', class: 'g4-input', dir: L === 'ar' ? 'rtl' : 'ltr', placeholder: t('g4Placeholder'), 'aria-label': t('g4Placeholder'), autocomplete: 'off', spellcheck: 'false' });
  const status = el('p', { class: 'g-status', 'aria-live': 'polite' });
  let t0 = 0;
  input.addEventListener('input', () => {
    if (!t0) t0 = performance.now();
    const v = input.value;
    target.classList.toggle('bad', !phrase.startsWith(v));
    if (v.length >= phrase.length) {
      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      let right = 0;
      for (let i = 0; i < phrase.length; i += 1) if (v[i] === phrase[i]) right += 1;
      status.textContent = t('g4Result')(secs, Math.round((right / phrase.length) * 100));
      input.disabled = true;
      play('bit8');
      box.append(el('button', { type: 'button', class: 'btn btn-sm', text: t('gameAgain'), onclick: g4 }));
    }
  });
  box.replaceChildren(target, input, status);
}

export function init() { g1(); g2(); g3(); g4(); }
export function refresh() { clearAll(); init(); }
