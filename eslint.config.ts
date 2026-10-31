import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        // The root tsconfig.json only covers src/; the check config spans every .ts file.
        project: ['./tsconfig.check.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          // node:test runs and reports each test itself; the promise test() returns is only a completion signal.
          allowForKnownSafeCalls: [
            {
              from: 'package',
              package: 'node:test',
              name: ['describe', 'it', 'test'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'dist/',
      'dist-package/',
      'playwright-report/',
      'test-results/',
      'tests/fixture-site/_site/',
      'tests/fixture-site/node_modules/',
    ],
  },
  prettier,
);
