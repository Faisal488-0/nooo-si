import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { generateNext, makeRng, PoolExhaustedError, contentHash, jaccard, tokens } from '../scripts/lib/engine.mjs';
import { loadBanks, loadHistory } from '../scripts/lib/store.mjs';
import { validateAll } from '../scripts/validate-content.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GEN = join(ROOT, 'scripts', 'hourly-content-generator.mjs');

function sandbox({ emptyFeed = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'nooo-'));
  for (const p of ['content', 'data', 'assets', 'scripts', 'CNAME', 'index.html', 'package.json']) cpSync(join(ROOT, p), join(dir, p), { recursive: true });
  if (emptyFeed) rmSync(join(dir, 'data', 'feed'), { recursive: true, force: true });
  return dir;
}

const run = (dir, ...args) => spawnSync(process.execPath, [join(dir, 'scripts', 'hourly-content-generator.mjs'), '--root', dir, ...args], { encoding: 'utf8' });

test('two consecutive runs add two different, valid cards', () => {
  const dir = sandbox();
  const r1 = run(dir, '--now', '2026-10-09T10:17:00Z');
  const r2 = run(dir, '--now', '2026-10-09T11:17:00Z');
  assert.equal(r1.status, 0, r1.stderr);
  assert.equal(r2.status, 0, r2.stderr);
  const history = loadHistory(dir);
  assert.equal(history.length, 2);
  assert.notEqual(history[0].contentHash, history[1].contentHash);
  assert.notEqual(`${history[0].headline}${history[0].body}`, `${history[1].headline}${history[1].body}`);
  assert.notEqual(history[0].category, history[1].category, 'categories rotate');
  assert.deepEqual(validateAll(dir, { now: Date.parse('2026-10-09T12:00:00Z') }), []);
  const latest = JSON.parse(readFileSync(join(dir, 'data/feed/latest.json'), 'utf8'));
  assert.equal(latest.items[0].id, history[0].id, 'newest first');
});

test('500 simulated hours: no duplicate hashes, no near-duplicates, all categories used', () => {
  const banks = loadBanks(ROOT);
  const history = [];
  const rng = makeRng(7);
  let t = Date.parse('2026-10-09T00:17:00Z');
  for (let i = 0; i < 500; i += 1) {
    const { item } = generateNext({ banks, history, now: new Date(t), rng });
    history.unshift(item);
    t += 3600_000;
  }
  const hashes = new Set(history.map((h) => h.contentHash));
  assert.equal(hashes.size, 500);
  for (const h of history) assert.equal(h.contentHash, contentHash(h));
  const cats = new Set(history.map((h) => h.category));
  assert.equal(cats.size, 10);
  // similarity guard: no pair within the window is >= 0.8 similar
  const toks = history.slice(0, 120).map((h) => tokens(`${h.headline} ${h.body} ${h.code?.input ?? ''}`));
  for (let i = 0; i < toks.length; i += 1) for (let j = i + 1; j < toks.length; j += 1) {
    if (history[i].locale === history[j].locale) assert.ok(jaccard(toks[i], toks[j]) < 0.8, `${history[i].id} ~ ${history[j].id}`);
  }
});

test('exhausted pool fails loudly with CONTENT_POOL_EXHAUSTED instead of recycling', () => {
  const banks = loadBanks(ROOT);
  // Shrink every stream to a tiny pool.
  for (const b of Object.values(banks.text)) for (const l of ['ar', 'en']) { b[l].asks = b[l].asks.slice(0, 1); b[l].replies = b[l].replies.slice(0, 1); }
  for (const c of ['binary', 'morse']) for (const l of ['ar', 'en']) { const m = banks.machine[c][l]; m.phrases = m.phrases.slice(0, 1); m.headlines = m.headlines.slice(0, 1); m.replies = m.replies.slice(0, 1); }
  for (const l of ['ar', 'en']) { const g = banks.machine.global[l]; g.headlines = g.headlines.slice(0, 1); g.replies = g.replies.slice(0, 1); }
  banks.languages = { ...banks.languages, languages: banks.languages.languages.slice(0, 1) };
  const history = [];
  const rng = makeRng(1);
  let made = 0;
  assert.throws(() => {
    for (let i = 0; i < 100; i += 1) {
      const { item } = generateNext({ banks, history, now: new Date(Date.UTC(2026, 9, 9, i % 24)), rng });
      history.unshift(item);
      made += 1;
    }
  }, (err) => err instanceof PoolExhaustedError && err.code === 'CONTENT_POOL_EXHAUSTED');
  assert.equal(made, 20, 'exactly one card per stream before exhaustion');
});

