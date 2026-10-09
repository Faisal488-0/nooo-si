#!/usr/bin/env node
// Validates every piece of site content. Any error => exit 1 => the workflow does not publish.
//   node scripts/validate-content.mjs [--root <dir>]

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { CATEGORIES, LOCALES, contentHash, ENGINE_VERSION } from './lib/engine.mjs';
import { loadBanks, loadHistory, paths, readJson, LATEST_COUNT } from './lib/store.mjs';
import { toBinary, toMorse } from '../assets/js/lib/encoders.js';

const REQUIRED = ['id', 'createdAt', 'category', 'locale', 'headline', 'body', 'visualPreset', 'sourceType', 'contentHash'];

export function blockedTermHits(text, blocked) {
  const hits = [];
  const lower = String(text).toLowerCase();
  for (const term of blocked) {
    const isLatin = /^[\x00-\x7f]+$/.test(term);
    const re = isLatin ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null;
    if (isLatin ? re.test(lower) : new RegExp(`(^|[\\s«»"'،.!؟?:])${term}($|[\\s«»"'،.!؟?:])`).test(lower)) hits.push(term);
  }
  return hits;
}

export function validateItem(item, ctx) {
  const errors = [];
  const where = `item ${item?.id ?? '(no id)'}`;
  for (const k of REQUIRED) if (item[k] === undefined || item[k] === null || item[k] === '') errors.push(`${where}: missing ${k}`);
  if (!CATEGORIES.includes(item.category)) errors.push(`${where}: unknown category ${item.category}`);
  if (!LOCALES.includes(item.locale)) errors.push(`${where}: unknown locale ${item.locale}`);
  if (typeof item.createdAt !== 'string' || Number.isNaN(Date.parse(item.createdAt))) errors.push(`${where}: bad createdAt`);
  else if (Date.parse(item.createdAt) > ctx.now + 10 * 60 * 1000) errors.push(`${where}: createdAt is in the future`);
  if (item.sourceType && item.sourceType !== ENGINE_VERSION && item.sourceType !== 'curated-pack') errors.push(`${where}: unknown sourceType ${item.sourceType}`);
  if (typeof item.headline === 'string' && (item.headline.length < 3 || item.headline.length > 140)) errors.push(`${where}: headline length ${item.headline.length}`);
  if (typeof item.body === 'string' && (item.body.length < 3 || item.body.length > 220)) errors.push(`${where}: body length ${item.body.length}`);
  if (/[<>]/.test(`${item.headline}${item.body}${item.kicker ?? ''}`)) errors.push(`${where}: angle brackets are not allowed in content`);
  if (item.contentHash && item.contentHash !== contentHash(item)) errors.push(`${where}: contentHash does not match content`);
  const hits = blockedTermHits(`${item.headline} ${item.body} ${item.kicker ?? ''}`, ctx.blocked);
  if (hits.length) errors.push(`${where}: blocked terms ${hits.join(', ')}`);

  const vp = item.visualPreset ?? {};
  for (const k of ['background', 'palette', 'character', 'expression']) if (!vp[k]) errors.push(`${where}: visualPreset.${k} missing`);
  if (vp.background && !ctx.visual.backgrounds.includes(vp.background)) errors.push(`${where}: unknown background ${vp.background}`);
  if (vp.palette && !ctx.visual.palettes.includes(vp.palette)) errors.push(`${where}: unknown palette ${vp.palette}`);

  if (item.category === 'binary' || item.category === 'morse') {
    if (!item.code) errors.push(`${where}: missing code block`);
    else {
      const expected = item.category === 'binary' ? toBinary(item.code.input) : toMorse(item.code.input);
      if (item.code.output !== expected) errors.push(`${where}: ${item.category} encoding is wrong`);
      if (item.category === 'morse' && expected.includes('#')) errors.push(`${where}: morse contains unsupported characters`);
    }
  }
  if (item.category === 'global') {
    const lang = ctx.languages.find((l) => l.id === item.lang?.id);
    if (!lang) errors.push(`${where}: language ${item.lang?.id} is not in data/languages.json`);
    else if (lang.no !== item.lang.no) errors.push(`${where}: language word does not match the verified list`);
    if (item.verified !== true) errors.push(`${where}: global cards must be verified`);
    if (!item.lang?.sourceUrl) errors.push(`${where}: global card has no source URL`);
  }
  return errors;
}

