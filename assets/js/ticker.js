// NOOO NEWS — a scrolling ticker of people and events that said "No".
// Direction follows the writing system of the chosen language: right-to-left languages (Arabic, Persian)
// travel left → right so their text enters from its beginning; left-to-right languages travel right → left.
// To flip that rule, change MOTION below.
import { el, fetchJson, $ } from './lib/dom.js';
import { lang as siteLang, onLangChange } from './i18n.js';

const MOTION = { rtl: 'right', ltr: 'left' }; // writing direction → direction the text travels
const SPEED = 85;                              // pixels per second

let data = null;
let current = 'ar';
let paused = false;

const meta = () => data.languages.find((l) => l.id === current) ?? data.languages[0];

function item(entry, { hidden }) {
  const l = meta();
  const t = entry.text[l.id];
  return el('a', {
    class: 'tk-item', href: entry.source, target: '_blank', rel: 'noopener noreferrer',
    lang: l.id, dir: l.dir, tabindex: hidden ? '-1' : null,
    'aria-label': `${entry.year}. ${t.who}. ${t.what}. ${l.src}`
  },
    el('span', { class: 'tk-year', text: entry.year }),
    el('span', { class: 'tk-who', text: t.who }),
    el('span', { class: 'tk-what', text: t.what }),
    el('span', { class: 'tk-sep', 'aria-hidden': 'true', text: '✕' }));
}

function build() {
  const l = meta();
  const root = $('#ticker');
  const motion = MOTION[l.dir];
  root.dataset.motion = motion;
  root.lang = l.id;

  $('#tk-label').textContent = l.label;
  $('#tk-hint').textContent = l.hint;
  root.setAttribute('aria-label', l.region);
  const sel = $('#tk-lang');
  sel.value = l.id;
  const btn = $('#tk-pause');
  btn.setAttribute('aria-pressed', String(paused));
  btn.setAttribute('aria-label', paused ? l.play : l.pause);
  btn.title = btn.getAttribute('aria-label');
  btn.textContent = paused ? '▶' : '❚❚';
  root.classList.toggle('is-paused', paused);

  const vp = $('#tk-viewport');
  // The track starts on the side the text enters from, so it must lay out in that direction.
  vp.style.direction = motion === 'left' ? 'ltr' : 'rtl';
  const group = (hidden) => el('div', { class: 'tk-group', 'aria-hidden': hidden ? 'true' : null }, ...data.entries.map((e) => item(e, { hidden })));
  const track = el('div', { class: 'tk-track' }, group(false), group(true));
  vp.replaceChildren(track);
  // Duration from the real width so the speed is the same in every language.
  requestAnimationFrame(() => {
    const w = track.firstElementChild.getBoundingClientRect().width;
    root.style.setProperty('--tk-dur', `${Math.max(40, Math.round(w / SPEED))}s`);
  });
}

function setTickerLang(id) {
  if (!data.languages.some((l) => l.id === id)) return;
  current = id;
  build();
}

export async function initTicker() {
  const root = $('#ticker');
  if (!root) return;
  try { data = await fetchJson('data/no-history.json'); } catch (e) { root.hidden = true; console.error('ticker failed', e); return; }
  const sel = $('#tk-lang');
  sel.replaceChildren(...data.languages.map((l) => el('option', { value: l.id, text: l.name, lang: l.id })));
  sel.addEventListener('change', () => setTickerLang(sel.value));
  $('#tk-pause').addEventListener('click', () => { paused = !paused; build(); });
  onLangChange((l) => setTickerLang(l)); // switching the site language switches the ticker too
  current = siteLang() === 'en' ? 'en' : 'ar';
  build();
}
