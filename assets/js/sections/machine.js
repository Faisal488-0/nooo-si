// Machines & Signals — live encoders for whatever the visitor types.
import { el, copyText, toast, $ } from '../lib/dom.js';
import { ENCODERS, toMorse } from '../lib/encoders.js';
import { t, lang } from '../i18n.js';
import { playMorse, stop } from '../sound.js';

const MAX = 120;

function render() {
  const input = $('#machine-input');
  const text = (input.value || 'NOOO').slice(0, MAX);
  const L = lang();
  $('#machine-out').replaceChildren(...ENCODERS.map((enc) => {
    const out = enc.fn(text);
    return el('div', { class: `enc enc-${enc.id}` },
      el('div', { class: 'enc-head' },
        el('h3', { text: enc.label[L] }),
        el('button', { class: 'btn btn-sm', type: 'button', text: t('copy'), 'aria-label': `${t('copy')} ${enc.label[L]}`, onclick: async () => { if (await copyText(out)) toast(t('copied')); } })),
      el('pre', { class: 'code', dir: 'ltr', lang: 'en', text: out }),
      el('p', { class: 'enc-note', text: t('machineNotes')[enc.id] }));
  }));
}

export function init() {
  const input = $('#machine-input');
  input.maxLength = MAX;
  input.addEventListener('input', render);
  const lampEl = $('#morse-lamp');
  $('#morse-play').addEventListener('click', () => {
    const code = toMorse((input.value || 'NOOO').slice(0, 40));
    const ok = playMorse(code, (on, ms) => {
      lampEl.classList.add('on');
      setTimeout(() => lampEl.classList.remove('on'), ms);
    });
    if (!ok) toast(t('unmute'));
  });
  $('#morse-stop').addEventListener('click', () => { stop(); lampEl.classList.remove('on'); });
  render();
}
export const refresh = () => render();
