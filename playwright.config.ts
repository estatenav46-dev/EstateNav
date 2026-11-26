import { defineConfig, devices } from '@playwright/test';

// End-to-end QA: a production build served with the in-memory sample data (9 listings), so tests
// never read or write the live Firestore, never upload to Cloudinary and never send email.
const PORT = 3100;
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE, trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'en-IN', timezoneId: 'Asia/Kolkata' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start -- -p 3100',
    url: BASE,
    timeout: 15 * 60_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NEXT_DIST_DIR: '.next_e2e',
      NEXT_PUBLIC_DATA_SOURCE: 'mock',
      NEXT_PUBLIC_SITE_URL: BASE,
      NEXT_PUBLIC_ADMIN_PREVIEW: 'false',
      EMAILJS_SERVICE_ID: '',
      EMAILJS_TEMPLATE_ID: '',
      EMAILJS_PUBLIC_KEY: '',
      REVALIDATION_SECRET: 'e2e-secret',
    },
  },
});
