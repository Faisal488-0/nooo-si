// Visual interaction layer: aurora parallax + cursor glow, hero tilt, click ripples.
// (Scroll progress, scroll reveal, card tilt and nav highlight live in polish.js.)
// All motion is skipped for prefers-reduced-motion; nothing here is needed to read or use the page.

const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const root = document.documentElement;
let raf = 0;
const pending = {};
const flush = () => {
  raf = 0;
  const aurora = document.querySelector('.bg-aurora');
  if (aurora && 'px' in pending) {
    aurora.style.setProperty('--px', pending.px.toFixed(3));
    aurora.style.setProperty('--py', pending.py.toFixed(3));
    aurora.style.setProperty('--cx', `${pending.cx}px`);
    aurora.style.setProperty('--cy', `${pending.cy}px`);
  }
  if ('sy' in pending) aurora?.style.setProperty('--sy', String(pending.sy));
  const hero = document.querySelector('.hero-stage');
  if (hero && 'hx' in pending) { hero.style.setProperty('--hx', pending.hx.toFixed(3)); hero.style.setProperty('--hy', pending.hy.toFixed(3)); }
  for (const k of Object.keys(pending)) delete pending[k];
};
const schedule = () => { if (!raf) raf = requestAnimationFrame(flush); };

function onScroll() {
  if (!reduce) { pending.sy = window.scrollY; schedule(); }
}

function onPointer(e) {
  if (reduce) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  Object.assign(pending, { px: e.clientX / w * 2 - 1, py: e.clientY / h * 2 - 1, cx: Math.round(e.clientX), cy: Math.round(e.clientY) });
  const hero = document.querySelector('.hero');
  if (hero) {
    const r = hero.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom) {
      pending.hx = (e.clientX / w) * 2 - 1;
      pending.hy = ((e.clientY - r.top) / r.height) * 2 - 1;
    } else { pending.hx = 0; pending.hy = 0; }
  }
  schedule();
}

// ---- click ripples ----
function ripple(e) {
  const layer = document.getElementById('fx-ripples');
  if (!layer || e.target.closest?.('input, select, textarea, dialog')) return;
  const s = document.createElement('span');
  s.style.left = `${e.clientX}px`;
  s.style.top = `${e.clientY}px`;
  layer.append(s);
  setTimeout(() => s.remove(), 850);
}

export function initFx() {
  if (reduce) return;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', ripple, { passive: true });
}
