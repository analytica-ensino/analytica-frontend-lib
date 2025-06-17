import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automatically generates package.json exports for all components
 * This script reads the components directory and creates individual exports
 * to enable better tree-shaking and avoid RSC issues in Next.js 15
 */
function generateExports() {
  const componentsDir = path.join(__dirname, '../src/components');
  const packageJsonPath = path.join(__dirname, '../package.json');

  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Reset exports to base configuration
  const baseExports = {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/index.css"
  };

  // Read all component directories
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Generate exports for each component
  componentDirs.forEach(componentName => {
    const componentPath = path.join(componentsDir, componentName);
    const mainFile = path.join(componentPath, `${componentName}.tsx`);

    // Check if main component file exists
    if (fs.existsSync(mainFile)) {
      // Create direct export to component file (bypasses index.ts completely)
      baseExports[`./${componentName}`] = {
        "types": `./dist/components/${componentName}/${componentName}.d.ts`,
        "import": `./dist/components/${componentName}/${componentName}.js`,
        "require": `./dist/components/${componentName}/${componentName}.cjs`
      };

      console.log(`✅ Added direct export for ${componentName}`);
    }
  });

  // Special exports for utils
  baseExports["./Toast/Toaster"] = {
    "types": "./dist/components/Toast/utils/Toaster.d.ts",
    "import": "./dist/components/Toast/utils/Toaster.js",
    "require": "./dist/components/Toast/utils/Toaster.cjs"
  };

  baseExports["./Toast/ToastStore"] = {
    "types": "./dist/components/Toast/utils/ToastStore.d.ts",
    "import": "./dist/components/Toast/utils/ToastStore.js",
    "require": "./dist/components/Toast/utils/ToastStore.cjs"
  };

  // Update package.json
  packageJson.exports = baseExports;

  // Write back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`🎉 Generated direct exports for ${componentDirs.length} components`);
  console.log('📝 Each component now has its own entry point!');
  console.log('💡 Use: import { Text } from "analytica-frontend-lib/Text"');
}

// Run the script
generateExports();
