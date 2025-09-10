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
    'IconRender/index': 'src/components/IconRender/IconRender.tsx',
    'Input/index': 'src/components/Input/Input.tsx',
    'NavButton/index': 'src/components/NavButton/NavButton.tsx',
    'Search/index': 'src/components/Search/Search.tsx',
    'ProgressBar/index': 'src/components/ProgressBar/ProgressBar.tsx',
    'LoadingModal/index': 'src/components/LoadingModal/loadingModal.tsx',
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
    'Modal/index': 'src/components/Modal/Modal.tsx',
    'Card/index': 'src/components/Card/Card.tsx',
    'Calendar/index': 'src/components/Calendar/Calendar.tsx',
    'Stepper/index': 'src/components/Stepper/Stepper.tsx',
    'Skeleton/index': 'src/components/Skeleton/Skeleton.tsx',
    'NotificationCard/index':
      'src/components/NotificationCard/NotificationCard.tsx',
    'NotFound/index': 'src/components/NotFound/NotFound.tsx',
    'VideoPlayer/index': 'src/components/VideoPlayer/VideoPlayer.tsx',
    'Whiteboard/index': 'src/components/Whiteboard/Whiteboard.tsx',
    'Auth/index': 'src/components/Auth/Auth.tsx',
    'Quiz/index': 'src/components/Quiz/Quiz.tsx',
    'Quiz/useQuizStore/index': 'src/components/Quiz/useQuizStore.ts',

    'MultipleChoice/index': 'src/components/MultipleChoice/MultipleChoice.tsx',

    // Hooks
    'hooks/useMobile/index': 'src/hooks/useMobile.ts',
    'hooks/useTheme/index': 'src/hooks/useTheme.ts',
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

    'Accordation/index': 'src/components/Accordation/Accordation.tsx',
    'Alternative/index': 'src/components/Alternative/Alternative.tsx',
    'AlertDialog/index': 'src/components/AlertDialog/AlertDialog.tsx',

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
