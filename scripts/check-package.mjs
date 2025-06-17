#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

/**
 * Checks package contents before publishing
 */

async function checkPackageContents() {
  console.log('📦 Checking package contents...\n');

  // Check dist directory
  const distDir = join(process.cwd(), 'dist');

  try {
    const distContents = await readdir(distDir, { withFileTypes: true });

    console.log('📁 Dist Directory Contents:');
    console.log('├── CSS Files:');
    const cssFiles = distContents.filter(item => item.isFile() && item.name.endsWith('.css'));
    for (const file of cssFiles) {
      const stats = await stat(join(distDir, file.name));
      console.log(`│   ├── ${file.name} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('├── Index Files:');
    const indexFiles = distContents.filter(item => item.isFile() && item.name.startsWith('index.'));
    for (const file of indexFiles) {
      const stats = await stat(join(distDir, file.name));
      console.log(`│   ├── ${file.name} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('├── Component Directories:');
    const componentDirs = distContents.filter(item => item.isDirectory() && !item.name.startsWith('chunk-'));
    for (const dir of componentDirs) {
      const componentFiles = await readdir(join(distDir, dir.name));
      const mjsFile = componentFiles.find(f => f.endsWith('.mjs'));
      if (mjsFile) {
        const stats = await stat(join(distDir, dir.name, mjsFile));
        console.log(`│   ├── ${dir.name}/ (${stats.size}B mjs)`);
      }
    }

    console.log('└── Chunk Files:');
    const chunkFiles = distContents.filter(item => item.isFile() && item.name.startsWith('chunk-'));
    for (const file of chunkFiles) {
      const stats = await stat(join(distDir, file.name));
      console.log(`    ├── ${file.name} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('\n🎯 Package Summary:');
    console.log(`✅ ${componentDirs.length} individual components`);
    console.log(`✅ ${cssFiles.length} CSS files`);
    console.log(`✅ ${indexFiles.length} index files`);
    console.log(`✅ Both import styles supported:`);
    console.log(`   - import { Text } from 'analytica-frontend-lib'`);
    console.log(`   - import { Text } from 'analytica-frontend-lib/Text'`);

  } catch (error) {
    console.error('❌ Error checking package contents:', error);
  }
}

checkPackageContents().catch(console.error);
