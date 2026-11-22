/* Anonymous, site-only 30-minute tab sessions. No IP, URLs, account or visitor IDs. */
(() => {
  'use strict';
  const domain = location.hostname.toLowerCase().replace(/^www\./, '');
  if (domain !== 'nooo.si') return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return;
  if (window.__noooVisitRecorded) return;
  window.__noooVisitRecorded = true;

  const endpoint = 'https://cqqozlmsvysmxdkkxjbj.supabase.co/rest/v1/website_visit_sessions';
  // Supabase publishable key, intentionally public and constrained by server-side RLS.
  const publicKey = 'sb_publishable_lJPgMCG-HAEnfRNEVJtSdg_pFaxAAuj';
  const storageKey = 'nooo_anonymous_visit_v1';
  const ttl = 30 * 60 * 1000;
  let state = null;
  try { state = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch {}
  if (state && Date.now() - state.time < ttl && state.sent) return;
  if (!state?.id || Date.now() - state.time >= ttl) {
    if (!globalThis.crypto?.randomUUID) return;
    state = { id: crypto.randomUUID(), time: Date.now(), sent: false };
  }
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  const current = state;
  fetch(endpoint, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: publicKey,
      Authorization: 'Bearer ' + publicKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ site_domain: domain, session_id: current.id })
  }).then((response) => {
    if (!response.ok && response.status !== 409) return;
    current.sent = true;
    try { sessionStorage.setItem(storageKey, JSON.stringify(current)); } catch {}
  }).catch(() => {}); // Never block or degrade the site if optional analytics is unavailable.
})();
