// MEME MUSEUM (every feed card is a meme) + MEME MAKER (original SVG scenes → PNG on device).
import { el, svgNode, $, shuffle } from '../lib/dom.js';
import { renderScene, CHARACTERS, EXPRESSIONS, BACKGROUNDS, PALETTES } from '../lib/scene.js';
import { t, lang } from '../i18n.js';
import { onFeed, loadMonth } from '../feed.js';
import { buildCard, composeMeme, downloadMeme, playEffect } from '../cards.js';

let pool = [];
let filter = 'all';
let query = '';
let preview = null;

const maker = { character: 'cat', expression: 'shocked', background: 'burst', palette: 'lemon', sticker: 'NOOO!', layout: 'center', top: null, bottom: null, pos: 'both', seed: 7 };

function renderFilters() {
  const cats = ['all', ...Object.keys(t('cats'))];
  $('#meme-filters').replaceChildren(...cats.map((c) => el('button', {
    type: 'button', class: `chip-btn${c === filter ? ' active' : ''}`, 'aria-pressed': String(c === filter),
    text: c === 'all' ? t('allCats') : t('cats')[c], onclick: () => { filter = c; renderFilters(); renderGrid(); }
  })));
}

function filtered() {
  const q = query.trim().toLowerCase();
  return pool.filter((i) => (filter === 'all' || i.category === filter) && (!q || `${i.headline} ${i.body} ${i.eyebrow ?? ''}`.toLowerCase().includes(q)));
}

function renderGrid() {
  const list = filtered();
  const grid = $('#meme-grid');
  if (!list.length) { grid.replaceChildren(el('p', { class: 'empty', text: t('noMemes') })); return; }
  grid.replaceChildren(...list.slice(0, 30).map((it) => el('button', {
    type: 'button', class: 'meme-tile', 'aria-label': it.headline, lang: it.locale, onclick: () => openPreview(it)
  }, svgNode(renderScene(it.visualPreset, { idSuffix: `m${it.id.slice(-8)}` })), el('span', { class: 'meme-cap', dir: it.locale === 'ar' ? 'rtl' : 'ltr', text: it.headline }))));
}

function openPreview(item) {
  const dlg = $('#meme-dialog');
  const card = buildCard(item, { big: true });
  dlg.querySelector('.dialog-body').replaceChildren(card);
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  playEffect(card, item.effect);
}

function options(select, values, labels) {
  select.replaceChildren(...values.map((v) => el('option', { value: v, text: labels?.[v] ?? v })));
}

async function renderMaker() {
  const L = lang();
  if (maker.top === null) maker.top = t('makerDefaultTop');
  if (maker.bottom === null) maker.bottom = t('makerDefaultBottom');
  const svgBox = $('#maker-preview');
  svgBox.replaceChildren(svgNode(renderScene({ ...maker, sticker: maker.sticker || null }, { idSuffix: 'maker' })));
  const top = maker.pos === 'bottom' ? '' : maker.top;
  const bottom = maker.pos === 'top' ? '' : maker.bottom;
  $('#maker-top-cap').textContent = top;
  $('#maker-bottom-cap').textContent = bottom;
  $('#maker-top-cap').dir = /[؀-ۿ]/.test(top) ? 'rtl' : 'ltr';
  $('#maker-bottom-cap').dir = /[؀-ۿ]/.test(bottom) ? 'rtl' : 'ltr';
  void L;
}

function bindMaker() {
  const sel = (id) => $(`#${id}`);
  const setOpts = () => {
    options(sel('mk-char'), CHARACTERS, t('chars'));
    options(sel('mk-expr'), EXPRESSIONS, t('exprs'));
    options(sel('mk-bg'), BACKGROUNDS, t('bgs'));
    options(sel('mk-pal'), Object.keys(PALETTES));
    options(sel('mk-pos'), ['both', 'top', 'bottom'], { both: t('posBoth'), top: t('posTop'), bottom: t('posBottom') });
    sel('mk-char').value = maker.character; sel('mk-expr').value = maker.expression; sel('mk-bg').value = maker.background; sel('mk-pal').value = maker.palette; sel('mk-pos').value = maker.pos;
  };
  setOpts();
  sel('mk-top').value = maker.top ?? t('makerDefaultTop');
  sel('mk-bottom').value = maker.bottom ?? t('makerDefaultBottom');
  sel('mk-sticker').value = maker.sticker;
  const map = { 'mk-char': 'character', 'mk-expr': 'expression', 'mk-bg': 'background', 'mk-pal': 'palette', 'mk-pos': 'pos', 'mk-top': 'top', 'mk-bottom': 'bottom', 'mk-sticker': 'sticker' };
  for (const [id, key] of Object.entries(map)) sel(id).addEventListener('input', (e) => { maker[key] = e.target.value.slice(0, 80); renderMaker(); });
  sel('mk-shuffle').addEventListener('click', () => {
    maker.character = shuffle(CHARACTERS)[0];
    maker.expression = shuffle(EXPRESSIONS)[0];
    maker.background = shuffle(BACKGROUNDS)[0];
    maker.palette = shuffle(Object.keys(PALETTES))[0];
    maker.seed = Math.floor(Math.random() * 1e6);
    setOpts();
    renderMaker();
  });
  sel('mk-download').addEventListener('click', () => downloadMeme({
    preset: { ...maker, sticker: maker.sticker || null },
    top: maker.pos === 'bottom' ? '' : maker.top,
    bottom: maker.pos === 'top' ? '' : maker.bottom
  }, 'my-nooo-meme.png'));
  bindMaker.setOpts = setOpts;
}

export async function init() {
  $('#meme-search').addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
  $('#meme-random').addEventListener('click', () => { const list = filtered(); if (list.length) openPreview(list[Math.floor(Math.random() * list.length)]); });
  onFeed(async (latest) => {
    pool = latest.items ?? [];
    // Pull in the current month too, so the museum grows beyond the latest 30.
    const m = pool[0]?.createdAt?.slice(0, 7);
    if (m) { try { const more = await loadMonth(`data/feed/archive/${m}.json`); const ids = new Set(pool.map((i) => i.id)); pool = pool.concat(more.filter((i) => !ids.has(i.id))); } catch { /* fine */ } }
    renderGrid();
  });
  renderFilters();
  bindMaker();
  renderMaker();
  void composeMeme;
}

export function refresh() {
  renderFilters();
  renderGrid();
  bindMaker.setOpts?.();
  renderMaker();
}
