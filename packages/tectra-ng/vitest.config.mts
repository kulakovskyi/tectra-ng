import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  root,
  resolve: {
    alias: {
      '@tectra-ng/tokens': `${root}packages/tokens/src/index.ts`,
      '@tectra-ng/themes': `${root}packages/themes/src/index.ts`,
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/tectra-ng/schematics/**/*.spec.ts'],
    testTimeout: 30000,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['packages/tectra-ng/schematics/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.types.ts'],
      reportsDirectory: 'coverage/tectra-ng',
      reporter: ['text-summary', 'json-summary', 'lcovonly'],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
});
