import type { GeneratedFile, RepositoryAnalysis } from '../types/analysis.js';

export function generateCodexFiles(analysis: RepositoryAnalysis): GeneratedFile[] {
  const architecture = [
    '# Repository architecture', '',
    analysis.architecture.length ? analysis.architecture.map((e) => `- \`${e.path}\` — ${e.role} (evidence: ${e.evidence})`).join('\n') : 'No common architecture directories were confidently detected.',
    '', '## Configuration files', '', analysis.configFiles.length ? analysis.configFiles.map((f) => `- \`${f}\``).join('\n') : 'None detected.', '',
  ].join('\n');
  const commands = ['# Detected commands', '', ...analysis.commands.map((c) => `- **${c.kind}**: \`${c.command}\` — ${c.source}`), '', '> Commands that could not be detected are intentionally omitted.', ''].join('\n');
  const instructions = ['# Codex repository instructions', '', 'Use `AGENTS.md` as the primary repository-level operating guide.', '', 'Detection policy:', '- Prefer repository evidence over assumptions.', '- Do not invent missing commands.', '- Treat generated/build/dependency directories as non-source unless explicitly requested.', ''].join('\n');
  return [
    { path: '.codex/instructions.md', content: instructions }, { path: '.codex/architecture.md', content: architecture }, { path: '.codex/commands.md', content: commands },
  ];
}
