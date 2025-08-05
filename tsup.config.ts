import { defineConfig } from 'tsup';
import { getAllComponentEntries } from './scripts/components-config.mjs';

export default defineConfig([
  // Main bundle with types
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    splitting: false,
    clean: true,
    dts: true,
    external: ['react', 'react-dom'],
    target: 'es2022',
    sourcemap: false,
    minify: false,
    treeshake: false,
  },
  // Individual components with JS bundles (dynamically generated)
  {
    entry: getAllComponentEntries(),
    format: ['esm', 'cjs'],
    outDir: 'dist',
    splitting: false,
    clean: false,
    dts: false, // Disable types for individual components to save memory
    external: ['react', 'react-dom'],
    target: 'es2022',
    sourcemap: false,
    minify: false,
    treeshake: false,
  },
]);
