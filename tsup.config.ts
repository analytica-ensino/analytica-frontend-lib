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
    'Chips/index': 'src/components/Chips/Chips.tsx',
    'Divider/index': 'src/components/Divider/Divider.tsx',
    'DropdownMenu/index': 'src/components/DropdownMenu/DropdownMenu.tsx',
    'IconButton/index': 'src/components/IconButton/IconButton.tsx',
    'IconRoundedButton/index':
      'src/components/IconRoundedButton/IconRoundedButton.tsx',
    'Input/index': 'src/components/Input/Input.tsx',
    'NavButton/index': 'src/components/NavButton/NavButton.tsx',
    'ProgressBar/index': 'src/components/ProgressBar/ProgressBar.tsx',
    'ProgressCircle/index': 'src/components/ProgressCircle/ProgressCircle.tsx',
    'Radio/index': 'src/components/Radio/Radio.tsx',
    'SelectionButton/index':
      'src/components/SelectionButton/SelectionButton.tsx',
    'Select/index': 'src/components/Select/Select.tsx',
    'Table/index': 'src/components/Table/Table.tsx',
    'Text/index': 'src/components/Text/Text.tsx',
    'TextArea/index': 'src/components/TextArea/TextArea.tsx',
    'Toast/index': 'src/components/Toast/Toast.tsx',
    'Menu/index': 'src/components/Menu/Menu.tsx',
    'Calendar/index': 'src/components/Calendar/Calendar.tsx',

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
