// NOOO polish layer: scroll progress, reveal-on-scroll, card spotlight/tilt, current-section nav.
// Plain script (no modules, no libraries). Does nothing visual under prefers-reduced-motion,
// and elements are only hidden after this script has run (html.fx-ok), so no-JS still shows everything.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // ---- scroll progress bar ----
  if (!reduce) {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = root.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0');
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // ---- current section in the nav ----
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  if ('IntersectionObserver' in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-current'));
        const a = byId.get(e.target.id);
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) navIo.observe(s); });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  // ---- reveal on scroll ----
  root.classList.add('fx-ok');
  const done = (el) => {
    el.addEventListener('transitionend', () => { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, { once: true });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // reveal when it enters, or if a fast scroll / anchor jump already carried it above the screen
      if (!e.isIntersecting && e.boundingClientRect.bottom > 0) return;
      e.target.classList.add('in');
      done(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  const SEL = '.band .section-title, .band .section-intro, .card';
  const seen = new WeakSet();
  const prep = (scope) => {
    let i = 0;
    scope.querySelectorAll(SEL).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      // already on screen at load: leave it alone (no flash of hidden content)
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && document.readyState !== 'loading' && !el.closest('[data-lazy]')) return;
      el.classList.add('rv');
      if (el.classList.contains('card')) el.style.setProperty('--d', `${Math.min(i++, 6) * 70}ms`);
      io.observe(el);
    });
  };
  prep(document);
  // cards and sections render later (feed + lazy sections), so watch for them
  const main = document.getElementById('main') || document.body;
  new MutationObserver((muts) => {
    if (muts.some((m) => m.addedNodes.length)) prep(main);
  }).observe(main, { childList: true, subtree: true });

  // ---- card spotlight + gentle tilt (mouse only) ----
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let active = null;
  document.addEventListener('pointermove', (ev) => {
    const card = ev.target.closest?.('.card');
    if (active && active !== card) { active.classList.remove('tilt'); active = null; }
    if (!card || card.classList.contains('rv')) return;
    const MAX = card.classList.contains('card-big') ? 1.5 : 4; // degrees; wide cards tilt less
    const r = card.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    card.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX).toFixed(2)}deg`);
    card.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX).toFixed(2)}deg`);
    card.classList.add('tilt');
    active = card;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (active) { active.classList.remove('tilt'); active = null; } });
})();
