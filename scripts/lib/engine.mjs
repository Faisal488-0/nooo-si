// NOOO HOURLY CREATIVE ENGINE — pure composition logic (no I/O here, so it is easy to test).
//
// Every card is a NEW combination of pre-written, reviewed lines from content/banks/.
// Uniqueness: SHA-256 of the meaningful text (category|locale|headline|body|code) must never
// repeat, and a similarity guard rejects near-duplicates. When no acceptable combination
// is left, the engine reports CONTENT_POOL_EXHAUSTED instead of recycling old cards.

import { createHash } from 'node:crypto';
import { toBinary, toMorse, morseSupported } from '../../assets/js/lib/encoders.js';

export const ENGINE_VERSION = 'template-engine-v1';
export const CATEGORIES = ['boss', 'friends', 'relationship', 'cat', 'scifi', 'binary', 'morse', 'office', 'monday', 'global'];
export const TEXT_CATEGORIES = ['boss', 'friends', 'relationship', 'cat', 'scifi', 'office', 'monday'];
export const LOCALES = ['ar', 'en'];
export const SIMILARITY_THRESHOLD = 0.8;
export const SIMILARITY_WINDOW = 400;

export class PoolExhaustedError extends Error {
  constructor(message) {
    super(message);
    this.code = 'CONTENT_POOL_EXHAUSTED';
  }
}

// ---------- small utilities ----------

export function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Deterministic PRNG (mulberry32) so tests can reproduce a run. */
export function makeRng(seed) {
  let a = (Number(seed) >>> 0) || 0x9e3779b9;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

export function tokens(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1)
  );
}

export function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export function contentHash(item) {
  const code = item.code ? `${item.code.type}:${item.code.input}:${item.code.output}` : '';
  return sha256([item.category, item.locale, item.headline, item.body, code].join('|'));
}

export function textForSimilarity(item) {
  return [item.headline, item.body, item.code?.input ?? ''].join(' ');
}

// ---------- candidate enumeration ----------

/**
 * Returns every possible card "plan" for a category/locale as lightweight objects.
 * Each plan has `parts` (indices into banks) used for diversity scoring.
 */
export function enumeratePlans(category, locale, banks) {
  const plans = [];
  if (TEXT_CATEGORIES.includes(category)) {
    const b = banks.text[category][locale];
    b.asks.forEach((ask, ai) => {
      b.replies.forEach((reply, ri) => {
        plans.push({
          parts: { ask: ai, reply: ri },
          headline: ask,
          body: reply,
          eyebrow: b.headlinePrefix
        });
      });
    });
  } else if (category === 'binary' || category === 'morse') {
    const b = banks.machine[category][locale];
    const encode = category === 'binary' ? toBinary : toMorse;
    b.phrases.forEach((phrase, pi) => {
      if (category === 'morse' && !morseSupported(phrase)) return;
      b.headlines.forEach((tpl, hi) => {
        b.replies.forEach((reply, ri) => {
          plans.push({
            parts: { phrase: pi, headline: hi, reply: ri },
            headline: tpl.replace('{phrase}', phrase),
            body: reply,
            code: { type: category, input: phrase, output: encode(phrase) }
          });
        });
      });
    });
  } else if (category === 'global') {
    const b = banks.machine.global[locale];
    banks.languages.languages.forEach((lang, li) => {
      b.headlines.forEach((tpl, hi) => {
        b.replies.forEach((reply, ri) => {
          plans.push({
            parts: { lang: li, headline: hi, reply: ri },
            headline: tpl.replace('{lang}', lang.name[locale]),
            body: reply,
            lang: {
              id: lang.id,
              name: lang.name[locale],
              no: lang.no,
              translit: lang.translit || '',
              dir: lang.dir,
              sourceUrl: banks.languages.meta.sources[lang.source]
            }
          });
        });
      });
    });
  } else {
    throw new Error(`Unknown category: ${category}`);
  }
  return plans;
}

// ---------- visuals ----------

export function chooseVisual(category, locale, banks, history, rng) {
  const v = banks.visual;
  const chars = category in banks.text ? banks.text[category].characters : banks.machine[category].characters;
  const recent = new Set(
    history.slice(0, 60).map((it) => it.visualPreset && [it.visualPreset.background, it.visualPreset.palette, it.visualPreset.character, it.visualPreset.expression].join('/'))
  );
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const preset = {
      background: pick(v.backgrounds, rng),
      palette: pick(v.palettes, rng),
      character: pick(chars, rng),
      expression: pick(v.expressions, rng),
      sticker: pick(v.stickers[locale], rng),
      animation: pick(v.animations, rng),
      layout: pick(['left', 'right', 'center'], rng),
      seed: Math.floor(rng() * 1e6)
    };
    const key = [preset.background, preset.palette, preset.character, preset.expression].join('/');
    if (!recent.has(key) || attempt === 49) return preset;
  }
  /* c8 ignore next */
  return null;
}

