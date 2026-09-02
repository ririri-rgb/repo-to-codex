import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { analyzeRepository } from '../src/analyzers/repository.js';
import { generateAgentsMd } from '../src/generators/agents.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string => path.join(here, 'fixtures', name);

test('detects Next.js TypeScript repository and commands', async () => {
  const analysis = await analyzeRepository(fixture('nextjs'));
  assert.ok(analysis.languages.includes('TypeScript'));
  assert.ok(analysis.frameworks.includes('Next.js'));
  assert.ok(analysis.frameworks.includes('Node.js'));
  assert.deepEqual(analysis.packageManagers, ['npm']);
  assert.equal(analysis.commands.find((c) => c.kind === 'build')?.command, 'npm run build');
  assert.equal(analysis.commands.find((c) => c.kind === 'typecheck')?.command, 'npm run typecheck');
});

test('detects Vite with pnpm', async () => {
  const analysis = await analyzeRepository(fixture('vite'));
  assert.ok(analysis.frameworks.includes('Vite'));
  assert.ok(analysis.frameworks.includes('React'));
  assert.deepEqual(analysis.packageManagers, ['pnpm']);
  assert.equal(analysis.commands.find((c) => c.kind === 'dev')?.command, 'pnpm dev');
});

test('detects Node repository without inventing build command', async () => {
  const analysis = await analyzeRepository(fixture('node'));
  assert.ok(analysis.frameworks.includes('Node.js'));
  assert.deepEqual(analysis.packageManagers, ['yarn']);
  assert.equal(analysis.commands.find((c) => c.kind === 'test')?.command, 'yarn test');
  assert.equal(analysis.commands.some((c) => c.kind === 'build'), false);
});

test('detects Python tooling from pyproject and uv lock', async () => {
  const analysis = await analyzeRepository(fixture('python'));
  assert.ok(analysis.languages.includes('Python'));
  assert.ok(analysis.testFrameworks.includes('pytest'));
  assert.ok(analysis.linters.includes('Ruff'));
  assert.equal(analysis.commands.find((c) => c.kind === 'install')?.command, 'uv sync');
});

test('detects FastAPI from requirements', async () => {
  const analysis = await analyzeRepository(fixture('fastapi'));
  assert.ok(analysis.frameworks.includes('FastAPI'));
  assert.equal(analysis.commands.find((c) => c.kind === 'test')?.command, 'pytest');
});

test('AGENTS.md only includes detected commands', async () => {
  const analysis = await analyzeRepository(fixture('node'));
  const markdown = generateAgentsMd(analysis);
  assert.match(markdown, /## Testing/);
  assert.doesNotMatch(markdown, /## Build/);
});
