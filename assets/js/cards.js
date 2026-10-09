// Card rendering, meme PNG export and sharing — shared by the feed, archive and meme museum.

import { el, svgNode, toast, copyText, isArabic, reducedMotion } from './lib/dom.js';
import { renderScene } from './lib/scene.js';
import { t, lang } from './i18n.js';

export const SITE = 'https://nooo.si/';

export const cardUrl = (item) => `${SITE}?card=${encodeURIComponent(item.id)}#new`;
export const cardText = (item) => [item.eyebrow ? `${item.eyebrow}: ${item.headline}` : item.headline, item.code?.output, item.lang ? `${item.lang.no}${item.lang.translit ? ` (${item.lang.translit})` : ''}` : null, item.body].filter(Boolean).join('\n');

// ---------- sharing ----------

export function openShare({ title, text, url }) {
  const dlg = document.getElementById('share-dialog');
  const enc = encodeURIComponent;
  const full = `${text}\n${url}`;
  const links = [
    ['WhatsApp', `https://wa.me/?text=${enc(full)}`],
    ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`]
  ];
  const list = dlg.querySelector('.share-list');
  list.replaceChildren(
    ...links.map(([name, href]) => el('a', { class: 'btn', href, target: '_blank', rel: 'noopener noreferrer', text: name })),
    el('button', { class: 'btn', type: 'button', text: t('copyLink'), onclick: async () => { if (await copyText(url)) toast(t('copied')); } }),
    navigator.share ? el('button', { class: 'btn btn-pop', type: 'button', text: '⋯', 'aria-label': t('share'), onclick: async () => { try { await navigator.share({ title, text, url }); } catch { /* cancelled */ } } }) : null
  );
  dlg.querySelector('.share-preview').textContent = text;
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}

// ---------- meme PNG ----------

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCaption(ctx, text, y, anchor, W) {
  if (!text) return;
  const ar = isArabic(text);
  let size = 54;
  ctx.font = `${size}px ${ar ? 'Lalezar' : 'Bungee'}, sans-serif`;
  let lines = wrapLines(ctx, text, W - 60);
  while (lines.length > 3 && size > 26) { size -= 6; ctx.font = `${size}px ${ar ? 'Lalezar' : 'Bungee'}, sans-serif`; lines = wrapLines(ctx, text, W - 60); }
  ctx.direction = ar ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, size / 6);
  ctx.strokeStyle = '#111';
  ctx.fillStyle = '#fff';
  const lh = size * 1.15;
  const start = anchor === 'top' ? y + size : y - (lines.length - 1) * lh - 12;
  lines.forEach((ln, i) => {
    ctx.strokeText(ln, W / 2, start + i * lh);
    ctx.fillText(ln, W / 2, start + i * lh);
  });
}

/** Composes a meme into a canvas. Returns the canvas. */
export async function composeMeme({ preset, top, bottom, sticker = true }) {
  const W = 800;
  const H = 600;
  try { await Promise.all([document.fonts.load('40px Bungee'), document.fonts.load('40px Lalezar')]); } catch { /* fonts optional */ }
  const svg = renderScene({ ...preset, sticker: null }, { sticker: false, idSuffix: 'export' }).replace('<svg ', `<svg width="${W}" height="${H}" `);
  const img = new Image();
  img.decoding = 'async';
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, W, H);
  if (sticker && preset.sticker) {
    const ar = isArabic(preset.sticker);
    ctx.save();
    ctx.translate(preset.layout === 'right' ? 190 : 640, top ? 170 : 110);
    ctx.rotate((preset.layout === 'right' ? -10 : 10) * Math.PI / 180);
    ctx.font = `44px ${ar ? 'Lalezar' : 'Bungee'}, sans-serif`;
    const w = ctx.measureText(preset.sticker).width + 56;
    ctx.fillStyle = '#111';
    ctx.fillRect(-w / 2 + 8, -38 + 8, w, 76);
    ctx.fillStyle = '#FF3B30';
    ctx.fillRect(-w / 2, -38, w, 76);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#111';
    ctx.strokeRect(-w / 2, -38, w, 76);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.direction = ar ? 'rtl' : 'ltr';
    ctx.fillText(preset.sticker, 0, 16);
    ctx.restore();
  }
  drawCaption(ctx, top, 18, 'top', W);
  drawCaption(ctx, bottom, H - 14, 'bottom', W);
  ctx.font = '18px Bungee, sans-serif';
  ctx.fillStyle = 'rgba(17,17,17,.75)';
  ctx.textAlign = 'right';
  ctx.direction = 'ltr';
  ctx.fillText('nooo.si', W - 16, H - 14 - (bottom ? 0 : 0));
  return canvas;
}

export async function downloadMeme(opts, filename = 'nooo-meme.png') {
  try {
    const canvas = await composeMeme(opts);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) {
    console.error(e);
    toast('PNG export failed');
  }
}

// ---------- card ----------

export function playEffect(card, effect) {
  if (!effect || effect === 'none' || reducedMotion()) return;
  card.classList.remove(`fx-card-${effect}`);
  void card.offsetWidth;
  card.classList.add(`fx-card-${effect}`);
  setTimeout(() => card.classList.remove(`fx-card-${effect}`), 1400);
}

export function buildCard(item, { big = false, badge = null } = {}) {
  const itemLang = item.locale === 'ar' ? 'ar' : 'en';
  const card = el('article', { class: `card cat-${item.category}${big ? ' card-big' : ''}`, lang: itemLang, dir: itemLang === 'ar' ? 'rtl' : 'ltr', id: `card-${item.id}`, dataset: { id: item.id } });
  const art = el('div', { class: 'card-art' });
  art.append(svgNode(renderScene(item.visualPreset, { idSuffix: item.id.slice(-8), title: `${item.headline} — ${item.body}` })));
  if (badge) art.append(el('span', { class: 'badge', text: badge }));
  card.append(art);

  const body = el('div', { class: 'card-body' });
  body.append(el('span', { class: 'chip', text: t('cats')[item.category] ?? item.category }));
  if (item.eyebrow) body.append(el('p', { class: 'eyebrow', text: item.eyebrow }));
  body.append(el(big ? 'h3' : 'h4', { class: 'card-headline', text: item.headline }));
  if (item.code) body.append(el('pre', { class: 'code', dir: 'ltr', lang: 'en', text: item.code.output }));
  if (item.lang) {
    body.append(el('p', { class: 'lang-word', dir: item.lang.dir, text: item.lang.no }, item.lang.translit ? el('small', { dir: 'ltr', text: ` (${item.lang.translit})` }) : null));
  }
  body.append(el('p', { class: 'card-reply', text: item.body }));
  if (item.kicker) body.append(el('p', { class: 'kicker', text: item.kicker }));
  if (item.verified && item.lang?.sourceUrl) {
    body.append(el('p', { class: 'verified' }, `✓ ${t('verified')} — `, el('a', { href: item.lang.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: t('source') })));
  }
  const time = new Date(item.createdAt);
  body.append(el('time', { class: 'card-time', dir: lang() === 'ar' ? 'rtl' : 'ltr', lang: lang(), datetime: item.createdAt, text: time.toLocaleString(lang() === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }));

  const actions = el('div', { class: 'card-actions' },
    el('button', { class: 'btn btn-sm', type: 'button', text: t('share'), onclick: () => openShare({ title: 'NOOO!', text: cardText(item), url: cardUrl(item) }) }),
    el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), onclick: async () => { if (await copyText(`${cardText(item)}\n${cardUrl(item)}`)) toast(t('copied')); } }),
    el('button', { class: 'btn btn-sm', type: 'button', text: t('download'), onclick: () => downloadMeme({ preset: item.visualPreset, top: item.headline, bottom: item.code ? item.code.input : item.lang ? item.lang.no : item.body }, `nooo-${item.id}.png`) }),
    item.effect && item.effect !== 'none' ? el('button', { class: 'btn btn-sm btn-ghost', type: 'button', 'aria-label': t('replay'), title: t('replay'), text: '✨', onclick: () => playEffect(card, item.effect) }) : null
  );
  body.append(actions);
  card.append(body);
  return card;
}
