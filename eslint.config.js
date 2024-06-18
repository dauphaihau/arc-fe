// @ts-check

import importX from 'eslint-plugin-import-x';
import { FlatCompat } from '@eslint/eslintrc';
import parserVue from 'vue-eslint-parser';

// eslint-disable-next-line import-x/no-named-as-default
import withNuxt from './.nuxt/eslint.config.mjs';

const compat = new FlatCompat();

export default withNuxt(
  ...compat.config(importX.configs.recommended),
  importX.configs.typescript,
  {
    files: [
      '**/*.vue',
      '**/*.ts',
      '**/*.js',
    ],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: '@typescript-eslint/parser',
      },
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts'],
        espree: ['.js', '.ts', '.mjs', '.jsx'],
      },
      'import-x/resolver': {
        // Load <rootdir>/tsconfig.json
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Spacing
      '@stylistic/func-call-spacing': 'error',
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/type-generic-spacing': 'error',
      '@stylistic/type-named-tuple-spacing': 'error',

      // Semi
      '@stylistic/semi': ['error', 'always', {
        omitLastInOneLineBlock: true,
        omitLastInOneLineClassBody: true,
      },
      ],

      // Indent
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],

      // Commas
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      }],

      // Line breaks
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        minProperties: 4,
        consistent: true,
      }],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],

      // Quotes
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/quote-props': ['error', 'as-needed'],

      // Brackets
      '@stylistic/new-parens': 'error',
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],

      // Operators
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/no-mixed-operators': 'error',
      '@stylistic/operator-linebreak': ['error', 'after'],
      '@stylistic/dot-location': ['error', 'property'],

      // Disallow
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-tabs': 'off',

      // Misc
      '@stylistic/max-statements-per-line': ['error', { max: 1 }],
      '@stylistic/one-var-declaration-per-line': ['error', 'initializations'],

      // Vue
      'vue/max-len': ['error',
        {
          code: 120,
          template: 110,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreComments: true,
          ignoreTemplateLiterals: true,
          ignoreHTMLAttributeValues: true,
        },
      ],

      // ts
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // TypeScript's compilation already ensures that named imports exist in the referenced module
      'import-x/named': 'off',

      // Others
      'no-undef': 'off', // tsconfig noUnusedLocals handle this
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
  ...compat.config({
    // https://github.com/francoismassart/eslint-plugin-tailwindcss
    extends: ['plugin:tailwindcss/recommended'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  }),
  {
    ignores: [
      '**/*.config.js',
      '**/*.config.ts',
      '!**/eslint.config.js',
      '*.d.ts',
      '**/dist/',
      '.idea/',
      '.gitignore',
      'public/*',
      'src/assets/**',
    ],
  }
);
