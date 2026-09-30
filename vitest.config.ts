import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx', 'apps/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/console/src'),
    },
  },
});
