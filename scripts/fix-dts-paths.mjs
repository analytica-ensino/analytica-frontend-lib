#!/usr/bin/env node

/**
 * Script to fix TypeScript declaration file paths after tsc build.
 *
 * Background
 * ----------
 * tsup emits the JS bundle with a FLATTENED layout (one folder per public
 * subpath, e.g. `dist/Button/index.js`), but `dts: false` so tsup does not
 * emit declarations. Declarations are produced by `tsc` directly, which keeps
 * the SOURCE layout (`dist/components/Button/Button.d.ts`, `dist/hooks/...`,
 * etc.).
 *
 * This script reconciles the two:
 *   1. Copies each entry's `.d.ts` from the tsc layout to its flattened
 *      subpath location (`dist/<outputPath>.d.ts`) so subpath imports resolve.
 *   2. Rewrites every relative import inside the remaining declaration files so
 *      they point at the flattened location of whatever they reference.
 *   3. Deletes the `dist/components/` tree, EXCEPT the files that have no
 *      flattened home (orphans: components without a tsup entry) plus their
 *      transitive `.d.ts` dependencies. Those are kept in place and the
 *      imports that reference them are left untouched.
 *
 * Why the rewrite step exists
 * ---------------------------
 * The root barrel `dist/index.d.ts` (and many flattened subpath `.d.ts`)
 * re-export from `./components/<X>/<file>`. Once `dist/components/` is removed
 * those paths dangle and the type resolves to `any` (masked by skipLibCheck in
 * the apps). Rewriting them to the flattened destination fixes this without
 * duplicating every declaration into `dist/components/`.
 */

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');

/** Normalise a path to forward slashes (dist-root-relative keys are POSIX). */
const toPosix = (p) => p.split('\\').join('/');

/**
 * Parse tsup.config.ts to extract entry points.
 */
function parseTsupConfig() {
  const configPath = join(ROOT_DIR, 'tsup.config.ts');
  const content = readFileSync(configPath, 'utf-8');

  const entryMatch = content.match(/entry:\s*\{([\s\S]*?)\n\s*\}/);
  if (!entryMatch) {
    throw new Error('Could not find entry object in tsup.config.ts');
  }

  const entryContent = entryMatch[1];
  const entries = {};

  // Match patterns like: 'Output/path': 'src/path/to/file.tsx'
  const lineRegex =
    /['"]?([^'":\s]+(?:\/[^'":\s]+)*)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = lineRegex.exec(entryContent)) !== null) {
    const [, outputPath, srcPath] = match;
    if (!srcPath.endsWith('.ts') && !srcPath.endsWith('.tsx')) {
      continue;
    }
    entries[outputPath] = srcPath;
  }

  return entries;
}

/**
 * Convert a source path to its tsc output path (dist-root-relative, no ext).
 * e.g. 'src/components/Button/Button.tsx' -> 'components/Button/Button'
 */
