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

  // Keep only styles export (no main bundle export)
  const baseExports = {
    "./styles.css": packageJson.exports["./styles.css"]
  };

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
