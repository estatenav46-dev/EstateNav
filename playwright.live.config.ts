import { defineConfig, devices } from '@playwright/test';

// Read-only smoke test against real data: a running site (default: the Vercel test URL), e.g.
//   LIVE_URL=https://estatenav.in npm run test:live
// It only loads pages and files; it never submits a form, signs in or changes anything.
export default defineConfig({
  testDir: 'tests/live',
  timeout: 90_000,
  retries: 1,
  reporter: [['list']],
  use: { baseURL: process.env.LIVE_URL || 'https://estate-nav-sigma.vercel.app', locale: 'en-IN' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
