import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const homepage = 'https://nooo.si/';

test('XML and text sitemaps advertise the single canonical homepage', () => {
  const xml = read('sitemap.xml');
  const txt = read('sitemap.txt');
  assert.match(xml, /<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), [homepage]);
  assert.deepEqual(txt.trim().split(/\r?\n/), [homepage]);
});

test('robots.txt advertises both sitemap formats without blocking crawl', () => {
  const robots = read('robots.txt');
  assert.match(robots, /^User-agent:\s*\*$/m);
  assert.match(robots, /^Allow:\s*\/$/m);
  for (const p of ['sitemap.xml', 'sitemap.txt']) {
    assert.ok(robots.includes('Sitemap: https://nooo.si/' + p), p);
    assert.ok(!robots.includes('Disallow: /' + p), p);
  }
});

test('GitHub Pages build copies both sitemaps in workflow deployment mode', () => {
  const build = read('scripts/build-site.mjs');
  assert.match(build, /'sitemap\.xml'/);
  assert.match(build, /'sitemap\.txt'/);
  assert.match(build, /'robots\.txt'/);
});

test('homepage canonical points to the URL in both sitemaps', () => {
  const html = read('index.html');
  assert.ok(html.includes('<link rel="canonical" href="' + homepage + '">'));
  assert.ok(!/<meta\s+name=["']robots["'][^>]*noindex/i.test(html));
});