export function validateAll(root, { now = Date.now() } = {}) {
  const errors = [];
  const p = paths(root);
  let banks;
  try {
    banks = loadBanks(root);
  } catch (e) {
    return [`banks failed to load: ${e.message}`];
  }

  // Banks sanity.
  for (const [cat, bank] of Object.entries(banks.text)) {
    for (const loc of LOCALES) {
      const b = bank[loc];
      if (!b || !Array.isArray(b.asks) || !Array.isArray(b.replies)) { errors.push(`bank ${cat}/${loc} malformed`); continue; }
      if (b.asks.length < 5 || b.replies.length < 8) errors.push(`bank ${cat}/${loc} too small`);
      const all = [...b.asks, ...b.replies];
      if (new Set(all).size !== all.length) errors.push(`bank ${cat}/${loc} has duplicate lines`);
      for (const line of all) {
        const hits = blockedTermHits(line, banks.visual.blockedTerms);
        if (hits.length) errors.push(`bank ${cat}/${loc} line "${line}" has blocked terms ${hits.join(', ')}`);
        if (/[<>]/.test(line)) errors.push(`bank ${cat}/${loc} line has angle brackets`);
      }
    }
  }

  // Languages sanity.
  const langs = banks.languages.languages;
  const ids = new Set();
  for (const l of langs) {
    if (ids.has(l.id)) errors.push(`languages: duplicate id ${l.id}`);
    ids.add(l.id);
    if (!l.no || !l.name?.en || !l.name?.ar) errors.push(`languages: ${l.id} incomplete`);
    if (!banks.languages.meta.sources[l.source]) errors.push(`languages: ${l.id} has unknown source ${l.source}`);
    if (!['ltr', 'rtl'].includes(l.dir)) errors.push(`languages: ${l.id} bad dir`);
  }
  const wit = readJson(join(root, 'data', 'wit.json'));
  const seenWit = new Set();
  for (const j of wit.jokes) {
    if (seenWit.has(j.id)) errors.push(`wit: duplicate id ${j.id}`);
    seenWit.add(j.id);
    if (!wit.regions[j.region]) errors.push(`wit: ${j.id} unknown region ${j.region}`);
    if (!['folk', 'original'].includes(j.kind)) errors.push(`wit: ${j.id} bad kind`);
    for (const l of ['ar', 'en']) if (typeof j[l] !== 'string' || j[l].length < 20 || j[l].length > 600 || /[<>]/.test(j[l])) errors.push(`wit: ${j.id} bad ${l} text`);
  }
  for (const q of wit.quotes) {
    if (seenWit.has(q.id)) errors.push(`wit: duplicate id ${q.id}`);
    seenWit.add(q.id);
    if (!q.source) errors.push(`wit: quote ${q.id} has no published source`);
    for (const l of ['ar', 'en']) if (!q.text?.[l] || !q.author?.[l] || !q.take?.[l] || /[<>]/.test(q.text[l])) errors.push(`wit: quote ${q.id} incomplete (${l})`);
  }
  const galactic = readJson(join(root, 'data', 'galactic.json'));
  for (const g of galactic.entries) {
    if (!['documented', 'nooo-original'].includes(g.kind)) errors.push(`galactic: ${g.id} bad kind`);
    if (g.kind === 'documented' && !galactic.meta.sources[g.source]) errors.push(`galactic: ${g.id} missing source`);
  }

  // Feed.
  const history = loadHistory(root);
  const ctx = { now, blocked: banks.visual.blockedTerms, visual: banks.visual, languages: langs };
  const seenIds = new Set();
  const seenHashes = new Set();
  for (const item of history) {
    errors.push(...validateItem(item, ctx));
    if (seenIds.has(item.id)) errors.push(`duplicate id ${item.id}`);
    if (seenHashes.has(item.contentHash)) errors.push(`duplicate content ${item.id}`);
    seenIds.add(item.id);
    seenHashes.add(item.contentHash);
    const monthOk = existsSync(join(p.archiveDir, `${item.createdAt.slice(0, 7)}.json`));
    if (!monthOk) errors.push(`${item.id}: stored in the wrong month file`);
  }

  if (history.length) {
    if (!existsSync(p.latest)) errors.push('data/feed/latest.json missing');
    else {
      const latest = readJson(p.latest);
      const expectIds = history.slice(0, LATEST_COUNT).map((i) => i.id);
      const gotIds = (latest.items ?? []).map((i) => i.id);
      if (JSON.stringify(expectIds) !== JSON.stringify(gotIds)) errors.push('latest.json is out of sync with the archive');
      if (latest.total !== history.length) errors.push('latest.json total is wrong');
    }
  }

  // Site guard rails: the custom domain must never change silently.
  const cname = existsSync(join(root, 'CNAME')) ? readFileSync(join(root, 'CNAME'), 'utf8').trim() : '';
  if (cname !== 'nooo.si') errors.push(`CNAME must be exactly "nooo.si" (found "${cname}")`);
  if (!existsSync(join(root, 'index.html'))) errors.push('index.html missing');

  return errors;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const i = process.argv.indexOf('--root');
  const root = resolve(i > -1 ? process.argv[i + 1] : join(dirname(fileURLToPath(import.meta.url)), '..'));
  const errors = validateAll(root);
  if (errors.length) {
    for (const e of errors) console.error(`::error::${e}`);
    console.error(`Validation FAILED with ${errors.length} error(s).`);
    process.exit(1);
  }
  const total = loadHistory(root).length;
  console.log(`Validation passed: ${total} feed item(s), banks, languages, galactic, CNAME OK.`);
}
