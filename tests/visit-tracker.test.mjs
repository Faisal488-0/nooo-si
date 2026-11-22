import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../assets/js/visit-tracker.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function browser({ hostname = 'nooo.si', gpc = false, dnt = '0', responseStatus = 201 } = {}) {
  const saved = new Map();
  const calls = [];
  const context = {
    location: { hostname }, navigator: { globalPrivacyControl: gpc, doNotTrack: dnt },
    window: {}, crypto: { randomUUID: () => '11111111-2222-4333-8444-555555555555' },
    sessionStorage: {
      getItem: key => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value)
    },
    fetch: (url, opts) => {
      calls.push({ url, opts });
      return Promise.resolve({ ok: responseStatus < 300, status: responseStatus });
    }
  };
  return {
    calls, saved,
    run: () => runInNewContext(script, context),
    context
  };
}

test('collect one minimal anonymous session and do not collect again within the same tab', async () => {
  const b = browser();
  b.run();
  assert.equal(b.calls.length, 1);
  assert.deepEqual(JSON.parse(b.calls[0].opts.body), {
    site_domain: 'nooo.si', session_id: '11111111-2222-4333-8444-555555555555'
  });
  assert.equal(b.calls[0].opts.method, 'POST');
  await Promise.resolve();
  b.run();
  assert.equal(b.calls.length, 1);
});

test('no tracking on unrecognized domain or Global Privacy Control and Do Not Track', () => {
  for (const flags of [{ hostname: 'example.com' }, { gpc: true }, { dnt: '1' }]) {
    const b = browser(flags);
    b.run();
    assert.equal(b.calls.length, 0);
  }
});

test('only explicitly allowed analytics endpoint is added to strict CSP', () => {
  assert.match(html, /connect-src 'self' https:\/\/cqqozlmsvysmxdkkxjbj\.supabase\.co/);
  assert.match(html, /<script defer src="assets\/js\/visit-tracker\.js"><\/script>/);
});
