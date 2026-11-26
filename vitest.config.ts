import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Unit tests (tests/unit, Node) and component tests (tests/component, jsdom). End-to-end tests
// live in tests/e2e and run with Playwright (playwright.config.ts).
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname) } },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.tsx'],
    environment: 'node',
    environmentMatchGlobs: [['tests/component/**', 'jsdom']],
    setupFiles: ['tests/setup.ts'],
    env: { NEXT_PUBLIC_DATA_SOURCE: 'mock', NEXT_PUBLIC_SITE_URL: 'https://estatenav.in' },
    restoreMocks: true,
  },
});
