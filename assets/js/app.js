// Bootstrap: language, sound controls, hero, feed; heavier sections are code-split and
// loaded only when they approach the viewport.
import { detectLang, setLang, lang, t, onLangChange } from './i18n.js';
import { $, $$ } from './lib/dom.js';
import { initHero, refreshHeroLang } from './hero.js';
import { initFeed, refreshFeedLang } from './feed.js';
import { initTicker } from './ticker.js';
import { isMuted, setMuted, getVolume, setVolume } from './sound.js';

const SECTIONS = {
  art: () => import('./sections/art.js'),
  world: () => import('./sections/world.js'),
  wit: () => import('./sections/wit.js'),
  machine: () => import('./sections/machine.js'),
  memes: () => import('./sections/memes.js'),
  sound: () => import('./sections/misc.js'),
  games: () => import('./sections/games.js')
};
const loaded = new Map();

function syncSoundUi() {
  const m = $('#mute-btn');
  m.setAttribute('aria-pressed', String(isMuted()));
  m.textContent = isMuted() ? '🔇' : '🔊';
  m.setAttribute('aria-label', isMuted() ? t('unmute') : t('mute'));
  m.title = m.getAttribute('aria-label');
  $('#volume').value = String(Math.round(getVolume() * 100));
}

function lazySections() {
  const load = async (id) => {
    if (loaded.has(id) || !SECTIONS[id]) return;
    loaded.set(id, null);
    try {
      const mod = await SECTIONS[id]();
      loaded.set(id, mod);
      await mod.init();
    } catch (e) { console.error(`section ${id} failed`, e); }
  };
  if (!('IntersectionObserver' in window)) { Object.keys(SECTIONS).forEach(load); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { load(e.target.dataset.lazy); io.unobserve(e.target); }
  }, { rootMargin: '700px 0px' });
  $$('[data-lazy]').forEach((s) => io.observe(s));
  // Hash navigation should load the target section right away.
  const fromHash = () => { const h = location.hash.slice(1); const s = document.getElementById(h)?.closest('[data-lazy]'); if (s) load(s.dataset.lazy); };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}

function boot() {
  setLang(detectLang(), { persist: false });
  $('#lang-btn').addEventListener('click', () => setLang(lang() === 'ar' ? 'en' : 'ar'));
  $('#mute-btn').addEventListener('click', () => { setMuted(!isMuted()); syncSoundUi(); });
  $('#volume').addEventListener('input', (e) => { setVolume(Number(e.target.value) / 100); if (isMuted() && Number(e.target.value) > 0) setMuted(false); syncSoundUi(); });
  $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) $('#motion-note').hidden = false;
  syncSoundUi();
  initHero();
  initFeed();
  initTicker();
  lazySections();
  onLangChange(() => {
    syncSoundUi();
    refreshHeroLang();
    refreshFeedLang();
    for (const mod of loaded.values()) mod?.refresh?.();
  });
}

boot();
