module.exports = {
  rules: {
    'import/prefer-default-export': 0,
    'max-len': [1, 120, 4, {
      'ignoreUrls': true,
      'ignoreComments': false
    }],
    'no-restricted-syntax': 1,
    '@typescript-eslint/no-use-before-define': ['error', { 'functions': false, 'classes': true }],
    'no-plusplus': [2, {"allowForLoopAfterthoughts": true}],
    '@typescript-eslint/ban-ts-comment': 1, // :)
  },
  settings: {
    project: ['tsconfig.json'],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    'airbnb-typescript',
    "plugin:prettier/recommended"
  ],

  parserOptions: { project: './tsconfig.json'},
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['**/*test.ts', '**/*.js']
};
