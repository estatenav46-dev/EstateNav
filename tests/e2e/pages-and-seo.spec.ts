import { allowDocument404, expect, jsonLd, landingPaths, listings, quiet, test } from './helpers';

// Every public URL the sitemap lists, plus pages it leaves out on purpose.
test.describe('every page loads with sound SEO', () => {
  test('sitemap lists the home page, search pages, every listing and nothing private', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]).pathname);
    expect(urls).toContain('/');
    expect(urls).toContain('/bangalore');
    for (const p of listings) expect(urls).toContain(`/properties/${p.slug}`);
    for (const path of landingPaths) expect(urls).toContain(path);
    expect(urls.some((u) => u.startsWith('/admin') || u.startsWith('/shortlist') || u.includes('?'))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });

  test('robots.txt allows the site, blocks private paths and names the sitemap', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/User-Agent: \*/i);
    expect(robots).toMatch(/Allow: \//);
    expect(robots).toMatch(/Disallow: \/admin/);
    expect(robots).toMatch(/Disallow: \/api\//);
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });

  test('llms.txt describes the business and links every listing', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.headers()['content-type']).toContain('text/plain');
    const text = await res.text();
    expect(text.startsWith('# EstateNav')).toBe(true);
    expect(text).toMatch(/Bengaluru \(Bangalore\)/);
    for (const p of listings) expect(text).toContain(`/properties/${p.slug}`);
  });

  const pages = ['/', '/properties', '/bangalore', ...landingPaths, ...listings.map((p) => `/properties/${p.slug}`), '/blogs', '/contact', '/contact?intent=list-property'];
  for (const path of pages) {
    test(`page ${path}`, async ({ page }) => {
      await quiet(page);
      const res = await page.goto(path);
      expect(res?.status(), 'HTTP status').toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();

      const title = await page.title();
      expect(title.length, `title "${title}"`).toBeGreaterThan(10);
      expect(title.length, `title "${title}"`).toBeLessThanOrEqual(80);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0, 'meta description length').toBeGreaterThanOrEqual(50);
      expect(description?.length ?? 0, 'meta description length').toBeLessThanOrEqual(170);
      expect(description).not.toMatch(/undefined|null|NaN/);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'canonical').toMatch(/^https?:\/\//);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en-IN');

      const data = await jsonLd(page);
      expect(data.some((d) => d['@type'] === 'WebSite')).toBe(true);
      for (const d of data) expect(d['@context']).toBe('https://schema.org');

      // Every image carries an alt attribute (empty is fine for decoration).
      const missingAlt = await page.locator('img:not([alt])').count();
      expect(missingAlt, 'images without alt').toBe(0);
    });
  }

  test('titles are unique across listings and search pages', async ({ page }) => {
    await quiet(page);
    const titles = new Map<string, string>();
    for (const path of [...landingPaths, ...listings.map((p) => `/properties/${p.slug}`)]) {
      await page.goto(path);
      const t = await page.title();
      expect(titles.get(t), `duplicate title on ${path}`).toBeUndefined();
      titles.set(t, path);
    }
  });

  test('a property page carries product, place, FAQ and breadcrumb data', async ({ page }) => {
    await quiet(page);
    const p = listings[0];
    await page.goto(`/properties/${p.slug}`);
    const types = (await jsonLd(page)).map((d) => d['@type']);
    expect(types).toEqual(expect.arrayContaining(['Product', 'FAQPage', 'BreadcrumbList']));
    await expect(page.getByRole('heading', { name: new RegExp(`${p.title.slice(0, 15)}.*common questions`, 'i') })).toBeVisible();
  });
});

test.describe('pages that must not exist', () => {
  for (const path of ['/properties/no-such-project', '/bangalore/nowhere', '/bangalore/whitefield/castles', '/bangalore/west-bangalore', '/totally/unknown/page']) {
    test(`404 for ${path}`, async ({ page, errors }) => {
      await quiet(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      allowDocument404(errors);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByRole('link', { name: /home|explore|browse/i }).first()).toBeVisible();
      allowDocument404(errors);
    });
  }

  test('the old /admin preview is closed', async ({ page, errors }) => {
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
    allowDocument404(errors);
    await expect(page.getByText(/NEXT_PUBLIC_ADMIN_PREVIEW/)).toHaveCount(0);
    allowDocument404(errors);
  });
});
