import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Builds only the main component files, excluding tests and stories
 */
function buildComponents() {
  const componentsDir = path.join(__dirname, '../src/components');

  // Read all component directories
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Build array of component files to compile
  const componentFiles = [];

  componentDirs.forEach(componentName => {
    const componentPath = path.join(componentsDir, componentName);
    const mainFile = path.join(componentPath, `${componentName}.tsx`);

    // Check if main component file exists
    if (fs.existsSync(mainFile)) {
      componentFiles.push(`src/components/${componentName}/${componentName}.tsx`);
      console.log(`📦 Adding ${componentName}.tsx to build`);
    }
  });

  // Handle special cases like Toaster and ToastStore
  const utilFiles = [
    'src/components/Toast/utils/Toaster.tsx',
    'src/components/Toast/utils/ToastStore.ts',
    'src/server-components.ts',
    'src/client-components.ts'
  ];

  utilFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, '../', file))) {
      componentFiles.push(file);
      console.log(`📦 Adding ${path.basename(file)} to build`);
    }
  });

  if (componentFiles.length === 0) {
    console.log('❌ No component files found to build');
    process.exit(1);
  }

  // Build command
  const filesArg = componentFiles.join(' ');
  const command = `tsup ${filesArg} --dts --format esm,cjs --out-dir dist --clean=false`;

  console.log(`🚀 Building ${componentFiles.length} component files...`);
  console.log(`Running: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Components built successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the script
buildComponents();
