#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');

/**
 * Parse the `entry` object from tsup.config.ts.
 *
 * tsup is the single source of truth for what gets compiled into the dist
 * (one `.mjs` + `.js` per entry). Deriving the package.json `exports` map from
 * the same list guarantees every compiled module is reachable as a subpath and
 * that we never drift (a new tsup entry is automatically exported).
 *
 * Returns a map of outputPath -> srcPath, e.g.
 *   'Button/index'        -> 'src/components/Button/Button.tsx'
 *   'hooks/useMobile/index' -> 'src/hooks/useMobile.ts'
 */
function parseTsupEntries() {
  const configPath = path.join(ROOT_DIR, 'tsup.config.ts');
  const content = fs.readFileSync(configPath, 'utf-8');

  const entryMatch = content.match(/entry:\s*\{([\s\S]*?)\n\s*\}/);
  if (!entryMatch) {
    throw new Error('Could not find entry object in tsup.config.ts');
  }

  const entryContent = entryMatch[1];
  const entries = {};
  const lineRegex =
    /['"]?([^'":\s]+(?:\/[^'":\s]+)*)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = lineRegex.exec(entryContent)) !== null) {
    const [, outputPath, srcPath] = match;
    // Skip non-ts/tsx entries (e.g. styles.css)
    if (!srcPath.endsWith('.ts') && !srcPath.endsWith('.tsx')) {
      continue;
    }
    entries[outputPath] = srcPath;
  }

  return entries;
}

/**
 * Convert a PascalCase component dir name to the kebab-case export key the
 * apps already rely on, e.g. ActivityFilters -> activity-filters.
 */
function toKebab(name) {
  return name
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Derive the public subpath export key from a tsup output path.
 *
 * - Components live under '<Component>/index' -> './<component-kebab>'
 *   and nested helpers '<Component>/<helper>/index' -> './<component-kebab>/<helper-lower>'.
 *   This preserves the historical, app-facing keys.
 * - Everything else (hooks/, store/, utils/, types/, enums/, etc.) keeps its
 *   directory structure, lowercased, dropping the trailing '/index'.
 *   e.g. 'hooks/useMobile/index' -> './hooks/usemobile'
 *        'utils/index'           -> './utils'
 */
function outputPathToExportKey(outputPath) {
  const segments = outputPath.replace(/\/index$/, '').split('/');

  // Component entries: top-level PascalCase dir mapped from src/components/*
  const isComponent = /^[A-Z]/.test(segments[0]);
  if (isComponent) {
    const [component, ...rest] = segments;
    const base = toKebab(component);
    if (rest.length === 0) {
      return `./${base}`;
    }
    return `./${base}/${rest.join('/').toLowerCase()}`;
  }

  // Non-component entries keep their path, lowercased.
  return `./${segments.join('/').toLowerCase()}`;
}

/**
 * Build a conditional export entry that exposes the ESM build first so bundlers
 * (Vite/Rollup/webpack) tree-shake the subpath. CJS is kept as the `require`
 * fallback for legacy consumers. `types` points at the per-entry .d.ts emitted
 * by `build:types` (tsc + fix-dts-paths.mjs).
 */
function buildEntry(outputPath) {
  const distFileBase = `./dist/${outputPath}`;
  return {
    types: `${distFileBase}.d.ts`,
    import: `${distFileBase}.mjs`,
    require: `${distFileBase}.js`,
  };
}

async function addExports() {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');

  console.log('📦 Deriving subpath exports from tsup entries...');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const entries = parseTsupEntries();

  const derivedExports = {};
  for (const outputPath of Object.keys(entries)) {
    // The root bundle (index) is handled explicitly below as ".".
    if (outputPath === 'index') {
      continue;
    }
    const exportKey = outputPathToExportKey(outputPath);
    derivedExports[exportKey] = buildEntry(outputPath);
    console.log(`✅ ${exportKey} -> ./dist/${outputPath}.mjs`);
  }

  // Merge: keep any base exports (e.g. ./styles.css), then force the root "."
  // to the correct ESM/CJS/types mapping, then layer the derived subpaths.
  const newExports = {
    ...packageJson.exports,
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.mjs',
      require: './dist/index.js',
    },
    ...derivedExports,
  };

  packageJson.exports = newExports;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(
    `\n✨ Successfully added ${Object.keys(derivedExports).length} subpath exports!`
  );
  console.log('🚀 package.json ready for publishing!');
}

addExports().catch((err) => {
  console.error(err);
  process.exit(1);
});
