import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['index.js', 'lib/', 'tmpTest/', '.claude/']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts']
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      '@stylistic': stylistic,
      'import-x': importX
    },
    settings: {
      'import-x/extensions': ['.ts', '.js', '.mjs', '.cjs'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts'] },
      'import-x/resolver-next': [createTypeScriptImportResolver(), createNodeResolver()]
    },
    rules: {
      'class-methods-use-this': 2,
      'default-case': 2,
      'no-else-return': 2,
      'guard-for-in': 2,
      'no-console': 0,
      'no-undefined': 2,
      'func-style': [2, 'declaration'],

      // ECMAScript 6+ rules
      'no-array-constructor': 2,
      'no-bitwise': 2,
      'no-continue': 2,
      'no-lonely-if': 2,
      'no-nested-ternary': 2,
      'no-object-constructor': 2,
      'no-unneeded-ternary': 2,
      'arrow-body-style': 2,
      'constructor-super': 2,
      'no-class-assign': 2,
      'no-const-assign': 2,
      'no-dupe-class-members': 2,
      'no-duplicate-imports': 2,
      'no-new-native-nonconstructor': 2,
      'no-this-before-super': 2,
      'no-useless-computed-key': 2,
      'no-useless-constructor': 2,
      'no-useless-rename': 2,
      'no-var': 2,
      'object-shorthand': 2,
      'prefer-arrow-callback': 2,
      'prefer-const': 2,
      'prefer-numeric-literals': 2,
      'prefer-rest-params': 2,
      'prefer-spread': 2,
      'prefer-template': 2,
      'require-yield': 2,
      'symbol-description': 2,

      // @stylistic/eslint-plugin (formerly ESLint core formatting rules)
      '@stylistic/brace-style': [2, '1tbs'],
      '@stylistic/array-bracket-spacing': [2, 'never'],
      '@stylistic/comma-spacing': 2,
      '@stylistic/computed-property-spacing': 2,
      '@stylistic/function-call-spacing': 2,
      '@stylistic/key-spacing': 2,
      '@stylistic/line-comment-position': 2,
      '@stylistic/linebreak-style': 2,
      '@stylistic/lines-around-comment': 2,
      '@stylistic/max-len': [2, 100],
      '@stylistic/new-parens': 2,
      '@stylistic/padding-line-between-statements': [
        2,
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: '*', next: 'return' }
      ],
      '@stylistic/no-trailing-spaces': 2,
      '@stylistic/no-whitespace-before-property': 2,
      '@stylistic/object-property-newline': 2,
      '@stylistic/semi': 2,
      '@stylistic/space-before-blocks': 2,
      '@stylistic/space-in-parens': 2,
      '@stylistic/space-infix-ops': 2,
      '@stylistic/space-unary-ops': 2,
      '@stylistic/spaced-comment': 2,
      '@stylistic/arrow-parens': [2, 'always'],
      '@stylistic/arrow-spacing': 2,
      '@stylistic/generator-star-spacing': 2,
      '@stylistic/no-confusing-arrow': 0,
      '@stylistic/rest-spread-spacing': 2,
      '@stylistic/template-curly-spacing': 2,
      '@stylistic/yield-star-spacing': 2,
      '@stylistic/no-multiple-empty-lines': [2, { max: 2 }],
      '@stylistic/object-curly-spacing': [2, 'always'],
      '@stylistic/quote-props': [2, 'consistent-as-needed'],
      '@stylistic/quotes': [2, 'single'],
      '@stylistic/space-before-function-paren': [2, {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],

      // eslint-plugin-import-x
      'import-x/no-unresolved': 2,
      // tsc checks named imports; import-x cannot follow the `export * from 'fs'` of the ambient
      // module in @types/fs-extra and would report every fs re-export as missing
      'import-x/named': 0,
      'import-x/default': 2,
      'import-x/namespace': 2,
      'import-x/no-absolute-path': 2,
      'import-x/no-dynamic-require': 2,
      'import-x/no-webpack-loader-syntax': 2,
      'import-x/export': 2,
      'import-x/no-named-as-default': 2,
      'import-x/no-named-as-default-member': 2,
      'import-x/no-deprecated': 2,
      'import-x/no-mutable-exports': 2,
      'import-x/unambiguous': 2,
      'import-x/no-commonjs': 2,
      'import-x/no-amd': 2,
      'import-x/first': 2,
      'import-x/no-duplicates': 2,
      'import-x/no-namespace': 2,
      'import-x/order': [2, { 'newlines-between': 'always' }],
      'import-x/newline-after-import': 2,
      'import-x/no-named-default': 2
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
];
