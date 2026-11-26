import { test as base, expect, type Page } from '@playwright/test';
import { seedCorridors, seedProperties } from '../../lib/data/adapters/mock/seed';
import { allLandingPages } from '../../lib/landing';
import { registerCorridorZones } from '../../lib/regions';

registerCorridorZones(seedCorridors);
export const listings = seedProperties.filter((p) => p.status === 'published');
export const landingPaths = allLandingPages(listings, seedCorridors).map((p) => p.path);

// Noise from outside the site (third-party image CDNs and Firebase's auth iframe), not app errors.
const IGNORED = [/Failed to load resource.*(unsplash|googleapis|gstatic|firebase|identitytoolkit)/i, /Download the React DevTools/i];

/** Every page test fails on a JavaScript error or console error from the site itself. */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) errors.push(`console: ${m.text()}`);
      });
      await use(errors);
      expect(errors, 'no JavaScript or console errors').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Answer the cookie banner and the welcome dialog in advance, for tests about something else. */
export async function quiet(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('estatenav:consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: '2026-11' }));
    localStorage.setItem('estatenav:concierge', JSON.stringify({ state: 'done', at: new Date().toISOString(), count: 1 }));
  });
}

/** All JSON-LD blocks on the page, parsed (a broken block fails the test). */
export async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => {
    const data = JSON.parse(b);
    return Array.isArray(data) ? data : [data];
  });
}

/** The explore page applies URL filters in the browser; wait until it has (results are hidden till then). */
export async function filtersApplied(page: Page) {
  await expect(page.locator('html')).not.toHaveAttribute('data-listing-pending', /.*/);
}

/** On pages expected to 404, the browser logs the document's own 404; that is not an app error. */
export function allowDocument404(errors: string[]) {
  const keep = errors.filter((e) => !/status of 404/.test(e));
  errors.splice(0, errors.length, ...keep);
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'page scrolls sideways').toBeLessThanOrEqual(1);
}
