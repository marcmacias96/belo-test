// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['jest.setup.js', '__mocks__/**/*.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    files: ['src/i18n/index.ts'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.expo/**', 'coverage/**'],
  },
]);
