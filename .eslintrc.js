const path = require('path');

module.exports = {
  root: true,
  // Configuration for JavaScript files
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: true,
        tabWidth: 2,
        trailingComma: 'all',
        singleQuote: true,
        useTabs: false,
        printWidth: 120,
        arrowParens: 'avoid',
        singleAttributePerLine: true,
        proseWrap: 'preserve',
        bracketSpacing: true,
        endOfLine: 'crlf',
      },
    ],
  },
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'unused-imports', 'react'],
      extends: ['airbnb-typescript', 'plugin:prettier/recommended'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: path.join(process.cwd(), 'tsconfig.json'),
      },
      rules: {
        'prefer-destructuring': 'off',
        'no-restricted-syntax': 'off',
        'max-classes-per-file': 'off',
        'prettier/prettier': [
          'error',
          {
            semi: true,
            tabWidth: 2,
            trailingComma: 'all',
            singleQuote: true,
            useTabs: false,
            printWidth: 120,
            arrowParens: 'avoid',
            singleAttributePerLine: true,
            proseWrap: 'preserve',
            bracketSpacing: true,
            endOfLine: 'crlf',
          },
        ],
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      },
    },
  ],
};
