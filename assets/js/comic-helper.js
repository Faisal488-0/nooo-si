/* NOOO original comic helper. No third-party source or external requests. */
(() => {
  'use strict';
  if (window.NOOO_COMIC_HELPER_ENABLED === false || document.getElementById('nooo-friend')) return;
  const ar = document.documentElement.lang.startsWith('ar');
  const speech = ar ? ['لااا!', 'مو الحين!', 'ما يصير!', 'NOOO!'] : ['NOOO!', 'Not today!', 'No way!', 'Nope!'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const width = 58, pad = 12;
  const limit = (v, end) => Math.min(Math.max(pad, v), Math.max(pad, end - width - pad));
  const node = document.createElement('div');
  node.id = 'nooo-friend';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nooo-friend-face';
  button.setAttribute('aria-label', ar ? 'صديق NOOO الكوميدي. اسحبه أو حرّكه بأسهم لوحة المفاتيح' : 'NOOO comic buddy. Drag or move with arrow keys');
  button.innerHTML = '<span class="nooo-friend-eyes" aria-hidden="true"><i></i><i></i></span><span class="nooo-friend-mouth" aria-hidden="true"></span>';
  const bubble = document.createElement('span');
  bubble.className = 'nooo-friend-says';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  const dismiss = document.createElement('button');
  dismiss.className = 'nooo-friend-hide';
  dismiss.type = 'button';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', ar ? 'إخفاء الصديق' : 'Hide buddy');
  const restore = document.createElement('button');
  restore.className = 'nooo-friend-restore';
  restore.type = 'button';
  restore.textContent = '✦';
  restore.hidden = true;
  restore.setAttribute('aria-label', ar ? 'إظهار الصديق' : 'Show buddy');
  node.append(button, bubble, dismiss, restore);
  document.body.append(node);
  let x = limit(innerWidth - width - 20, innerWidth), y = limit(innerHeight - width - 120, innerHeight);
  let dragged = null, wasDragged = false, hidden = false, tipTimeout;
  const render = () => {
    x = limit(x, innerWidth); y = limit(y, innerHeight);
    node.style.left = x + 'px'; node.style.top = y + 'px';
    node.classList.toggle('is-hidden', hidden);
    restore.hidden = !hidden;
    button.hidden = hidden;
    dismiss.hidden = hidden;
    if (hidden) bubble.textContent = '';
  };
  const say = () => {
    if (hidden) return;
    const random = Math.floor(Math.random() * speech.length);
    bubble.textContent = speech[random];
    node.classList.add('is-reacting');
    clearTimeout(tipTimeout);
    tipTimeout = setTimeout(() => { bubble.textContent = ''; node.classList.remove('is-reacting'); }, motion.matches ? 1200 : 2400);
  };
  button.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragged = { x, y, px: e.clientX, py: e.clientY };
    wasDragged = false;
    button.setPointerCapture(e.pointerId);
  });
  button.addEventListener('pointermove', e => {
    if (!dragged) return;
    const dx = e.clientX - dragged.px, dy = e.clientY - dragged.py;
    if (Math.abs(dx) + Math.abs(dy) > 6) wasDragged = true;
    if (wasDragged) { x = dragged.x + dx; y = dragged.y + dy; render(); }
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => { dragged = null; });
  button.addEventListener('click', () => { if (wasDragged) { wasDragged = false; return; } say(); });
  button.addEventListener('keydown', e => {
    const dxdy = { ArrowUp: [0, -24], ArrowDown: [0, 24], ArrowLeft: [-24, 0], ArrowRight: [24, 0] }[e.key];
    if (dxdy) { e.preventDefault(); x += dxdy[0]; y += dxdy[1]; render(); }
  });
  dismiss.addEventListener('click', () => { hidden = true; render(); restore.focus(); });
  restore.addEventListener('click', () => { hidden = false; render(); button.focus(); });
  document.getElementById('nooo-btn')?.addEventListener('click', say);
  addEventListener('resize', render, { passive: true });
  render();
})();