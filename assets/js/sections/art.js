// THE ART OF SAYING NO — category tabs → situations → six tones.
import { el, fetchJson, copyText, toast, $ } from '../lib/dom.js';
import { svgNode } from '../lib/dom.js';
import { renderScene } from '../lib/scene.js';
import { t, lang } from '../i18n.js';
import { openShare, SITE } from '../cards.js';

let data;
let activeCat = 0;
const activeTone = {};

function render() {
  const root = $('#art-app');
  const L = lang();
  const tabs = el('div', { class: 'tabs', role: 'tablist', 'aria-label': t('artTitle') },
    ...data.categories.map((c, i) => el('button', {
      class: `tab${i === activeCat ? ' active' : ''}`, role: 'tab', type: 'button', 'aria-selected': String(i === activeCat), id: `art-tab-${c.id}`, 'aria-controls': 'art-panel',
      text: c.title[L], onclick: () => { activeCat = i; render(); $(`#art-tab-${c.id}`)?.focus(); }
    })));
  const cat = data.categories[activeCat];
  const panel = el('div', { class: 'art-panel', id: 'art-panel', role: 'tabpanel', 'aria-labelledby': `art-tab-${cat.id}` },
    ...cat.situations.map((s, si) => {
      const key = `${cat.id}-${si}`;
      const tone = activeTone[key] ?? 'polite';
      const line = s[L][tone];
      const quote = el('blockquote', { class: 'art-line', 'aria-live': 'polite', text: line });
      return el('article', { class: 'art-card' },
        el('div', { class: 'art-icon' }, svgNode(renderScene({ character: cat.icon, expression: tone === 'dramatic' ? 'dramatic' : tone === 'sarcastic' ? 'smug' : tone === 'direct' ? 'angry' : tone === 'funny' ? 'unbothered' : 'shocked', background: 'halftone', palette: ['tomato', 'lemon', 'cyan', 'bubblegum', 'lime', 'grape'][(activeCat + si) % 6], seed: si }, { sticker: false }))),
        el('div', {},
          el('h3', { text: s.title[L] }),
          el('div', { class: 'tones', role: 'group', 'aria-label': s.title[L] },
            ...data.tones.map((tn) => el('button', { type: 'button', class: `tone${tn.id === tone ? ' active' : ''}`, 'aria-pressed': String(tn.id === tone), text: tn[L], onclick: () => { activeTone[key] = tn.id; render(); } }))),
          quote,
          el('div', { class: 'card-actions' },
            el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), onclick: async () => { if (await copyText(line)) toast(t('copied')); } }),
            el('button', { class: 'btn btn-sm', type: 'button', text: t('share'), onclick: () => openShare({ title: 'NOOO!', text: `${s.title[L]}: ${line}`, url: `${SITE}#art` }) }))
        ));
    }));
  root.replaceChildren(tabs, panel);
}

export async function init() {
  data = await fetchJson('data/art-of-no.json');
  render();
}
export const refresh = () => data && render();
