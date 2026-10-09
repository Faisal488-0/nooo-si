// Simulates a human pushing while the bot is generating, using throwaway local git repos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, cpSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const git = (cwd, args) => sh(`git -c user.email=t@t -c user.name=t -c init.defaultBranch=main ${args}`, cwd);

function setup() {
  const base = mkdtempSync(join(tmpdir(), 'nooo-git-'));
  const remote = join(base, 'remote.git');
  const human = join(base, 'human');
  const bot = join(base, 'bot');
  git(base, `init --bare ${remote}`);
  mkdirSync(human);
  for (const p of ['content', 'data', 'assets', 'scripts', 'CNAME', 'index.html', 'package.json']) cpSync(join(ROOT, p), join(human, p), { recursive: true });
  git(human, 'init');
  git(human, 'add -A');
  git(human, 'commit -qm init');
  git(human, `remote add origin ${remote}`);
  git(human, 'push -q origin HEAD:main');
  git(base, `clone -q ${remote} bot`);
  return { human, bot };
}

function botGenerateAndCommit(bot) {
  const r = spawnSync(process.execPath, ['scripts/hourly-content-generator.mjs'], { cwd: bot, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  git(bot, 'add data/feed');
  git(bot, 'commit -qm "content: hourly card"');
}

const safePush = (bot) => spawnSync('bash', ['scripts/safe-push.sh', 'main', 'origin'], { cwd: bot, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });

test('non-conflicting human push: bot rebases and keeps the human change', () => {
  const { human, bot } = setup();
  botGenerateAndCommit(bot);
  writeFileSync(join(human, 'README.md'), 'human edit\n');
  git(human, 'add README.md');
  git(human, 'commit -qm "human edit"');
  git(human, 'push -q origin HEAD:main');
  const r = safePush(bot);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  git(human, 'pull -q --rebase origin main');
  assert.equal(readFileSync(join(human, 'README.md'), 'utf8'), 'human edit\n');
  assert.match(git(human, 'log --oneline'), /hourly card/);
});

test('conflicting human push: bot stops safely without overwriting', () => {
  const { human, bot } = setup();
  botGenerateAndCommit(bot);
  // Human also generates (simulating a conflicting manual edit of the same feed files)
  const r0 = spawnSync(process.execPath, ['scripts/hourly-content-generator.mjs', '--seed', '5', '--now', '2026-10-09T01:00:00Z'], { cwd: human, encoding: 'utf8' });
  assert.equal(r0.status, 0);
  git(human, 'add -A');
  git(human, 'commit -qm "human feed edit"');
  git(human, 'push -q origin HEAD:main');
  const humanHead = git(human, 'rev-parse HEAD').trim();
  const r = safePush(bot);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  git(human, 'fetch -q origin');
  assert.equal(git(human, 'rev-parse origin/main').trim(), humanHead, 'remote untouched');
});