// ---------- the main composer ----------

function usageCounts(history, category, locale) {
  const counts = {};
  for (const it of history) {
    if (it.category !== category || it.locale !== locale || !it.templateRefs) continue;
    for (const [k, idx] of Object.entries(it.templateRefs)) {
      const key = `${k}:${idx}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * Compose one new card for the given category + locale, or return null if the
 * category/locale pool has no acceptable combination left.
 */
export function composeCard({ category, locale, banks, history, usedHashes, now, rng }) {
  const plans = enumeratePlans(category, locale, banks);
  const counts = usageCounts(history, category, locale);
  const sameStream = history.filter((it) => it.category === category && it.locale === locale);
  const recentRefs = sameStream.slice(0, 6).map((it) => it.templateRefs ?? {});
  const similarityPool = history.slice(0, SIMILARITY_WINDOW).filter((it) => it.locale === locale).map((it) => tokens(textForSimilarity(it)));

  const scored = [];
  for (const plan of plans) {
    const draft = { category, locale, headline: plan.headline, body: plan.body, code: plan.code };
    const hash = contentHash(draft);
    if (usedHashes.has(hash)) continue;
    // Recency: avoid reusing any part used in the last few cards of this stream.
    let recencyPenalty = 0;
    for (const refs of recentRefs) {
      for (const [k, idx] of Object.entries(plan.parts)) if (refs[k] === idx) recencyPenalty += 1;
    }
    const usage = Object.entries(plan.parts).reduce((sum, [k, idx]) => sum + (counts[`${k}:${idx}`] ?? 0), 0);
    scored.push({ plan, hash, score: recencyPenalty * 1000 + usage * 10 + rng() });
  }
  scored.sort((a, b) => a.score - b.score);

  for (const { plan, hash } of scored) {
    const t = tokens([plan.headline, plan.body, plan.code?.input ?? ''].join(' '));
    const tooSimilar = similarityPool.some((s) => jaccard(s, t) >= SIMILARITY_THRESHOLD);
    if (tooSimilar) continue;

    const createdAt = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const v = banks.visual;
    const item = {
      id: `${createdAt.replace(/[-:]/g, '').replace('T', '-').replace('Z', '')}-${category}-${hash.slice(0, 8)}`,
      createdAt,
      category,
      locale,
      eyebrow: plan.eyebrow ?? null,
      headline: plan.headline,
      body: plan.body,
      kicker: pick(v.kickers[locale], rng),
      visualPreset: chooseVisual(category, locale, banks, history, rng),
      effect: pick(v.effects, rng),
      sourceType: ENGINE_VERSION,
      templateRefs: plan.parts,
      contentHash: hash,
      verified: category === 'global' ? true : null
    };
    if (plan.code) item.code = plan.code;
    if (plan.lang) item.lang = plan.lang;
    return item;
  }
  return null;
}

/**
 * Picks the category/locale for this run (rotating), falling back through every other
 * stream before giving up. Throws PoolExhaustedError when nothing new can be made.
 */
export function generateNext({ banks, history, now = new Date(), rng = makeRng(Date.now()) }) {
  const usedHashes = new Set(history.map((it) => it.contentHash));
  const start = history.length;
  const streams = [];
  for (let i = 0; i < CATEGORIES.length; i += 1) {
    const category = CATEGORIES[(start + i) % CATEGORIES.length];
    const catCount = history.filter((it) => it.category === category).length;
    const firstLocale = LOCALES[catCount % 2];
    streams.push([category, firstLocale], [category, LOCALES.find((l) => l !== firstLocale)]);
  }
  const tried = [];
  for (const [category, locale] of streams) {
    const item = composeCard({ category, locale, banks, history, usedHashes, now, rng });
    if (item) return { item, tried };
    tried.push(`${category}/${locale}`);
  }
  throw new PoolExhaustedError(`CONTENT_POOL_EXHAUSTED: no new acceptable combination in any stream (${tried.join(', ')})`);
}

/** Total number of distinct plans per stream — used for capacity reporting. */
export function capacityReport(banks) {
  const report = {};
  for (const c of CATEGORIES) for (const l of LOCALES) report[`${c}/${l}`] = enumeratePlans(c, l, banks).length;
  return report;
}
