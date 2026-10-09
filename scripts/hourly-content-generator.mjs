#!/usr/bin/env node
// NOOO HOURLY CREATIVE ENGINE — CLI.
//
// Usage:
//   node scripts/hourly-content-generator.mjs            # add one new card
//   node scripts/hourly-content-generator.mjs --dry-run  # print the card, write nothing
//   node scripts/hourly-content-generator.mjs --capacity # show how many combos each stream has
// Options: --root <dir> --seed <int> --now <ISO date>
//
// Exit codes: 0 = card added, 3 = CONTENT_POOL_EXHAUSTED, 1 = any other error.
// Text cards need no network. Every Nth card is a museum-art photo card (free Openverse API, no key);
// if that step fails for any reason the run just makes a normal text card. No paid services, no secrets.

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';
import { generateNext, makeRng, capacityReport, ENGINE_VERSION } from './lib/engine.mjs';
import { loadBanks, loadHistory, appendItem } from './lib/store.mjs';
import { isPhotoTurn, makePhotoCard } from './lib/photos.mjs';

function parseArgs(argv) {
  const args = { dryRun: false, capacity: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--capacity') args.capacity = true;
    else if (a === '--root') args.root = argv[++i];
    else if (a === '--seed') args.seed = Number(argv[++i]);
    else if (a === '--now') args.now = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

const here = dirname(fileURLToPath(import.meta.url));

try {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? resolve(here, '..'));
  const banks = loadBanks(root);

  if (args.capacity) {
    const report = capacityReport(banks);
    const total = Object.values(report).reduce((a, b) => a + b, 0);
    console.log(JSON.stringify({ streams: report, totalCombinations: total, hoursOfContentAtOnePerHour: total }, null, 2));
    process.exit(0);
  }

  const history = loadHistory(root);
  const now = args.now ? new Date(args.now) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error(`Invalid --now value: ${args.now}`);
  const seed = Number.isFinite(args.seed) ? args.seed : randomInt(1, 2 ** 31 - 1);

  let item = null;
  let tried = [];
  if (isPhotoTurn(history, banks.photo)) {
    item = await makePhotoCard({ root, banks, history, now, rng: makeRng(seed ^ 0x5bd1e995), log: (m) => console.log(`::notice::${m}`) });
    if (!item) console.log('::notice::Photo card unavailable this hour; making a text card instead.');
  }
  if (!item) ({ item, tried } = generateNext({ banks, history, now, rng: makeRng(seed) }));
  if (tried.length) console.log(`::notice::Streams with no fresh combos were skipped: ${tried.join(', ')}`);

  if (args.dryRun) {
    console.log(JSON.stringify(item, null, 2));
    process.exit(0);
  }
  const total = appendItem(root, item, { engineVersion: ENGINE_VERSION });
  console.log(`NEW CARD ${item.id} [${item.category}/${item.locale}] total=${total}`);
  console.log(`  ${item.headline}`);
  console.log(`  ${item.body}`);
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_OUTPUT, `item_id=${item.id}\ncategory=${item.category}\n`);
  }
} catch (err) {
  if (err && err.code === 'CONTENT_POOL_EXHAUSTED') {
    console.error(`::error::${err.message}`);
    process.exit(3);
  }
  console.error(`::error::Generator failed: ${err?.stack ?? err}`);
  process.exit(1);
}
