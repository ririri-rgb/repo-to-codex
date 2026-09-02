import path from 'node:path';
import type { DetectedCommand } from '../types/analysis.js';
import { exists, readTextIfExists } from '../utils/fs.js';

interface PackageJson { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string>; }

export interface JavaScriptDetection {
  languages: string[]; frameworks: string[]; packageManagers: string[]; testFrameworks: string[];
  formatters: string[]; linters: string[]; buildSystems: string[]; configFiles: string[]; commands: DetectedCommand[];
}

const empty = (): JavaScriptDetection => ({ languages: [], frameworks: [], packageManagers: [], testFrameworks: [], formatters: [], linters: [], buildSystems: [], configFiles: [], commands: [] });

function dependencyNames(pkg: PackageJson): Set<string> {
  return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
}

export async function detectJavaScript(root: string): Promise<JavaScriptDetection> {
  const packagePath = path.join(root, 'package.json');
  if (!(await exists(packagePath))) return empty();
  const raw = await readTextIfExists(packagePath);
  if (!raw) return empty();
  let pkg: PackageJson;
  try { pkg = JSON.parse(raw) as PackageJson; } catch { return empty(); }
  const deps = dependencyNames(pkg);
  const result = empty();
  result.languages.push('JavaScript / TypeScript'); result.frameworks.push('Node.js'); result.configFiles.push('package.json');
  if (deps.has('typescript') || await exists(path.join(root, 'tsconfig.json'))) result.languages.unshift('TypeScript');
  if (deps.has('next')) result.frameworks.push('Next.js');
  if (deps.has('react')) result.frameworks.push('React');
  if (deps.has('vite')) { result.frameworks.push('Vite'); result.buildSystems.push('Vite'); }
  if (deps.has('jest')) result.testFrameworks.push('Jest');
  if (deps.has('vitest')) result.testFrameworks.push('Vitest');
  if (deps.has('@playwright/test')) result.testFrameworks.push('Playwright');
  if (deps.has('eslint')) result.linters.push('ESLint');
  if (deps.has('prettier')) result.formatters.push('Prettier');
  if (deps.has('typescript')) result.buildSystems.push('TypeScript');

  if (await exists(path.join(root, 'pnpm-lock.yaml'))) result.packageManagers.push('pnpm');
  else if (await exists(path.join(root, 'yarn.lock'))) result.packageManagers.push('yarn');
  else result.packageManagers.push('npm');

  const pm = result.packageManagers[0] ?? 'npm';
  result.commands.push({ kind: 'install', command: pm === 'npm' ? 'npm install' : `${pm} install`, source: 'lockfile/package.json' });
  const aliases: Record<string, string[]> = {
    dev: ['dev', 'start:dev'], test: ['test'], lint: ['lint'], format: ['format', 'fmt'], build: ['build'], typecheck: ['typecheck', 'type-check', 'check-types'],
  };
  for (const [kind, names] of Object.entries(aliases)) {
    const found = names.find((name) => pkg.scripts?.[name]);
    if (found) result.commands.push({ kind: kind as DetectedCommand['kind'], command: pm === 'npm' ? `npm run ${found}` : `${pm} ${found}`, source: `package.json#scripts.${found}` });
  }
  for (const file of ['tsconfig.json', 'next.config.js', 'next.config.mjs', 'next.config.ts', 'vite.config.js', 'vite.config.ts', 'eslint.config.js', 'eslint.config.mjs', '.eslintrc', '.prettierrc']) {
    if (await exists(path.join(root, file))) result.configFiles.push(file);
  }
  return result;
}
