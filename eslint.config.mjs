import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'eslint:recommended',
      'next',
      'prettier',
      'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    ignorePatterns: ['node_modules/', '.next/', '*.mjs'],
  }),
  {
    files: ['src/**/*.{ts,tsx,js}'],
    rules: {
      ...eslintPluginTypeScript.configs.recommended.rules,
      ...prettierConfig.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': ['error'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];

export default eslintConfig;
