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
    "./client": {
      "import": "./dist/client-components.js",
      "require": "./dist/client-components.cjs",
      "types": "./dist/client-components.d.ts"
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
      baseExports[`./${componentName}`] = {
        "types": `./dist/components/${componentName}/${componentName}.d.ts`,
        "import": `./dist/components/${componentName}/${componentName}.js`,
        "require": `./dist/components/${componentName}/${componentName}.cjs`
      };

      console.log(`✅ Added export for ${componentName}`);
    }
  });

  // Update package.json
  packageJson.exports = baseExports;

  // Write back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`🎉 Generated exports for ${componentDirs.length} components`);
  console.log('📝 Updated package.json with automatic exports');
}

// Run the script
generateExports();
