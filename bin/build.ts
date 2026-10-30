import { execFileSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = join(import.meta.dirname, '..');
const srcDir = join(repoRoot, 'src');
const distDir = join(repoRoot, 'dist');

/**
 * Everything the plugin reads relative to its own location at runtime
 * that tsc does not emit, plus the ambient declarations the emitted
 * `.d.ts` files reference.
 */
const STATIC_ENTRIES = [
  'templates',
  'assets',
  'types',
  'index.md',
  'about.md',
  'YYYYMMDD-decision-template.md',
  'defaultConfig.json',
];

function isStatic(path: string): boolean {
  return !path.endsWith('.ts') || path.endsWith('.d.ts');
}

/**
 * Mirrors the static half of `src/` into `dist/`, preserving relative
 * paths, so the compiled entry point finds its templates and assets at
 * the same offsets it would in the source tree.
 */
export function copyStatic(): void {
  for (const entry of STATIC_ENTRIES) {
    cpSync(join(srcDir, entry), join(distDir, entry), {
      recursive: true,
      filter: isStatic,
    });
  }
}

/**
 * Produces a fresh `dist/`: compiles with the project's tsconfig, then
 * copies the static files alongside the emitted JavaScript.
 */
export function build(): void {
  rmSync(distDir, { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.json'],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  copyStatic();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
}
