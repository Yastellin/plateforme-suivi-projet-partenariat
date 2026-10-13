import { defineConfig } from 'vitest/config';
import path from 'path';

const origineApi = process.env.URL_API_INTEGRATION ?? 'http://localhost:3000';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      cn: path.resolve(import.meta.dirname, './src/lib/utils.ts'),
    },
  },
  test: {
    include: ['tests/integration/**/*.integration.tsx'],
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: origineApi } },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
