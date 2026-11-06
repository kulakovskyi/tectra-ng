import nx from '@nx/eslint-plugin';

const DEPENDENCY_RULES = [
  { sourceTag: 'pkg:tokens', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'pkg:themes', onlyDependOnLibsWithTags: ['pkg:tokens'] },
  { sourceTag: 'pkg:icons', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'pkg:brand-icons', onlyDependOnLibsWithTags: ['pkg:icons'] },
  { sourceTag: 'pkg:flags', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'pkg:core', onlyDependOnLibsWithTags: ['pkg:themes', 'pkg:tokens'] },
  { sourceTag: 'pkg:ui', onlyDependOnLibsWithTags: ['pkg:core', 'pkg:icons', 'pkg:themes', 'pkg:tokens'] },
  { sourceTag: 'pkg:blocks', onlyDependOnLibsWithTags: ['pkg:ui', 'pkg:core', 'pkg:icons', 'pkg:themes', 'pkg:tokens'] },
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
  { sourceTag: 'type:e2e', onlyDependOnLibsWithTags: ['*'] },
];

export default [
  {
    ignores: ['**/dist', '**/node_modules', '**/.nx', '**/.angular', 'apps/docs/src/generated', 'test-results', 'playwright-report', '.wrangler'],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': ['error', { enforceBuildableLibDependency: true, allow: [], depConstraints: DEPENDENCY_RULES }],
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['packages/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': ['error', { type: ['element', 'attribute'], prefix: 'tx', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'tx', style: 'camelCase' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['apps/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', 'e2e/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off',
    },
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='viewportSize']",
          message: 'The scrollbar can take part of the window (0px on macOS, ~10px on Linux / Windows). Measure against layoutViewport(page) from ./helpers.',
        },
        {
          selector: "MemberExpression[property.name=/^inner(Width|Height)$/]",
          message: 'innerWidth / innerHeight include the scrollbar. Use document.documentElement.clientWidth / clientHeight or layoutViewport(page) from ./helpers.',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/elements-content': ['error', { allowList: ['aria-label', 'aria-labelledby', 'label', 'title', 'innerHTML', 'innerText', 'txTooltip'] }],
    },
  },
];
