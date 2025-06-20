import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main bundle
    index: 'src/index.ts',

    // Individual components
    'Alert/index': 'src/components/Alert/Alert.tsx',
    'Badge/index': 'src/components/Badge/Badge.tsx',
    'Button/index': 'src/components/Button/Button.tsx',
    'CheckBox/index': 'src/components/CheckBox/CheckBox.tsx',
    'DropdownMenu/index': 'src/components/DropdownMenu/DropdownMenu.tsx',
    'IconButton/index': 'src/components/IconButton/IconButton.tsx',
    'IconRoundedButton/index':
      'src/components/IconRoundedButton/IconRoundedButton.tsx',
    'NavButton/index': 'src/components/NavButton/NavButton.tsx',
    'SelectionButton/index':
      'src/components/SelectionButton/SelectionButton.tsx',
    'Table/index': 'src/components/Table/Table.tsx',
    'Text/index': 'src/components/Text/Text.tsx',
    'TextArea/index': 'src/components/TextArea/TextArea.tsx',
    'Toast/index': 'src/components/Toast/Toast.tsx',
    'ProgressBar/index': 'src/components/ProgressBar/ProgressBar.tsx',
    'Radio/index': 'src/components/Radio/Radio.tsx',

    // Toast utils
    'Toast/Toaster/index': 'src/components/Toast/utils/Toaster.tsx',
    'Toast/ToastStore/index': 'src/components/Toast/utils/ToastStore.ts',

    // Styles
    styles: 'src/styles.css',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  splitting: false,
  clean: true,
  dts: true,
  external: ['react', 'react-dom'],
  target: 'es2022',
  sourcemap: true,
});
