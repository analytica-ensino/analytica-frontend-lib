#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Removes component exports from package.json after publishing
 * Restores the clean local package.json state
 */
async function removeExports() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  console.log('🧹 Cleaning up package.json exports after publishing...');

  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Keep every static stylesheet export (no main bundle export).
  //
  // These are declared by hand in package.json: `add-exports.mjs` derives the
  // map from the tsup entries and skips anything that is not `.ts`/`.tsx`, so
  // it cannot recreate a `.css` subpath. Resetting to a hardcoded list would
  // drop any stylesheet added later — the first publish would ship it, this
  // cleanup would erase the line from the repo, and the NEXT publish would go
  // out without it, breaking every consumer that imports it.
  const baseExports = Object.fromEntries(
    Object.entries(packageJson.exports).filter(([subpath]) =>
      subpath.endsWith('.css')
    )
  );

  // Count removed exports
  const totalExports = Object.keys(packageJson.exports).length;
  const removedCount = totalExports - Object.keys(baseExports).length;

  // Update package.json with only base exports
  packageJson.exports = baseExports;

  // Write cleaned package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✨ Removed ${removedCount} component exports from package.json`);
  console.log('📋 Remaining exports:');

  Object.keys(baseExports).forEach(key => {
    console.log(`   ${key} -> ${baseExports[key]}`);
  });

  console.log('\n🎯 package.json restored to clean local state!');
}

removeExports().catch(console.error);
