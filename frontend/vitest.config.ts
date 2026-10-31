import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      cn: path.resolve(import.meta.dirname, './src/lib/utils.ts'),
    },
  },
  test: {
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/features/export/**/*.test.ts',
      'src/features/export/**/*.test.tsx',
    ],
    environment: 'node',
  },
});
