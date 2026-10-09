// NOOO HOURLY PHOTO CARDS — museum art + a NOOO caption.
//
// Only CC0 / Public Domain Mark images are used, from an allow-list of museums and libraries,
// found through the Openverse API (no key, no cost). Each picked image is downloaded once
// (small thumbnail), stored under data/feed/img/ and credited on the card, so visitors' browsers
// never contact a third party. Any problem (network, bad image, nothing fresh) returns null and the
// run falls back to a normal text card — a photo problem must never break the hourly publish.

import { writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chooseVisual, contentHash, makeRng, ENGINE_VERSION } from './engine.mjs';

export const OPENVERSE = 'https://api.openverse.org/v1/images/';
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

export function isPhotoTurn(history, bank) {
  if (!bank?.enabled) return false;
  return history.length > 0 && history.length % bank.everyNth === bank.everyNth - 1;
}

export function imageKind(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') return 'png';
  return null;
}

/** Pure filter: is this Openverse result safe and usable for the given theme? */
export function acceptCandidate(r, theme, bank, usedIds) {
  if (!r || !r.id || usedIds.has(r.id)) return false;
  if (!bank.licenses[r.license]) return false;                 // CC0 / PDM only
  if (!bank.sources.includes(r.source)) return false;          // allow-listed institutions only
  if (r.mature) return false;
  if (!r.title || !r.foreign_landing_url?.startsWith('https://')) return false;
  const tags = (r.tags ?? []).map((t) => t.name).join(' ');
  const text = `${r.title} ${r.creator ?? ''} ${tags}`;
  if (new RegExp(bank.blockedPattern, 'i').test(text)) return false;
  if (!new RegExp(theme.match, 'i').test(`${r.title} ${tags}`)) return false; // the animal must really be in it
  return true;
}

async function getJson(fetchImpl, url) {
  const res = await fetchImpl(url, { headers: { Accept: 'application/json', 'User-Agent': 'nooo.si hourly bot (https://nooo.si)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

export async function makePhotoCard({ root, banks, history, now, rng = makeRng(Date.now()), fetchImpl = globalThis.fetch, log = () => {} }) {
  const bank = banks.photo;
  if (!bank?.enabled) return null;
  const usedIds = new Set(history.filter((h) => h.photo).map((h) => h.photo.sourceId));
  const photoCount = history.filter((h) => h.category === 'photo').length;
  const locale = photoCount % 2 === 0 ? 'en' : 'ar';
  const themes = bank.themes;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const theme = themes[(photoCount + attempt) % themes.length];
    try {
      const q = new URLSearchParams({
        q: theme.query, license: Object.keys(bank.licenses).join(','), source: bank.sources.join(','),
        mature: 'false', page_size: '20', page: String(1 + Math.floor(rng() * 3))
      });
      const data = await getJson(fetchImpl, `${OPENVERSE}?${q}`);
      const ok = (data.results ?? []).filter((r) => acceptCandidate(r, theme, bank, usedIds));
      log(`photo theme=${theme.id}: ${ok.length}/${(data.results ?? []).length} acceptable`);
      for (let i = 0; i < Math.min(ok.length, 4); i += 1) {
        const r = ok.splice(Math.floor(rng() * ok.length), 1)[0];
        const res = await fetchImpl(`${OPENVERSE}${r.id}/thumb/`, { headers: { 'User-Agent': 'nooo.si hourly bot (https://nooo.si)' } });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        const kind = imageKind(buf);
        if (!kind || buf.length > bank.maxBytes || buf.length < 2000) { log(`photo ${r.id} rejected (type/size)`); continue; }

        const createdAt = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const stamp = createdAt.replace(/[-:]/g, '').replace('T', '-').replace('Z', '');
        const pair = pick(theme.captions[locale], rng);
        const file = `data/feed/img/${stamp}-${r.id.slice(0, 8)}.${kind}`;
        const dir = join(root, 'data', 'feed', 'img');
        mkdirSync(dir, { recursive: true });
        const tmp = join(root, `${file}.tmp-${process.pid}`);
        writeFileSync(tmp, buf);
        renameSync(tmp, join(root, file));

        const draft = {
          category: 'photo', locale, headline: pair.headline, body: pair.reply,
          code: null, photo: { sourceId: r.id }
        };
        const hash = contentHash(draft);
        const item = {
          id: `${stamp}-photo-${hash.slice(0, 8)}`,
          createdAt, category: 'photo', locale,
          eyebrow: null,
          headline: pair.headline, body: pair.reply,
          kicker: pick(banks.visual.kickers[locale], rng),
          visualPreset: chooseVisual('office', locale, banks, history, rng),
          effect: pick(banks.visual.effects, rng),
          sourceType: ENGINE_VERSION,
          templateRefs: { theme: themes.indexOf(theme) },
          contentHash: hash,
          verified: null,
          photo: {
            file, sourceId: r.id, theme: theme.id,
            title: String(r.title).slice(0, 140), creator: String(r.creator ?? '').slice(0, 100),
            provider: r.source, license: r.license, licenseUrl: bank.licenses[r.license],
            landingUrl: r.foreign_landing_url
          }
        };
        return item;
      }
    } catch (e) {
      log(`photo attempt ${attempt + 1} failed: ${e.message}`);
    }
  }
  return null;
}
