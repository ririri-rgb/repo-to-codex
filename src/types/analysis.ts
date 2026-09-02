export type CommandKind = 'install' | 'dev' | 'test' | 'lint' | 'format' | 'build' | 'typecheck';

export interface DetectedCommand {
  kind: CommandKind;
  command: string;
  source: string;
}

export interface ArchitectureEntry {
  path: string;
  role: string;
  evidence: string;
}

export interface RepositoryAnalysis {
  root: string;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  testFrameworks: string[];
  formatters: string[];
  linters: string[];
  buildSystems: string[];
  configFiles: string[];
  architecture: ArchitectureEntry[];
  commands: DetectedCommand[];
  generatedFiles: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}
