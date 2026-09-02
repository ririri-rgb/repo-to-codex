export interface Options {
  target: string;
  write: boolean;
  dryRun: boolean;
  force: boolean;
}

const KNOWN_OPTIONS = new Set(['--write', '--dry-run', '--force', '--help', '-h']);

export function printHelp(): void {
  console.log(`repo-to-codex [path] [options]\n\nOptions:\n  --write    Write generated files\n  --dry-run  Preview only (default)\n  --force    Allow overwriting generated target files\n  --help     Show help`);
}

export function parseArgs(argv: string[]): Options {
  const flags = argv.filter((arg) => arg.startsWith('-'));
  const unknown = flags.filter((arg) => !KNOWN_OPTIONS.has(arg));
  if (unknown.length) {
    throw new Error(`Unknown option${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`);
  }

  if (flags.includes('--help') || flags.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const positional = argv.filter((arg) => !arg.startsWith('-'));
  if (positional.length > 1) {
    throw new Error(`Expected at most one repository path, received ${positional.length}.`);
  }

  return {
    target: positional[0] ?? '.',
    write: flags.includes('--write'),
    dryRun: flags.includes('--dry-run'),
    force: flags.includes('--force'),
  };
}
