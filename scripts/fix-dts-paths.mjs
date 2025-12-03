#!/usr/bin/env node

/**
 * Script to fix TypeScript declaration file paths after tsc build.
 * Automatically reads entry points from tsup.config.ts and maps .d.ts files
 * from tsc output structure to match tsup output structure.
 */

import { readFileSync, copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');

/**
 * Parse tsup.config.ts to extract entry points
 */
function parseTsupConfig() {
  const configPath = join(ROOT_DIR, 'tsup.config.ts');
  const content = readFileSync(configPath, 'utf-8');

  // Extract the entry object from the config
  const entryMatch = content.match(/entry:\s*\{([\s\S]*?)\n\s*\}/);
  if (!entryMatch) {
    throw new Error('Could not find entry object in tsup.config.ts');
  }

  const entryContent = entryMatch[1];
  const entries = {};

  // Match patterns like: 'Output/path': 'src/path/to/file.tsx'
  // or: key: 'src/path/to/file.ts'
  const lineRegex = /['"]?([^'":\s]+(?:\/[^'":\s]+)*)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = lineRegex.exec(entryContent)) !== null) {
    const [, outputPath, srcPath] = match;
    // Skip non-ts/tsx files (like styles.css)
    if (!srcPath.endsWith('.ts') && !srcPath.endsWith('.tsx')) {
      continue;
    }
    entries[outputPath] = srcPath;
  }

  return entries;
}

/**
 * Convert a source path to its tsc output path
 * e.g., 'src/components/Button/Button.tsx' -> 'components/Button/Button'
 */
function srcToTscOutput(srcPath) {
  return srcPath
    .replace(/^src\//, '')  // Remove 'src/' prefix
    .replace(/\.(tsx?|ts)$/, '');  // Remove extension
}

/**
 * Copy a .d.ts file and its .map file
 */
function copyDtsFile(srcPath, destPath) {
  if (!existsSync(srcPath)) {
    return false;
  }

  const destDir = dirname(destPath);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(srcPath, destPath);

  // Also copy .d.ts.map if exists
  const mapSrc = srcPath + '.map';
  const mapDest = destPath + '.map';
  if (existsSync(mapSrc)) {
    copyFileSync(mapSrc, mapDest);
  }

  return true;
}

console.log('🔧 Fixing TypeScript declaration paths...\n');

// Parse tsup config to get entry points
const entries = parseTsupConfig();
console.log(`📦 Found ${Object.keys(entries).length} entry points in tsup.config.ts\n`);

let copied = 0;
let skipped = 0;

// Process each entry point
for (const [outputPath, srcPath] of Object.entries(entries)) {
  const tscOutputRel = srcToTscOutput(srcPath);
  const srcDtsPath = join(DIST_DIR, tscOutputRel + '.d.ts');
  const destDtsPath = join(DIST_DIR, outputPath + '.d.ts');

  // Skip if source and destination are the same
  if (srcDtsPath === destDtsPath) {
    skipped++;
    continue;
  }

  if (copyDtsFile(srcDtsPath, destDtsPath)) {
    console.log(`✅ ${tscOutputRel} -> ${outputPath}`);
    copied++;
  } else {
    console.log(`⚠️  Not found: ${tscOutputRel}`);
  }
}

// Clean up the components directory (tsc puts files in dist/components/...)
const componentsDir = join(DIST_DIR, 'components');
if (existsSync(componentsDir)) {
  rmSync(componentsDir, { recursive: true });
  console.log('\n🗑️  Removed dist/components directory');
}

// Clean up loose .d.ts files that were moved to subdirectories
const dirsToClean = ['hooks', 'utils', 'types'];
for (const dir of dirsToClean) {
  const dirPath = join(DIST_DIR, dir);
  if (existsSync(dirPath)) {
    // Find .d.ts files directly in the directory (not in subdirs)
    const files = ['useMobile.d.ts', 'useTheme.d.ts', 'utils.d.ts', 'support.d.ts'];
    for (const file of files) {
      const filePath = join(dirPath, file);
      if (existsSync(filePath)) {
        rmSync(filePath);
        const mapPath = filePath + '.map';
        if (existsSync(mapPath)) {
          rmSync(mapPath);
        }
      }
    }
  }
}

console.log(`\n✨ Done! Copied ${copied} declaration files.`);
if (skipped > 0) {
  console.log(`ℹ️  Skipped ${skipped} entries (same source and destination)`);
}
