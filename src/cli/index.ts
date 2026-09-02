#!/usr/bin/env node
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { analyzeRepository } from '../analyzers/repository.js';
import { generateFiles } from '../generators/index.js';
import { exists } from '../utils/fs.js';
import { parseArgs } from './options.js';

function label(value: string): void {
  console.log(`✓ ${value}`);
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  console.log('Analyzing repository...\n');

  const analysis = await analyzeRepository(opts.target);
  const files = generateFiles(analysis);

  for (const language of analysis.languages) label(`Detected ${language}`);
  for (const framework of analysis.frameworks) label(`Detected ${framework}`);
  for (const pm of analysis.packageManagers) label(`Detected ${pm}`);
  for (const kind of ['test', 'lint', 'typecheck', 'build'] as const) {
    if (analysis.commands.some((command) => command.kind === kind)) label(`Found ${kind} command`);
  }

  console.log('\nGenerated preview:\n');
  for (const file of files) console.log(`  ${file.path}`);

  if (!opts.write || opts.dryRun) {
    console.log('\nRun with --write to save files. Existing files are never overwritten unless --force is also supplied.');
    return;
  }

  const conflicts: string[] = [];
  for (const file of files) {
    if (await exists(path.join(analysis.root, file.path))) conflicts.push(file.path);
  }

  if (conflicts.length && !opts.force) {
    throw new Error(`Refusing to overwrite existing files: ${conflicts.join(', ')}. Re-run with --force only after reviewing the preview.`);
  }

  for (const file of files) {
    const destination = path.join(analysis.root, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.content, 'utf8');
  }

  console.log(`\nWrote ${files.length} files.`);
}

main().catch((error: unknown) => {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
