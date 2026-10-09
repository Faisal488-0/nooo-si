// World encyclopedia (verified human languages) + GALACTIC NOOO (fictional, clearly labelled).
import { el, fetchJson, copyText, toast, svgNode, $ } from '../lib/dom.js';
import { renderScene } from '../lib/scene.js';
import { t, lang } from '../i18n.js';
import { openShare, SITE } from '../cards.js';

let langs;
let galactic;
let query = '';
let sort = 'name';

const isLatin = (s) => /^[\p{Script=Latin}\s'ʻ’.-]+$/u.test(s);

function renderWorld() {
  const L = lang();
  $('#world-intro').textContent = t('worldIntro')(langs.languages.length);
  const q = query.trim().toLowerCase();
  let list = langs.languages.filter((l) => !q || [l.name.en, l.name.ar, l.no, l.translit].some((v) => String(v).toLowerCase().includes(q)));
  const coll = new Intl.Collator(L);
  if (sort === 'name') list.sort((a, b) => coll.compare(a.name[L], b.name[L]));
  if (sort === 'len') list.sort((a, b) => Array.from(a.no).length - Array.from(b.no).length || coll.compare(a.name[L], b.name[L]));
  if (sort === 'script') list.sort((a, b) => Number(isLatin(a.no)) - Number(isLatin(b.no)) || coll.compare(a.name[L], b.name[L]));
  $('#world-count').textContent = t('results')(list.length);
  $('#world-list').replaceChildren(...list.map((l) => {
    const share = `${l.name[L]}: ${l.no}${l.translit ? ` (${l.translit})` : ''}`;
    return el('li', { class: 'lang-card' },
      el('div', { class: 'lang-top' },
        el('span', { class: 'lang-name', text: l.name[L] }),
        el('span', { class: 'dir-badge', title: t('dirLabel')[l.dir], text: l.dir.toUpperCase() })),
      el('p', { class: 'lang-no', dir: l.dir, lang: l.id, text: l.no }),
      l.translit ? el('p', { class: 'lang-translit', dir: 'ltr', text: l.translit }) : null,
      l.note ? el('p', { class: 'lang-note', text: l.note[L] }) : null,
      el('div', { class: 'card-actions' },
        el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), 'aria-label': `${t('copy')} ${l.no}`, onclick: async () => { if (await copyText(l.no)) toast(t('copied')); } }),
        el('button', { class: 'btn btn-sm', type: 'button', text: t('share'), onclick: () => openShare({ title: 'NOOO!', text: share, url: `${SITE}#world` }) }),
        el('a', { class: 'src', href: langs.meta.sources[l.source], target: '_blank', rel: 'noopener noreferrer', text: t('source') })));
  }));
  $('#world-missing').textContent = langs.meta.notIncluded[L];
}

function renderGalactic() {
  const L = lang();
  $('#galactic-grid').replaceChildren(...galactic.entries.map((g, i) => el('article', { class: `gal-card ${g.kind}` },
    el('div', { class: 'gal-art' }, svgNode(renderScene({ character: g.alien, expression: ['smug', 'angry', 'unbothered', 'shocked', 'dramatic', 'sleepy'][i % 6], background: 'space', palette: ['night', 'grape', 'cyan', 'mint', 'bubblegum'][i % 5], sticker: g.no.length < 12 ? g.no : 'NO', seed: 50 + i }))),
    el('span', { class: `kind ${g.kind}`, text: g.kind === 'documented' ? t('kindDocumented') : t('kindOriginal') }),
    el('h3', { text: g.name[L] }),
    el('p', { class: 'gal-no', dir: 'ltr', lang: 'und', text: g.no }),
    g.note ? el('p', { class: 'lang-note', text: g.note[L] }) : null,
    g.source ? el('a', { class: 'src', href: galactic.meta.sources[g.source], target: '_blank', rel: 'noopener noreferrer', text: t('source') }) : null)));
}

export async function init() {
  [langs, galactic] = await Promise.all([fetchJson('data/languages.json'), fetchJson('data/galactic.json')]);
  $('#world-search').addEventListener('input', (e) => { query = e.target.value; renderWorld(); });
  $('#world-sort').addEventListener('change', (e) => { sort = e.target.value; renderWorld(); });
  refresh();
}

export function refresh() {
  if (!langs) return;
  const sel = $('#world-sort');
  sel.replaceChildren(el('option', { value: 'name', text: t('sortName') }), el('option', { value: 'len', text: t('sortLen') }), el('option', { value: 'script', text: t('sortScript') }));
  sel.value = sort;
  renderWorld();
  renderGalactic();
}

export const getLanguages = () => langs;
