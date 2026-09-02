import type { GeneratedFile, RepositoryAnalysis } from '../types/analysis.js';
import { generateAgentsMd } from './agents.js';
import { generateCodexFiles } from './codex.js';

export function generateFiles(analysis: RepositoryAnalysis): GeneratedFile[] {
  return [{ path: 'AGENTS.md', content: generateAgentsMd(analysis) }, ...generateCodexFiles(analysis)];
}
