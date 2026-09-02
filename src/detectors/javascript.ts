import path from 'node:path';
import type { DetectedCommand } from '../types/analysis.js';
import { exists, readTextIfExists } from '../utils/fs.js';

interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

export interface JavaScriptDetection {
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  testFrameworks: string[];
  formatters: string[];
  linters: string[];
  buildSystems: string[];
  configFiles: string[];
  commands: DetectedCommand[];
}

const empty = (): JavaScriptDetection => ({
  languages: [],
  frameworks: [],
  packageManagers: [],
  testFrameworks: [],
  formatters: [],
  linters: [],
  buildSystems: [],
  configFiles: [],
  commands: [],
});

function dependencyNames(pkg: PackageJson): Set<string> {
  return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
}

function packageManagerFromField(value: string | undefined): 'npm' | 'pnpm' | 'yarn' | undefined {
  const name = value?.split('@')[0];
  return name === 'npm' || name === 'pnpm' || name === 'yarn' ? name : undefined;
}

function scriptCommand(packageManager: 'npm' | 'pnpm' | 'yarn', script: string): string {
  return packageManager === 'npm' ? `npm run ${script}` : `${packageManager} ${script}`;
}

export async function detectJavaScript(root: string): Promise<JavaScriptDetection> {
  const packagePath = path.join(root, 'package.json');
  if (!(await exists(packagePath))) return empty();
  const raw = await readTextIfExists(packagePath);
  if (!raw) return empty();

  let pkg: PackageJson;
  try {
    pkg = JSON.parse(raw) as PackageJson;
  } catch {
    return empty();
  }

  const deps = dependencyNames(pkg);
  const result = empty();
  const isTypeScript = deps.has('typescript') || (await exists(path.join(root, 'tsconfig.json')));
  result.languages.push(isTypeScript ? 'TypeScript' : 'JavaScript');
  result.frameworks.push('Node.js');
  result.configFiles.push('package.json');

  if (deps.has('next')) result.frameworks.push('Next.js');
  if (deps.has('react')) result.frameworks.push('React');
  if (deps.has('vite')) {
    result.frameworks.push('Vite');
    result.buildSystems.push('Vite');
  }
  if (deps.has('jest')) result.testFrameworks.push('Jest');
  if (deps.has('vitest')) result.testFrameworks.push('Vitest');
  if (deps.has('@playwright/test')) result.testFrameworks.push('Playwright');
  if (deps.has('eslint')) result.linters.push('ESLint');
  if (deps.has('prettier')) result.formatters.push('Prettier');
  if (deps.has('typescript')) result.buildSystems.push('TypeScript');

  const hasPnpmLock = await exists(path.join(root, 'pnpm-lock.yaml'));
  const hasYarnLock = await exists(path.join(root, 'yarn.lock'));
  const hasNpmLock =
    (await exists(path.join(root, 'package-lock.json'))) ||
    (await exists(path.join(root, 'npm-shrinkwrap.json')));
  const lockManagers = [
    hasPnpmLock ? 'pnpm' : undefined,
    hasYarnLock ? 'yarn' : undefined,
    hasNpmLock ? 'npm' : undefined,
  ].filter((value): value is 'npm' | 'pnpm' | 'yarn' => value !== undefined);
  const fieldManager = packageManagerFromField(pkg.packageManager);
  const packageManager = lockManagers.length === 1 ? lockManagers[0] : fieldManager;

  if (packageManager) {
    result.packageManagers.push(packageManager);
    const installCommand = packageManager === 'npm' && hasNpmLock ? 'npm ci' : `${packageManager} install`;
    const installSource = lockManagers.length === 1 ? 'lockfile' : 'package.json#packageManager';
    result.commands.push({ kind: 'install', command: installCommand, source: installSource });
  }

  const aliases: Record<string, string[]> = {
    dev: ['dev', 'start:dev'],
    test: ['test'],
    lint: ['lint'],
    format: ['format', 'fmt'],
    build: ['build'],
    typecheck: ['typecheck', 'type-check', 'check-types'],
  };
  if (packageManager) {
    for (const [kind, names] of Object.entries(aliases)) {
      const found = names.find((name) => pkg.scripts?.[name]);
      if (found) {
        result.commands.push({
          kind: kind as DetectedCommand['kind'],
          command: scriptCommand(packageManager, found),
          source: `package.json#scripts.${found}`,
        });
      }
    }
  }

  for (const file of [
    'tsconfig.json',
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'vite.config.js',
    'vite.config.ts',
    'eslint.config.js',
    'eslint.config.mjs',
    '.eslintrc',
    '.prettierrc',
  ]) {
    if (await exists(path.join(root, file))) result.configFiles.push(file);
  }

  return result;
}
