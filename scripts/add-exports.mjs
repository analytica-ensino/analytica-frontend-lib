#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Adds component exports to package.json for publishing
 * Keeps the local package.json clean while ensuring all exports are available for consumers
 */
async function addExports() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const srcDir = path.join(__dirname, '..', 'src', 'components');

  console.log('📦 Adding component exports to package.json for publishing...');

  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Get all component directories
  const componentDirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Create component exports object
  const componentExports = {};

  for (const componentName of componentDirs) {
    const componentFile = path.join(srcDir, componentName, `${componentName}.tsx`);

    if (fs.existsSync(componentFile)) {
      // Convert ComponentName to kebab-case for export key
      const exportKey = componentName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

      // Add main component export
      componentExports[`./${exportKey}`] = `./dist/${componentName}/index.js`;

      // Check for utils directory (Toast case)
      const utilsDir = path.join(srcDir, componentName, 'utils');
      if (fs.existsSync(utilsDir)) {
        const utilFiles = fs.readdirSync(utilsDir)
          .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
          .filter(file => !file.includes('.test.') && !file.includes('.stories.'))
          .map(file => path.basename(file, path.extname(file)));

        for (const utilName of utilFiles) {
          const utilExportKey = `./${exportKey}/${utilName.toLowerCase()}`;
          componentExports[utilExportKey] = `./dist/${componentName}/${utilName}/index.js`;
        }
      }

      console.log(`✅ Added export for ${componentName} -> ./${exportKey}`);
    }
  }

  // Merge with existing exports, adding main bundle export and preserving base exports.
  // The root "." entry is applied AFTER spreading the existing exports so a stale/wrong
  // "." in the committed package.json can never clobber the correct mapping
  // (import -> ESM .mjs, require -> CJS .js).
  const newExports = {
    ...packageJson.exports,
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    ...componentExports
  };

  // Update package.json
  packageJson.exports = newExports;

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✨ Successfully added ${Object.keys(componentExports).length} component exports!`);
  console.log('\n📋 Available exports:');

  // Log all exports for reference
  Object.keys(newExports).forEach(key => {
    console.log(`   ${key} -> ${newExports[key]}`);
  });

  console.log('\n🚀 package.json ready for publishing!');
}

addExports().catch(console.error);
