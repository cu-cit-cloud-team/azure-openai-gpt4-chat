// eslint.config.js

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextPlugin from 'eslint-config-next';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Base JS recommended rules
  js.configs.recommended,

  // Next.js + React + TS configs (from eslint-config-next)
  // This roughly replaces the old "extends: ['next/core-web-vitals']"
  ...tseslint.configs.recommended,
  ...nextPlugin,

  globalIgnores([
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    // safety: don't lint config folders
    '.git/**',
    '.github/**',
    '.history/**',
    '.vscode/**',
    '.turbo/**',
  ]),
  // Project-specific options
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // You can tune these as you like
      'no-console': 'warn',
      'no-unused-vars': 'off', // let TS handle this
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
]);
