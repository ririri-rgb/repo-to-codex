import path from 'node:path';
import type { DetectedCommand } from '../types/analysis.js';
import { exists, readTextIfExists } from '../utils/fs.js';

export interface PythonDetection {
  languages: string[]; frameworks: string[]; packageManagers: string[]; testFrameworks: string[];
  formatters: string[]; linters: string[]; buildSystems: string[]; configFiles: string[]; commands: DetectedCommand[];
}
const empty = (): PythonDetection => ({ languages: [], frameworks: [], packageManagers: [], testFrameworks: [], formatters: [], linters: [], buildSystems: [], configFiles: [], commands: [] });

export async function detectPython(root: string): Promise<PythonDetection> {
  const files = ['pyproject.toml', 'requirements.txt', 'poetry.lock', 'uv.lock'];
  const present: string[] = [];
  for (const file of files) if (await exists(path.join(root, file))) present.push(file);
  if (present.length === 0) return empty();
  const result = empty(); result.languages.push('Python'); result.configFiles.push(...present);
  const pyproject = (await readTextIfExists(path.join(root, 'pyproject.toml'))) ?? '';
  const requirements = (await readTextIfExists(path.join(root, 'requirements.txt'))) ?? '';
  const combined = `${pyproject}\n${requirements}`.toLowerCase();
  if (combined.includes('fastapi')) result.frameworks.push('FastAPI');
  if (combined.includes('django')) result.frameworks.push('Django');
  if (combined.includes('flask')) result.frameworks.push('Flask');
  if (combined.includes('pytest')) { result.testFrameworks.push('pytest'); result.commands.push({ kind: 'test', command: 'pytest', source: present.includes('pyproject.toml') ? 'pyproject.toml' : 'requirements.txt' }); }
  if (combined.includes('ruff')) { result.linters.push('Ruff'); result.formatters.push('Ruff'); result.commands.push({ kind: 'lint', command: 'ruff check .', source: 'pyproject.toml/dependencies' }, { kind: 'format', command: 'ruff format --check .', source: 'pyproject.toml/dependencies' }); }
  if (combined.includes('black')) { result.formatters.push('Black'); if (!result.commands.some((c) => c.kind === 'format')) result.commands.push({ kind: 'format', command: 'black --check .', source: 'pyproject.toml/dependencies' }); }
  if (present.includes('uv.lock')) { result.packageManagers.push('uv'); result.commands.unshift({ kind: 'install', command: 'uv sync', source: 'uv.lock' }); }
  else if (present.includes('poetry.lock') || pyproject.includes('[tool.poetry]')) { result.packageManagers.push('Poetry'); result.commands.unshift({ kind: 'install', command: 'poetry install', source: 'poetry.lock/pyproject.toml' }); }
  else { result.packageManagers.push('pip'); if (present.includes('requirements.txt')) result.commands.unshift({ kind: 'install', command: 'python -m pip install -r requirements.txt', source: 'requirements.txt' }); }
  if (pyproject.includes('[build-system]')) result.buildSystems.push('PEP 517');
  return result;
}
