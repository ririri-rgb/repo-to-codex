import type { RepositoryAnalysis } from '../types/analysis.js';

function sectionForCommand(analysis: RepositoryAnalysis, kind: string, title: string): string | undefined {
  const cmd = analysis.commands.find((item) => item.kind === kind);
  return cmd ? `## ${title}\n\n\`\`\`bash\n${cmd.command}\n\`\`\`\n\nDetected from \`${cmd.source}\`.` : undefined;
}

export function generateAgentsMd(analysis: RepositoryAnalysis): string {
  const descriptions = [...analysis.frameworks, ...analysis.languages].filter((x, i, a) => a.indexOf(x) === i);
  const sections: Array<string | undefined> = [
    '# AGENTS.md',
    `## Project\n\n${descriptions.length ? `Detected stack: ${descriptions.join(', ')}.` : 'No supported language or framework was confidently detected.'}`,
    sectionForCommand(analysis, 'install', 'Setup'), sectionForCommand(analysis, 'dev', 'Development'), sectionForCommand(analysis, 'test', 'Testing'),
    sectionForCommand(analysis, 'lint', 'Lint'), sectionForCommand(analysis, 'format', 'Format'), sectionForCommand(analysis, 'typecheck', 'Typecheck'), sectionForCommand(analysis, 'build', 'Build'),
    analysis.architecture.length ? `## Architecture\n\n${analysis.architecture.map((e) => `- \`${e.path}\`: ${e.role}.`).join('\n')}` : undefined,
    `## Agent Guidelines\n\n- Preserve existing public APIs unless the task explicitly requires a breaking change.\n- Follow existing project conventions before introducing new patterns.\n- Do not edit generated output or dependency directories manually.\n- Only run commands listed above when they were detected from repository files.\n- Validate meaningful changes with the detected test, lint, typecheck, and build commands that apply.`,
  ];
  return sections.filter(Boolean).join('\n\n') + '\n';
}
