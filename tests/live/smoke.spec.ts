import { expect, test } from '@playwright/test';

// Works with any catalogue size, including an empty one before the first listing is published.
const quiet = async (page: import('@playwright/test').Page) =>
  page.addInitScript(() => {
    localStorage.setItem('estatenav:consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: '2026-11' }));
    localStorage.setItem('estatenav:concierge', JSON.stringify({ state: 'done', at: new Date().toISOString(), count: 1 }));
  });

test('robots.txt and sitemap.xml are served and point at the right host', async ({ request, baseURL }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Sitemap: https?:\/\//);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('<urlset');
  // A deployed site must never publish localhost addresses (a local run uses .env.local's address).
  if (!/localhost/.test(baseURL ?? '')) expect(xml).not.toMatch(/localhost/);
});

test('every URL in the sitemap answers 200 with a title, H1 and canonical', async ({ page, request }) => {
  test.setTimeout(10 * 60_000);
  await quiet(page);
  const xml = await (await request.get('/sitemap.xml')).text();
  const paths = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]).pathname);
  expect(paths.length).toBeGreaterThan(0);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
  for (const path of paths) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1'), path).toHaveCount(1);
    expect((await page.title()).length, path).toBeGreaterThan(10);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('missing pages are real 404s', async ({ page }) => {
  for (const path of ['/properties/no-such-project-qa', '/totally/unknown/page-qa']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
  }
});

test('home page shows the list-your-property strip and no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await quiet(page);
  await page.goto('/');
  await page.getByTestId('list-property').click();
  await expect(page.getByRole('link', { name: /fill a short form/i })).toBeVisible();
  expect(errors).toEqual([]);
});
