import path from 'node:path';
import type { ArchitectureEntry } from '../types/analysis.js';
import { listTopLevel } from '../utils/fs.js';

const roles: Record<string, string> = {
  src: 'application or library source code', app: 'application entry points or routes', pages: 'page or route modules', components: 'reusable UI components',
  lib: 'shared library code and utilities', utils: 'shared utility modules', tests: 'automated tests', test: 'automated tests', public: 'static public assets',
  scripts: 'repository automation scripts', api: 'API-related source code', docs: 'project documentation', config: 'configuration modules', migrations: 'database migrations',
};

export async function detectArchitecture(root: string): Promise<ArchitectureEntry[]> {
  const entries = await listTopLevel(root); const result: ArchitectureEntry[] = [];
  for (const name of entries) {
    const role = roles[name];
    if (!role) continue;
    result.push({ path: `${name}/`, role, evidence: `top-level directory named ${name}` });
  }
  for (const candidate of ['src/app', 'src/components', 'src/lib', 'src/utils', 'src/routes']) {
    try {
      const names = await listTopLevel(path.join(root, candidate));
      if (names.length >= 0) result.push({ path: `${candidate}/`, role: roles[path.basename(candidate)] ?? 'source module directory', evidence: `directory exists at ${candidate}` });
    } catch { /* absent directory */ }
  }
  return result;
}
