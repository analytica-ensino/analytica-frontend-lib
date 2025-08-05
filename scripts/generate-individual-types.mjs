import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getComponentPathsForTypes } from './components-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Function to create .d.ts file
function createTypeFile(componentPath) {
  const distPath = join(rootDir, 'dist', componentPath);
  const typeFilePath = join(distPath, 'index.d.ts');
  
  // Create directory if it doesn't exist
  if (!existsSync(distPath)) {
    mkdirSync(distPath, { recursive: true });
  }
  
  // Calculate relative path to main index
  const depth = componentPath.split('/').length;
  const relativePath = '../'.repeat(depth);
  
  const content = `export * from '${relativePath}index';\n`;
  
  writeFileSync(typeFilePath, content);
}

console.log('🔍 Discovering components automatically...\n');

// Get all component paths dynamically
const componentPaths = getComponentPathsForTypes();

console.log(`📦 Found ${componentPaths.length} components to process\n`);

// Generate .d.ts files for all discovered components
componentPaths.forEach(componentPath => {
  createTypeFile(componentPath);
});

console.log('\n✅ TypeScript declaration files generated successfully!');
console.log('\n✨ Now you can import components like:');
console.log('import { CardAudio } from "analytica-frontend-lib/card";');
console.log('import { Button } from "analytica-frontend-lib/button";');
console.log('import { AuthProvider } from "analytica-frontend-lib/auth/authprovider";');