#!/usr/bin/env node
// Assembles the public site into _site/ (used only when GitHub Pages is set to "GitHub Actions").
// In "Deploy from a branch" mode Pages serves the repository root directly and this is not needed.
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const PUBLIC = ['index.html', '404.html', 'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'assets', 'data', 'content/banks'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of PUBLIC) {
  const src = join(root, p);
  if (!existsSync(src)) throw new Error(`missing public path: ${p}`);
  cpSync(src, join(out, p), { recursive: true });
}
if (readFileSync(join(out, 'CNAME'), 'utf8').trim() !== 'nooo.si') throw new Error('CNAME must stay nooo.si');
console.log(`Built _site with: ${PUBLIC.join(', ')}`);
