// Sound Lab pads + HALL OF NO walls.
import { el, $, fetchJson, shuffle } from '../lib/dom.js';
import { t, lang } from '../i18n.js';
import { play, stop, SOUND_IDS } from '../sound.js';

const ICONS = { dramatic: '🎭', robot: '🤖', cat: '🐱', alien: '👽', bit8: '👾', whisper: '🤫', echo: '🏔️', alarm: '🚨', morse: '📡', kazoo: '🎺', human: '🗣️', deep: '🎙️', tiny: '🐭', announcer: '📢', rimshot: '🥁', trombone: '📯', buzzer: '❌', airhorn: '📣', boing: '🦘', gong: '🔔' };

function renderSound() {
  $('#sound-pads').replaceChildren(...SOUND_IDS.map((id) => el('button', {
    type: 'button', class: `pad pad-${id}`, onclick: (e) => {
      const ok = play(id);
      const b = e.currentTarget;
      if (ok) { b.classList.add('playing'); setTimeout(() => b.classList.remove('playing'), 600); }
    }
  }, el('span', { class: 'pad-icon', 'aria-hidden': 'true', text: ICONS[id] }), el('span', { text: t('sounds')[id] }))));
}

let banks = null;
async function loadBanks() {
  if (banks) return banks;
  const [office, scifi, cat, monday, galactic] = await Promise.all(['office', 'scifi', 'cat', 'monday'].map((n) => fetchJson(`content/banks/${n}.json`)).concat(fetchJson('data/galactic.json')));
  banks = { office, scifi, cat, monday, galactic };
  return banks;
}

function renderHall() {
  if (!banks) return;
  const L = lang();
  const walls = {
    corporate: banks.office[L].replies,
    robot: banks.scifi[L].replies,
    cat: banks.cat[L].replies,
    galactic: banks.galactic.entries.map((g) => `${g.no} — ${g.name[L]}`),
    monday: banks.monday[L].replies
  };
  $('#hall-walls').replaceChildren(...Object.entries(walls).map(([k, lines]) => el('section', { class: `wall wall-${k}`, 'aria-label': t('walls')[k] },
    el('h3', { text: t('walls')[k] }),
    el('ul', {}, ...shuffle(lines).slice(0, 4).map((l) => el('li', { text: l }))))));
}

export async function init() {
  renderSound();
  $('#sound-stop').addEventListener('click', stop);
  await loadBanks();
  renderHall();
  $('#hall-shuffle').addEventListener('click', renderHall);
}
export function refresh() { renderSound(); renderHall(); }
