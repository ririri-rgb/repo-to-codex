import path from 'node:path';
import type { DetectedCommand, RepositoryAnalysis } from '../types/analysis.js';
import { detectArchitecture } from './architecture.js';
import { detectJavaScript } from '../detectors/javascript.js';
import { detectMakefileCommands } from '../detectors/makefile.js';
import { detectPython } from '../detectors/python.js';
import { exists } from '../utils/fs.js';

const unique = <T>(values: T[]): T[] => [...new Set(values)];
function mergeCommands(...groups: DetectedCommand[][]): DetectedCommand[] {
  const out = new Map<DetectedCommand['kind'], DetectedCommand>();
  for (const group of groups) for (const cmd of group) if (!out.has(cmd.kind)) out.set(cmd.kind, cmd);
  return [...out.values()];
}

export async function analyzeRepository(input: string): Promise<RepositoryAnalysis> {
  const root = path.resolve(input);
  if (!(await exists(root))) throw new Error(`Repository path does not exist: ${root}`);
  const [js, py, architecture, makeCommands] = await Promise.all([detectJavaScript(root), detectPython(root), detectArchitecture(root), detectMakefileCommands(root)]);
  const configFiles = unique([...js.configFiles, ...py.configFiles]);
  if (await exists(path.join(root, 'Makefile'))) configFiles.push('Makefile');
  return {
    root,
    languages: unique([...js.languages, ...py.languages]), frameworks: unique([...js.frameworks, ...py.frameworks]), packageManagers: unique([...js.packageManagers, ...py.packageManagers]),
    testFrameworks: unique([...js.testFrameworks, ...py.testFrameworks]), formatters: unique([...js.formatters, ...py.formatters]), linters: unique([...js.linters, ...py.linters]),
    buildSystems: unique([...js.buildSystems, ...py.buildSystems]), configFiles: unique(configFiles), architecture,
    commands: mergeCommands(js.commands, py.commands, makeCommands), generatedFiles: [],
  };
}
