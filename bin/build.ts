import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, utimesSync, watch } from 'node:fs';
import { createRequire } from 'node:module';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const require = createRequire(import.meta.url);
const repoRoot = join(import.meta.dirname, '..');
const srcDir = join(repoRoot, 'src');
const distDir = join(repoRoot, 'dist');
const fixtureDir = join(repoRoot, 'tests/fixture-site');

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

/**
 * Keeps `dist/` in step with the static half of `src/` while a separate
 * `tsc --watch` handles the TypeScript. A changed path under one of the
 * static entries is copied (or removed) on its own; anything else falls
 * back to a full static copy. Events are debounced per path because
 * editors commonly write a file twice.
 */
export function watchStatic(): void {
  copyStatic();
  const pending = new Map<string, ReturnType<typeof setTimeout>>();
  let touchTimer: ReturnType<typeof setTimeout> | undefined;

  const touchFixtureConfig = (): void => {
    // Eleventy never watches node_modules, and 3.1.7's chokidar wrapper
    // drops directories outside the project on Linux, so a dist/ change
    // is relayed through the fixture's own config file (a config reset).
    const config = ['ts', 'js', 'mjs', 'cjs']
      .map((ext) => join(fixtureDir, `eleventy.config.${ext}`))
      .find((path) => existsSync(path));
    if (config === undefined) {
      return;
    }
    const now = new Date();
    utimesSync(config, now, now);
  };

  const scheduleTouch = (): void => {
    clearTimeout(touchTimer);
    touchTimer = setTimeout(touchFixtureConfig, 200);
  };

  const sync = (rel: string | null): void => {
    if (rel === null || !STATIC_ENTRIES.includes(rel.split(sep)[0] ?? '')) {
      copyStatic();
      console.log('[build] copied static files');
      scheduleTouch();
      return;
    }
    const source = join(srcDir, rel);
    const dest = join(distDir, rel);
    if (existsSync(source)) {
      cpSync(source, dest, { recursive: true, filter: isStatic });
      console.log(`[build] copied ${rel}`);
    } else {
      rmSync(dest, { recursive: true, force: true });
      console.log(`[build] removed ${rel}`);
    }
    scheduleTouch();
  };

  watch(srcDir, { recursive: true }, (_event, rel) => {
    if (rel !== null && !isStatic(rel)) {
      return;
    }
    const key = rel ?? '';
    clearTimeout(pending.get(key));
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        sync(rel);
      }, 50),
    );
  });

  watch(distDir, { recursive: true }, (_event, rel) => {
    if (rel?.endsWith('.js')) {
      scheduleTouch();
    }
  });
  console.log(`[build] watching ${srcDir} and ${distDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { watch: { type: 'boolean' } } });
  if (values.watch) {
    watchStatic();
  } else {
    build();
  }
}
