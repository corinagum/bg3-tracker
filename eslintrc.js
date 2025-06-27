import js from '@eslint/js';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';
import orderImports from './eslint-rules/import-order.js';

export default tseslint.config({
  root: true,
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: [globals.browser, globals.node],
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [js.configs.recommended, ...tseslint.configs.recommended, 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    'import/no-commonjs': 'error',
    'prettier/prettier': 'error',
    'no-console': 'warn',
    'import-order': orderImports,
  }
});
