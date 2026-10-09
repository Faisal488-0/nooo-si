// File-system access for banks and the feed archive. Writes are atomic (temp file + rename).

import { readFileSync, writeFileSync, renameSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const LATEST_COUNT = 30;

export const paths = (root) => ({
  banks: join(root, 'content', 'banks'),
  languages: join(root, 'data', 'languages.json'),
  feedDir: join(root, 'data', 'feed'),
  archiveDir: join(root, 'data', 'feed', 'archive'),
  latest: join(root, 'data', 'feed', 'latest.json'),
  index: join(root, 'data', 'feed', 'index.json'),
  state: join(root, 'data', 'feed', 'state.json')
});

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

export function writeJsonAtomic(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  renameSync(tmp, file);
}

export function loadBanks(root) {
  const p = paths(root);
  const text = {};
  for (const name of ['boss', 'friends', 'relationship', 'cat', 'scifi', 'office', 'monday']) {
    text[name] = readJson(join(p.banks, `${name}.json`));
  }
  return {
    text,
    machine: readJson(join(p.banks, 'machine.json')),
    visual: readJson(join(p.banks, 'visual.json')),
    photo: existsSync(join(p.banks, 'photo.json')) ? readJson(join(p.banks, 'photo.json')) : null,
    languages: readJson(p.languages)
  };
}

/** Returns all archived items, newest first. */
export function loadHistory(root) {
  const { archiveDir } = paths(root);
  if (!existsSync(archiveDir)) return [];
  const files = readdirSync(archiveDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort().reverse();
  const items = [];
  for (const f of files) items.push(...readJson(join(archiveDir, f)).items);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

/** Appends one item to its month file and rewrites latest.json + index.json. */
export function appendItem(root, item, meta = {}) {
  const p = paths(root);
  const month = item.createdAt.slice(0, 7);
  const monthFile = join(p.archiveDir, `${month}.json`);
  const monthData = existsSync(monthFile) ? readJson(monthFile) : { month, items: [] };
  monthData.items.unshift(item);
  writeJsonAtomic(monthFile, monthData);

  const history = loadHistory(root);
  writeJsonAtomic(p.latest, {
    generatedAt: item.createdAt,
    total: history.length,
    items: history.slice(0, LATEST_COUNT)
  });

  const months = readdirSync(p.archiveDir)
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .map((f) => ({ month: f.slice(0, 7), file: `data/feed/archive/${f}`, count: readJson(join(p.archiveDir, f)).items.length }));
  writeJsonAtomic(p.index, { total: history.length, months });

  writeJsonAtomic(p.state, {
    engineVersion: meta.engineVersion,
    lastRunAt: item.createdAt,
    lastResult: 'item-added',
    lastItemId: item.id,
    lastCategory: item.category,
    totalItems: history.length,
    note: 'lastRunAt is when the item was generated. It is live once this file is served by nooo.si; the workflow verifies that after deploying.'
  });
  return history.length;
}