function srcToTscOutput(srcPath) {
  return srcPath.replace(/^src\//, '').replace(/\.(tsx?|ts)$/, '');
}

/** Copy a .d.ts file and its .map sibling. */
function copyDtsFile(srcPath, destPath) {
  if (!existsSync(srcPath)) {
    return false;
  }
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  copyFileSync(srcPath, destPath);
  const mapSrc = srcPath + '.map';
  const mapDest = destPath + '.map';
  if (existsSync(mapSrc)) {
    copyFileSync(mapSrc, mapDest);
  }
  return true;
}

/** Recursively list every .d.ts file under a directory (absolute paths). */
function walkDts(dir) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walkDts(p));
    else if (entry.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

/**
 * Resolve a dist-root-relative key (no extension) to the actual declaration
 * file that backs it, returning a dist-root-relative POSIX path or null.
 */
function keyToFile(key) {
  const direct = join(DIST_DIR, key + '.d.ts');
  if (existsSync(direct)) return key + '.d.ts';
  const asIndex = join(DIST_DIR, key, 'index.d.ts');
  if (existsSync(asIndex)) return toPosix(join(key, 'index.d.ts'));
  return null;
}

console.log('🔧 Fixing TypeScript declaration paths...\n');

const entries = parseTsupConfig();
console.log(
  `📦 Found ${Object.keys(entries).length} entry points in tsup.config.ts\n`
);

// ---------------------------------------------------------------------------
// 1. Copy each entry's declaration to its flattened subpath location.
// ---------------------------------------------------------------------------
let copied = 0;
let skipped = 0;

// tscOutput (no ext) -> flattened output path (no trailing /index).
// First-wins so a single source mapped to several subpaths (e.g. Auth/*)
// resolves to a stable canonical flattened location.
const tscToFlat = {};
// Flattened dirs whose ENTRY SOURCE is a directory barrel (`.../index.ts`).
// Only for these is a bare `./components/X` import equivalent to the flattened
// subpath `X`: when the entry is sourced from a NAMED file (e.g.
// `TypeSelector.tsx`) the directory's `index.ts` barrel re-exports MORE than
// the named file (e.g. its `.types`), so the barrel must be preserved instead.
const barrelFlatDirs = new Set();
// Final dist file (relative, POSIX) -> the directory in the ORIGINAL tsc tree
// it logically came from. Relative imports inside a copied file must resolve
// against this origin, not against its new flattened location. Files that were
// never moved (hooks/types/enums/store/preserved components) keep their own
// directory as origin.
const originByFile = {};

for (const [outputPath, srcPath] of Object.entries(entries)) {
  const tscOutputRel = srcToTscOutput(srcPath);
  const flat = outputPath.replace(/\/index$/, '');
  if (!(tscOutputRel in tscToFlat)) tscToFlat[tscOutputRel] = flat;
  // Entry sourced from a directory barrel (`.../index.ts`)?
  if (/\/index$/.test(tscOutputRel)) barrelFlatDirs.add(flat);

  const srcDtsPath = join(DIST_DIR, tscOutputRel + '.d.ts');
  const destDtsPath = join(DIST_DIR, outputPath + '.d.ts');

  if (srcDtsPath === destDtsPath) {
    skipped++;
    continue;
  }
  if (copyDtsFile(srcDtsPath, destDtsPath)) {
    originByFile[toPosix(`${outputPath}.d.ts`)] = toPosix(
      dirname(tscOutputRel)
    );
    copied++;
  } else {
    console.log(`⚠️  Not found: ${tscOutputRel}`);
  }
}
console.log(`✅ Copied ${copied} declaration files to flattened subpaths.`);

/**
 * Resolve a dist-root-relative key (no ext) to its flattened destination
 * (no ext), or null when the key has no flattened home (orphan).
 */
function resolveFlat(key) {
  if (key in tscToFlat) return tscToFlat[key];
  const noIndex = key.endsWith('/index') ? key.slice(0, -'/index'.length) : key;
  if (noIndex in tscToFlat) return tscToFlat[noIndex];
  // Bare directory import `components/X` is the directory barrel `index.ts`.
  // It only equals the flattened subpath `X` when that subpath's entry is
  // itself sourced from the barrel; otherwise the barrel re-exports more than
  // the named entry file and must be preserved (resolved by keyToFile later).
  const parts = noIndex.split('/');
  if (
    parts[0] === 'components' &&
    parts.length === 2 &&
    barrelFlatDirs.has(parts[1])
  ) {
    return parts[1];
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Determine which `dist/components/` files must be PRESERVED.
//    These are component declarations that have no flattened home (orphans)
//    plus their transitive .d.ts dependency closure.
// ---------------------------------------------------------------------------
// Matches relative module specifiers in `from '...'`, including bare `.`/`..`
// (a file importing from its own directory barrel) as well as `./x`, `../y`.
const importRegex = /from\s+(['"])(\.\.?(?:\/[^'"]*)?)\1/g;

/** The tsc-tree directory a still-present file's imports resolve against. */
function originDirOf(fileRel) {
  return originByFile[fileRel] ?? dirname(fileRel);
}

/** Collect the orphan seeds referenced from anywhere in dist. */
function collectOrphanSeeds() {
  const seeds = new Set();
  for (const absFile of walkDts(DIST_DIR)) {
    const fileRel = toPosix(relative(DIST_DIR, absFile));
    const dir = originDirOf(fileRel);
    const src = readFileSync(absFile, 'utf8');
    let m;
    importRegex.lastIndex = 0;
    while ((m = importRegex.exec(src)) !== null) {
      const key = toPosix(normalize(join(dir, m[2])));
      if (!key.startsWith('components/')) continue;
      if (resolveFlat(key)) continue;
      const file = keyToFile(key);
      if (file) seeds.add(file);
    }
  }
  return seeds;
}

const keep = new Set();
const queue = [...collectOrphanSeeds()];
while (queue.length) {
  const fileRel = queue.shift();
  if (keep.has(fileRel)) continue;
  keep.add(fileRel);
  const src = readFileSync(join(DIST_DIR, fileRel), 'utf8');
  // Preserved orphans always live at their original tsc location.
  const dir = dirname(fileRel);
  let m;
  importRegex.lastIndex = 0;
  while ((m = importRegex.exec(src)) !== null) {
    const key = toPosix(normalize(join(dir, m[2])));
    if (resolveFlat(key)) continue; // dep has a flattened home, no need to keep
    const file = keyToFile(key);
    if (file?.startsWith('components/') && !keep.has(file)) {
      queue.push(file);
    }
  }
}
console.log(
  `📌 Preserving ${keep.size} orphan declaration file(s) in dist/components/.`
);

// ---------------------------------------------------------------------------
// 3. Delete `dist/components/` files that are NOT preserved.
// ---------------------------------------------------------------------------
const componentsDir = join(DIST_DIR, 'components');
let removed = 0;
for (const absFile of walkDts(componentsDir)) {
  const fileRel = toPosix(relative(DIST_DIR, absFile));
  if (keep.has(fileRel)) continue;
  rmSync(absFile);
  const map = absFile + '.map';
  if (existsSync(map)) rmSync(map);
  removed++;
}
// Remove now-empty directories under dist/components.
function pruneEmptyDirs(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirs(join(dir, entry.name));
  }
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
}
pruneEmptyDirs(componentsDir);
console.log(
  `🗑️  Removed ${removed} duplicated declaration file(s) from dist/components/.`
);

// Clean up loose top-level .d.ts files that were copied into flattened subdirs.
const dirsToClean = ['hooks', 'utils', 'types'];
for (const dir of dirsToClean) {
  const dirPath = join(DIST_DIR, dir);
  if (!existsSync(dirPath)) continue;
  const files = [
    'useMobile.d.ts',
    'useTheme.d.ts',
    'utils.d.ts',
    'support.d.ts',
  ];
  for (const file of files) {
    const filePath = join(dirPath, file);
    if (existsSync(filePath)) {
      rmSync(filePath);
      const mapPath = filePath + '.map';
      if (existsSync(mapPath)) rmSync(mapPath);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Rewrite relative imports across every remaining declaration file so they
//    point at the FINAL location of whatever they reference.
//
//    Each import is resolved against the file's logical ORIGIN (the tsc-tree
//    directory it came from), giving a stable dist-root key. The final
//    location of that key is then computed: a flattened entry, a preserved
//    orphan, or its untouched tsc location. The import is re-relativised from
//    the file's actual position. Imports whose target cannot be located (e.g.
//    `./services/apiService` or `.png` assets that tsc never emits) are left
//    untouched.
// ---------------------------------------------------------------------------

/**
 * Final dist location (relative POSIX, no ext) for a dist-root key, or null.
 * Prefers the flattened entry; otherwise the file's untouched/preserved spot.
 */
function finalLocation(key) {
  const flat = resolveFlat(key);
  if (flat) {
    const f = keyToFile(flat);
    return (f || `${flat}/index.d.ts`).replace(/\.d\.ts$/, '');
  }
  const f = keyToFile(key);
  return f ? f.replace(/\.d\.ts$/, '') : null;
}

let rewrittenFiles = 0;
let rewrittenImports = 0;
for (const absFile of walkDts(DIST_DIR)) {
  const fileRel = toPosix(relative(DIST_DIR, absFile));
  const actualDir = dirname(fileRel);
  const originDir = originByFile[fileRel] ?? actualDir;
  const original = readFileSync(absFile, 'utf8');
  let changed = false;

  const updated = original.replace(importRegex, (full, quote, imp) => {
    // Resolve against the ORIGIN so copied files map to the right target.
    const key = toPosix(normalize(join(originDir, imp)));
    const target = finalLocation(key);
    if (!target) return full; // unresolvable (assets / missing service decls)

    let rel = toPosix(relative(actualDir, target));
    if (!rel.startsWith('.')) rel = './' + rel;
    if (rel === toPosix(imp)) return full;

    changed = true;
    rewrittenImports++;
    return `from ${quote}${rel}${quote}`;
  });

  if (changed) {
    writeFileSync(absFile, updated);
    rewrittenFiles++;
  }
}
console.log(
  `✏️  Rewrote ${rewrittenImports} import path(s) across ${rewrittenFiles} file(s).`
);

// ---------------------------------------------------------------------------
// 5. Rewrite the internal `@/` alias (`@/* -> src/*` per tsconfig paths) in
//    REAL import/export statements to a correct relative path. tsc preserves
//    the alias verbatim in declarations, so consumers see `import ... from
//    '@/...'` which does not resolve (TS2307 under skipLibCheck:false).
//
//    `@/<x>` maps logically to `src/<x>`, and the flattened dist mirrors src,
//    so the target is `dist/<x>` — resolved to either `dist/<x>.d.ts` or
//    `dist/<x>/index.d.ts` (whichever exists, via keyToFile). The import is
//    re-relativised from the .d.ts file's own directory.
//
//    Only REAL statements are touched: a line that, ignoring leading
//    whitespace, starts with `import ` (incl. `import type `) or `export `
//    and references `from '@/...'`. JSDoc example lines (`* import api from
//    '@/services/apiService'`) start with `*` and are NEVER matched.
// ---------------------------------------------------------------------------

// Matches a real import/export statement specifier of the form `from '@/<x>'`.
// Anchored to the start of a (whitespace-prefixed) line that begins with the
// `import`/`export` keyword, so JSDoc `*`-prefixed examples cannot match.
const aliasStmtRegex =
  /^(\s*(?:import|export)\b[^\n]*?\bfrom\s+)(['"])@\/([^'"]+)\2/gm;

let aliasRewrittenFiles = 0;
let aliasRewrittenImports = 0;
let aliasTotal = 0;
let aliasUnresolved = 0;
for (const absFile of walkDts(DIST_DIR)) {
  const actualDir = dirname(toPosix(relative(DIST_DIR, absFile)));
  const original = readFileSync(absFile, 'utf8');
  let changed = false;

  const updated = original.replace(
    aliasStmtRegex,
    (full, prefix, quote, sub) => {
      aliasTotal++;
      // `@/<sub>` -> dist-root key `<sub>` (dist mirrors src flattened).
      const key = toPosix(normalize(sub));
      const file = keyToFile(key);
      if (!file) {
        aliasUnresolved++;
        console.log(
          `⚠️  Unresolved alias import '@/${sub}' in ${toPosix(
            relative(DIST_DIR, absFile)
          )} — left untouched.`
        );
        return full;
      }
      const target = file.replace(/\.d\.ts$/, '');
      let rel = toPosix(relative(actualDir, target));
      if (!rel.startsWith('.')) rel = './' + rel;

      changed = true;
      aliasRewrittenImports++;
      return `${prefix}${quote}${rel}${quote}`;
    }
  );

  if (changed) {
    writeFileSync(absFile, updated);
    aliasRewrittenFiles++;
  }
}
console.log(
  `🔗 Rewrote ${aliasRewrittenImports}/${aliasTotal} '@/' alias import(s) across ${aliasRewrittenFiles} file(s).` +
    (aliasUnresolved ? ` (${aliasUnresolved} unresolved, left as-is)` : '')
);

console.log('\n✨ Done.');
if (skipped > 0) {
  console.log(`ℹ️  Skipped ${skipped} entries (same source and destination).`);
}
