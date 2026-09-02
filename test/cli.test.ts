import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, 'fixtures', 'nextjs');
const cli = path.join(here, '..', 'src', 'cli', 'index.js');

test('CLI previews by default and writes only with --write', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'repo-to-codex-'));
  await cp(fixture, temp, { recursive: true });
  const preview = spawnSync(process.execPath, [cli, temp], { encoding: 'utf8' });
  assert.equal(preview.status, 0);
  assert.match(preview.stdout, /Run with --write/);
  const write = spawnSync(process.execPath, [cli, temp, '--write'], { encoding: 'utf8' });
  assert.equal(write.status, 0, write.stderr);
  assert.match(await readFile(path.join(temp, 'AGENTS.md'), 'utf8'), /Next\.js/);
  const second = spawnSync(process.execPath, [cli, temp, '--write'], { encoding: 'utf8' });
  assert.equal(second.status, 1);
  assert.match(second.stderr, /Refusing to overwrite/);
});

test('CLI rejects unknown options', () => {
  const result = spawnSync(process.execPath, [cli, '--wat'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option/);
});
