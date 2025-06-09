import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import typeScriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.config({
    extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
    plugins: ['@typescript-eslint', 'prettier'],
    ignorePatterns: ['node_modules/', '*.mjs'],
  }),
  {
    files: ['src/**/*.{ts,tsx,js}'],
    languageOptions: {
      parser: typeScriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
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
