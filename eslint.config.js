import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Global ignores - this must come first
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'test-output/**',
      'public/assets/**',
    ],
  },

  // Base JS recommended config
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-console': 'warn',
      ...tseslint.configs.recommended.rules,
    },
  },

  // Simple configuration for JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },

  // Special override for fetch-achievements.js
  {
    files: ['**/fetch-achievements.ts', '**/fetch-achievements-integration.test.ts'],
    rules: {
      'no-console': 'off'
    }
  },

  {
    files: ['**/*.test.ts', '**/*.test.js', '**/*.test.tsx', '**/*.test.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
];