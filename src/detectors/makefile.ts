import path from 'node:path';
import type { DetectedCommand } from '../types/analysis.js';
import { readTextIfExists } from '../utils/fs.js';

export async function detectMakefileCommands(root: string): Promise<DetectedCommand[]> {
  const raw = await readTextIfExists(path.join(root, 'Makefile'));
  if (!raw) return [];
  const targets = new Set([...raw.matchAll(/^([A-Za-z0-9_.-]+):(?:\s|$)/gm)].map((m) => m[1]).filter((v): v is string => Boolean(v)));
  const map: Array<[DetectedCommand['kind'], string[]]> = [
    ['install', ['install', 'setup']], ['dev', ['dev', 'serve']], ['test', ['test']], ['lint', ['lint']], ['format', ['format', 'fmt']], ['build', ['build']], ['typecheck', ['typecheck', 'type-check']],
  ];
  return map.flatMap(([kind, names]) => {
    const target = names.find((name) => targets.has(name));
    return target ? [{ kind, command: `make ${target}`, source: `Makefile#${target}` }] : [];
  });
}
