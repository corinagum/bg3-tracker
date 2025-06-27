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

      // Formatting rules (replacing Prettier)
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'max-len': ['warn', { 'code': 120 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'arrow-spacing': 'error',
      'comma-spacing': 'error',
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      'object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],
      'operator-linebreak': ['error', 'before'],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'spaced-comment': ['error', 'always'],
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

      // Formatting rules for JS files
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'max-len': ['error', { 'code': 120 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'arrow-spacing': 'error',
      'comma-spacing': 'error',
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      'object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],
      'operator-linebreak': ['error', 'before'],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'spaced-comment': ['error', 'always'],
    },
  },

  {
    files: ['**/fetch-achievements.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Special override for test files and scripts
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', 'scripts/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': 'off',
    },
  },
];
