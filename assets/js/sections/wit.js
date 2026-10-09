// THE WORLD LAUGHS — jokes from around the world + quotes from scholars, sages and satirists.
import { el, fetchJson, copyText, toast, $ } from '../lib/dom.js';
import { t, lang } from '../i18n.js';
import { openShare, SITE } from '../cards.js';
import { speak, rimshot, canSpeak } from '../sound.js';

let data;
let tab = 'jokes';
let region = 'all';
let featured = null;
let shown = 8;

const jokeText = (j) => j[lang()];

function jokeCard(j, big = false) {
  const L = lang();
  const label = `${data.regions[j.region][L]}`;
  return el('article', { class: `joke-card${big ? ' joke-big' : ''}` },
    el('div', { class: 'joke-meta' },
      el('span', { class: 'joke-region', text: label }),
      el('span', { class: `kind ${j.kind === 'folk' ? 'documented' : 'nooo-original'}`, text: j.kind === 'folk' ? t('kindFolk') : t('kindOriginal') })),
    el('p', { class: 'joke-text', text: jokeText(j) }),
    el('div', { class: 'card-actions' },
      canSpeak() ? el('button', { class: 'btn btn-sm', type: 'button', text: t('witRead'), onclick: () => speak(jokeText(j), { rate: 0.95 }) }) : null,
      el('button', { class: 'btn btn-sm', type: 'button', text: t('witDrum'), onclick: () => rimshot() }),
      el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), onclick: async () => { if (await copyText(jokeText(j))) toast(t('copied')); } }),
      el('button', { class: 'btn btn-sm', type: 'button', text: t('share'), onclick: () => openShare({ title: 'NOOO!', text: `${jokeText(j)} (${label})`, url: `${SITE}#wit` }) })));
}

function quoteCard(q) {
  const L = lang();
  const freeTr = q.original === 'en-tr';
  return el('figure', { class: 'quote-card' },
    el('blockquote', { class: 'quote-text', lang: q.original === 'ar' ? 'ar' : q.original === 'en' ? 'en' : L, text: q.text[L] }),
    el('figcaption', {},
      el('strong', { text: q.author[L] }), ' — ', el('span', { text: q.role[L] })),
    el('p', { class: 'quote-source', text: `${t('witSource')}: ${q.source}${freeTr ? ` · ${t('witFreeTr')}` : ''}` }),
    el('p', { class: 'quote-take', text: `${t('witTake')}: ${q.take[L]}` }),
    el('div', { class: 'card-actions' },
      canSpeak() ? el('button', { class: 'btn btn-sm', type: 'button', text: t('witRead'), onclick: () => speak(q.text[L]) }) : null,
      el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), onclick: async () => { if (await copyText(`“${q.text[L]}” — ${q.author[L]}`)) toast(t('copied')); } }),
      el('button', { class: 'btn btn-sm', type: 'button', text: t('share'), onclick: () => openShare({ title: 'NOOO!', text: `“${q.text[L]}” — ${q.author[L]}`, url: `${SITE}#wit` }) })));
}

function render() {
  const L = lang();
  const tabs = el('div', { class: 'tabs', role: 'group', 'aria-label': t('witTitle') },
    ...[['jokes', t('witJokes')], ['quotes', t('witQuotes')]].map(([id, label]) => el('button', {
      class: `tab${tab === id ? ' active' : ''}`, type: 'button', 'aria-pressed': String(tab === id), text: label,
      onclick: () => { tab = id; render(); }
    })));
  const out = [tabs];
  if (tab === 'jokes') {
    const used = [...new Set(data.jokes.map((j) => j.region))];
    const list = data.jokes.filter((j) => region === 'all' || j.region === region);
    if (!featured || !data.jokes.includes(featured)) featured = data.jokes[Math.floor(Math.random() * data.jokes.length)];
    out.push(
      el('div', { class: 'wit-random' },
        el('button', { class: 'btn btn-big btn-pop', type: 'button', text: t('witRandom'), onclick: () => { featured = data.jokes[Math.floor(Math.random() * data.jokes.length)]; render(); rimshot(); $('.joke-big')?.focus?.(); } }),
        jokeCard(featured, true)),
      el('div', { class: 'chips', role: 'group', 'aria-label': t('witRegion') },
        el('button', { class: `chip-btn${region === 'all' ? ' active' : ''}`, type: 'button', 'aria-pressed': String(region === 'all'), text: t('witAll'), onclick: () => { region = 'all'; shown = 8; render(); } }),
        ...used.map((r) => el('button', { class: `chip-btn${region === r ? ' active' : ''}`, type: 'button', 'aria-pressed': String(region === r), text: data.regions[r][L], onclick: () => { region = r; shown = 8; render(); } }))),
      el('p', { class: 'count', 'aria-live': 'polite', text: t('witCount')(list.length) }),
      el('div', { class: 'joke-grid' }, ...list.slice(0, shown).map((j) => jokeCard(j))),
      list.length > shown ? el('div', { class: 'center' }, el('button', { class: 'btn', type: 'button', text: `${t('loadMore')} (${list.length - shown})`, onclick: () => { shown += 8; render(); } })) : null,
      el('p', { class: 'fineprint', text: data.meta.jokeNote[L] }));
  } else {
    out.push(el('div', { class: 'quote-grid' }, ...data.quotes.map(quoteCard)), el('p', { class: 'fineprint', text: data.meta.quoteNote[L] }));
  }
  $('#wit-app').replaceChildren(...out);
}

export async function init() {
  data = await fetchJson('data/wit.json');
  render();
}
export const refresh = () => data && render();
