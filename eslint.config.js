import js from '@eslint/js';
import globals from 'globals';

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

  // Simple configuration for all JavaScript and TypeScript files
  {
    files: ['**/*.{js,ts,tsx}'],
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
    files: ['**/fetch-achievements.js', '**/fetch-achievements-integration.test.js'],
    rules: {
      'no-console': 'off' // Turn off the no-console rule for these files
    }
  }
];