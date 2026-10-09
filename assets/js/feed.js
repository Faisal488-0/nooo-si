// NEW THIS HOUR + archive. Reads the static JSON written by the hourly engine.

import { el, fetchJson, toast, $ } from './lib/dom.js';
import { t, lang } from './i18n.js';
import { buildCard, playEffect } from './cards.js';

const FEED_URL = 'data/feed/latest.json';
const INDEX_URL = 'data/feed/index.json';
const POLL_MS = 10 * 60 * 1000;
const PAGE = 24;

let latest = null;
let archiveState = { items: [], shown: 0, month: null, cat: 'all' };
const listeners = new Set();
export const onFeed = (fn) => { listeners.add(fn); if (latest) fn(latest); };

function minutesAgo(iso) { return Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000)); }

function observeEffects(cards) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { const item = e.target._item; playEffect(e.target, item?.effect); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  cards.forEach((c) => io.observe(c));
}

function renderLatest() {
  const heroBox = $('#feed-hero');
  const grid = $('#feed-grid');
  if (!latest || !latest.items?.length) {
    heroBox.replaceChildren(el('p', { class: 'empty', text: t('feedEmpty') }));
    grid.replaceChildren();
    return;
  }
  const [first, ...rest] = latest.items;
  const fresh = minutesAgo(first.createdAt) <= 90;
  const big = buildCard(first, { big: true, badge: fresh ? t('badgeNew') : t('badgeLatest') });
  big._item = first;
  heroBox.replaceChildren(big);
  const cards = rest.slice(0, 11).map((it) => { const c = buildCard(it); c._item = it; return c; });
  grid.replaceChildren(...cards);
  observeEffects([big]);
}

async function loadLatest({ notify = false } = {}) {
  try {
    const data = await fetchJson(FEED_URL, { fresh: true });
    const changed = latest && data.items?.[0]?.id !== latest.items?.[0]?.id;
    latest = data;
    renderLatest();
    listeners.forEach((fn) => fn(latest));
    if (changed && notify) toast(t('freshToast'));
  } catch (e) {
    console.warn(e);
    if (!latest) $('#feed-hero').replaceChildren(el('p', { class: 'empty', text: t('feedError') }));
  }
}

export async function loadMonth(file) {
  const data = await fetchJson(file);
  return data.items ?? [];
}

/** Finds a card by id in latest or in its month archive (id starts with YYYYMMDD). */
export async function findCard(id) {
  const hit = latest?.items?.find((i) => i.id === id);
  if (hit) return hit;
  const m = /^(\d{4})(\d{2})\d{2}-/.exec(id);
  if (!m) return null;
  try { return (await loadMonth(`data/feed/archive/${m[1]}-${m[2]}.json`)).find((i) => i.id === id) ?? null; } catch { return null; }
}

async function showDeepLink() {
  const id = new URLSearchParams(location.search).get('card');
  if (!id) return;
  const item = await findCard(id);
  const box = $('#feed-shared');
  if (!item || !box) return;
  const card = buildCard(item, { big: true, badge: '🔗' });
  box.replaceChildren(card);
  box.hidden = false;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  playEffect(card, item.effect);
}

function renderArchivePage(reset) {
  const grid = $('#archive-grid');
  const list = archiveState.cat === 'all' ? archiveState.items : archiveState.items.filter((i) => i.category === archiveState.cat);
  if (reset) { grid.replaceChildren(); archiveState.shown = 0; }
  const next = list.slice(archiveState.shown, archiveState.shown + PAGE);
  grid.append(...next.map((it) => buildCard(it)));
  archiveState.shown += next.length;
  $('#archive-more').hidden = archiveState.shown >= list.length;
  if (!list.length) grid.replaceChildren(el('p', { class: 'empty', text: t('noMemes') }));
}

async function openArchive() {
  const panel = $('#archive');
  panel.hidden = false;
  const sel = $('#archive-month');
  const catSel = $('#archive-cat');
  try {
    const index = await fetchJson(INDEX_URL, { fresh: true });
    sel.replaceChildren(...index.months.map((m) => el('option', { value: m.file, text: `${m.month} (${m.count})` })));
  } catch { sel.replaceChildren(); }
  catSel.replaceChildren(el('option', { value: 'all', text: t('allCats') }), ...Object.entries(t('cats')).map(([k, v]) => el('option', { value: k, text: v })));
  const load = async () => {
    if (!sel.value) return;
    archiveState.items = await loadMonth(sel.value);
    renderArchivePage(true);
  };
  sel.onchange = load;
  catSel.onchange = () => { archiveState.cat = catSel.value; renderArchivePage(true); };
  await load();
}

export function initFeed() {
  loadLatest().then(showDeepLink);
  setInterval(() => { if (document.visibilityState === 'visible') loadLatest({ notify: true }); }, POLL_MS);
  $('#archive-open')?.addEventListener('click', openArchive);
  $('#archive-more')?.addEventListener('click', () => renderArchivePage(false));
}

export function refreshFeedLang() {
  renderLatest();
  if (!$('#archive')?.hidden) renderArchivePage(true);
}

export const getLatest = () => latest;