test('CLI exits 3 and writes nothing when the pool is exhausted', () => {
  const dir = sandbox();
  const tiny = (f, mut) => { const p = join(dir, 'content/banks', f); const j = JSON.parse(readFileSync(p, 'utf8')); mut(j); writeFileSync(p, JSON.stringify(j)); };
  for (const f of ['boss', 'friends', 'relationship', 'cat', 'scifi', 'office', 'monday']) tiny(`${f}.json`, (j) => { for (const l of ['ar', 'en']) { j[l].asks = []; j[l].replies = []; } });
  tiny('machine.json', (j) => { for (const c of ['binary', 'morse']) for (const l of ['ar', 'en']) j[c][l].phrases = []; for (const l of ['ar', 'en']) j.global[l].replies = []; });
  const r = run(dir);
  assert.equal(r.status, 3);
  assert.match(r.stderr, /CONTENT_POOL_EXHAUSTED/);
  assert.equal(loadHistory(dir).length, 0);
});

test('validator rejects tampered, broken or unsafe content', () => {
  const dir = sandbox();
  for (let i = 0; i < 12; i += 1) assert.equal(run(dir, '--now', new Date(Date.UTC(2026, 9, 9, i, 17)).toISOString()).status, 0);
  const now = Date.parse('2026-10-10T00:00:00Z');
  assert.deepEqual(validateAll(dir, { now }), []);

  const month = join(dir, 'data/feed/archive/2026-10.json');
  const original = readFileSync(month, 'utf8');
  const edit = (fn) => { const j = JSON.parse(original); fn(j.items); writeFileSync(month, JSON.stringify(j)); };

  edit((items) => { items[0].body = 'Changed after hashing'; });
  assert.ok(validateAll(dir, { now }).some((e) => /contentHash/.test(e)), 'hash mismatch caught');

  edit((items) => { items[1] = { ...items[0] }; });
  assert.ok(validateAll(dir, { now }).some((e) => /duplicate/.test(e)), 'duplicate caught');

  edit((items) => { const b = items.find((x) => x.category === 'binary'); b.code.output = '0101'; b.contentHash = contentHash(b); });
  assert.ok(validateAll(dir, { now }).some((e) => /encoding is wrong/.test(e)), 'bad binary caught');

  edit((items) => { items[0].body = 'Shut up and say no'; items[0].contentHash = contentHash(items[0]); });
  assert.ok(validateAll(dir, { now }).some((e) => /blocked terms/.test(e)), 'insult caught');

  edit((items) => { items[0].headline = '<img src=x onerror=alert(1)>'; items[0].contentHash = contentHash(items[0]); });
  assert.ok(validateAll(dir, { now }).some((e) => /angle brackets/.test(e)), 'markup injection caught');

  edit((items) => { delete items[0].visualPreset; });
  assert.ok(validateAll(dir, { now }).some((e) => /visualPreset/.test(e)), 'missing field caught');

  writeFileSync(month, original);
  writeFileSync(join(dir, 'CNAME'), 'evil.example');
  assert.ok(validateAll(dir, { now }).some((e) => /CNAME/.test(e)), 'CNAME change caught');
});

test('global cards only use verified languages with a source', () => {
  const banks = loadBanks(ROOT);
  const history = [];
  const rng = makeRng(99);
  for (let i = 0; i < 60; i += 1) {
    const { item } = generateNext({ banks, history, now: new Date(Date.UTC(2026, 9, 9, 0) + i * 3600_000), rng });
    history.unshift(item);
  }
  const globals = history.filter((h) => h.category === 'global');
  assert.ok(globals.length >= 5);
  for (const g of globals) {
    const lang = banks.languages.languages.find((l) => l.id === g.lang.id);
    assert.equal(g.lang.no, lang.no);
    assert.equal(g.verified, true);
    assert.match(g.lang.sourceUrl, /^https:\/\//);
  }
});

test('world laughs data: every joke has a region + both languages, every quote has a source', async () => {
  const { readFileSync } = await import('node:fs');
  const wit = JSON.parse(readFileSync(new URL('../data/wit.json', import.meta.url), 'utf8'));
  assert.ok(wit.jokes.length >= 25 && wit.quotes.length >= 10);
  const regions = new Set(wit.jokes.map((j) => j.region));
  assert.ok(regions.size >= 15, 'jokes should cover many parts of the world');
  for (const j of wit.jokes) assert.ok(wit.regions[j.region] && j.ar && j.en, j.id);
  for (const q of wit.quotes) assert.ok(q.source && q.text.ar && q.text.en && q.take.ar && q.take.en, q.id);
});
