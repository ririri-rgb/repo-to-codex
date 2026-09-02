import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', '.next', 'coverage', '.turbo', '.venv', 'venv', '__pycache__',
]);

export async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

export async function readTextIfExists(filePath: string): Promise<string | undefined> {
  try { return await readFile(filePath, 'utf8'); } catch { return undefined; }
}

export async function listTopLevel(root: string): Promise<string[]> {
  return (await readdir(root)).filter((name) => !IGNORED_DIRS.has(name)).sort();
}

export async function walk(root: string, maxDepth = 3): Promise<string[]> {
  const out: string[] = [];
  async function visit(current: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    for (const name of await readdir(current)) {
      if (IGNORED_DIRS.has(name)) continue;
      const absolute = path.join(current, name);
      const rel = path.relative(root, absolute).split(path.sep).join('/');
      out.push(rel);
      const info = await stat(absolute);
      if (info.isDirectory()) await visit(absolute, depth + 1);
    }
  }
  await visit(root, 0);
  return out.sort();
}
