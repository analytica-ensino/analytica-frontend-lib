import { defineConfig } from 'tsup';

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
  // Individual components without types (to reduce memory usage)
  {
    entry: {
      // Main components (alphabetical order)
      'Accordation/index': 'src/components/Accordation/Accordation.tsx',
      'Alert/index': 'src/components/Alert/Alert.tsx',
      'AlertDialog/index': 'src/components/AlertDialog/AlertDialog.tsx',
      'Alternative/index': 'src/components/Alternative/Alternative.tsx',
      'Auth/index': 'src/components/Auth/Auth.tsx',
      'Badge/index': 'src/components/Badge/Badge.tsx',
      'Button/index': 'src/components/Button/Button.tsx',
      'Calendar/index': 'src/components/Calendar/Calendar.tsx',
      'Card/index': 'src/components/Card/Card.tsx',
      'CheckBox/index': 'src/components/CheckBox/CheckBox.tsx',
      'Chips/index': 'src/components/Chips/Chips.tsx',
      'Divider/index': 'src/components/Divider/Divider.tsx',
      'DropdownMenu/index': 'src/components/DropdownMenu/DropdownMenu.tsx',
      'IconButton/index': 'src/components/IconButton/IconButton.tsx',
      'IconRoundedButton/index': 'src/components/IconRoundedButton/IconRoundedButton.tsx',
      'Input/index': 'src/components/Input/Input.tsx',
      'Menu/index': 'src/components/Menu/Menu.tsx',
      'Modal/index': 'src/components/Modal/Modal.tsx',
      'MultipleChoice/index': 'src/components/MultipleChoice/MultipleChoice.tsx',
      'NavButton/index': 'src/components/NavButton/NavButton.tsx',
      'NotFound/index': 'src/components/NotFound/NotFound.tsx',
      'ProgressBar/index': 'src/components/ProgressBar/ProgressBar.tsx',
      'ProgressCircle/index': 'src/components/ProgressCircle/ProgressCircle.tsx',
      'Quiz/index': 'src/components/Quiz/Quiz.tsx',
      'Radio/index': 'src/components/Radio/Radio.tsx',
      'Select/index': 'src/components/Select/Select.tsx',
      'SelectionButton/index': 'src/components/SelectionButton/SelectionButton.tsx',
      'Skeleton/index': 'src/components/Skeleton/Skeleton.tsx',
      'Stepper/index': 'src/components/Stepper/Stepper.tsx',
      'Table/index': 'src/components/Table/Table.tsx',
      'Text/index': 'src/components/Text/Text.tsx',
      'TextArea/index': 'src/components/TextArea/TextArea.tsx',
      'Toast/index': 'src/components/Toast/Toast.tsx',

      // Sub-components
      'CheckBox/CheckboxList/index': 'src/components/CheckBox/CheckboxList.tsx',
      'Quiz/useQuizStore/index': 'src/components/Quiz/useQuizStore.ts',

      // Individual Auth components
      'Auth/AuthProvider/index': 'src/components/Auth/Auth.tsx',
      'Auth/ProtectedRoute/index': 'src/components/Auth/Auth.tsx',
      'Auth/PublicRoute/index': 'src/components/Auth/Auth.tsx',
      'Auth/withAuth/index': 'src/components/Auth/Auth.tsx',
      'Auth/useAuth/index': 'src/components/Auth/Auth.tsx',
      'Auth/useAuthGuard/index': 'src/components/Auth/Auth.tsx',
      'Auth/useRouteAuth/index': 'src/components/Auth/Auth.tsx',
      'Auth/getRootDomain/index': 'src/components/Auth/Auth.tsx',
      'Auth/zustandAuthAdapter/index':
        'src/components/Auth/zustandAuthAdapter.ts',
      'Auth/useUrlAuthentication/index':
        'src/components/Auth/useUrlAuthentication.ts',
      'Auth/useApiConfig/index': 'src/components/Auth/useApiConfig.ts',

      // Toast utils
      'Toast/Toaster/index': 'src/components/Toast/utils/Toaster.tsx',
      'Toast/ToastStore/index': 'src/components/Toast/utils/ToastStore.ts',

      // Styles
      styles: 'src/styles.css',
    },
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