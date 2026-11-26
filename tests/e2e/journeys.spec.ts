import { expect, filtersApplied, listings, noHorizontalScroll, quiet, test } from './helpers';

test.describe('first visit', () => {
  test('cookie banner: "Essential only" saves the choice and stays gone', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('region', { name: /cookie preferences/i }).or(page.getByLabel(/cookie preferences/i));
    await expect(banner.first()).toBeVisible();
    await page.getByRole('button', { name: /essential only/i }).click();
    await expect(page.getByRole('button', { name: /essential only/i })).toBeHidden();
    await page.reload();
    await expect(page.getByRole('button', { name: /essential only/i })).toBeHidden();
    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('estatenav:consent') ?? 'null'));
    expect(consent).toMatchObject({ analytics: false });
  });

  test('welcome concierge: goal → region → budget → details, then matches', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('estatenav:consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: '2026-11' })));
    await page.goto('/');
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByText('A home to live in').click();
    await dialog.getByText('Anywhere good').click();
    await dialog.getByText('Not sure yet').click();
    const inputs = dialog.locator('input:not([type=hidden]):not([name=website])');
    await inputs.nth(0).fill('Test Buyer');
    await inputs.nth(1).fill('9876543210');
    await dialog.getByRole('button', { name: /show my matches/i }).click();
    await expect(dialog.getByRole('button', { name: /keep browsing|show my picks/i })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('estatenav:concierge') ?? 'null'));
    expect(saved?.state).toBe('done');
  });

  test('welcome concierge can be closed and does not come straight back', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('estatenav:consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: '2026-11' })));
    await page.goto('/');
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await page.waitForTimeout(7000);
    await expect(page.locator('dialog[open]')).toBeHidden();
  });
});

test.describe('finding a property', () => {
  test.beforeEach(async ({ page }) => quiet(page));

  test('search by project name puts that project first', async ({ page }) => {
    const target = listings.find((p) => p.title.includes('Aaria'))!;
    await page.goto(`/properties?q=${encodeURIComponent('aaria')}`);
    await filtersApplied(page);
    const first = page.getByTestId('results').locator('a[href^="/properties/"]').first();
    await expect(first).toHaveAttribute('href', `/properties/${target.slug}`);
  });

  test('"plots in whitefield" finds only Whitefield plots', async ({ page }) => {
    await page.goto(`/properties?q=${encodeURIComponent('plots in whitefield')}`);
    await filtersApplied(page);
    const hrefs = await page.getByTestId('results').locator('a[href^="/properties/"]').evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('href')))));
    const expected = listings.filter((p) => p.segment === 'plot' && p.corridorId === 'whitefield').map((p) => `/properties/${p.slug}`);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(expected).toContain(h);
  });

  test('a search with no results says so and offers a way out', async ({ page }) => {
    await page.goto('/properties?q=zzzz-no-such-place');
    await filtersApplied(page);
    await expect(page.getByRole('heading', { name: /nothing listed here yet/i })).toBeVisible();
    await expect(page.getByTestId('results')).toHaveCount(0);
    await expect(page.locator('main a[href*="wa.me"], main a[href^="/contact"]').first()).toBeVisible();
  });

  test('type chips filter the list and update the address', async ({ page }) => {
    await page.goto('/properties');
    await page.getByRole('group', { name: 'Property type' }).getByRole('button', { name: /^Plots/ }).click();
    await expect(page).toHaveURL(/seg=plot/);
    await filtersApplied(page);
    await expect(page.getByRole('group', { name: 'Property type' }).getByRole('button', { name: /^Plots/ })).toHaveAttribute('aria-pressed', 'true');
    const hrefs = await page.getByTestId('results').locator('a[href^="/properties/"]').evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('href')))));
    const plots = listings.filter((p) => p.segment === 'plot').map((p) => `/properties/${p.slug}`);
    for (const h of hrefs) expect(plots).toContain(h);
  });

  test('garbage in the address does not break the explore page', async ({ page }) => {
    const res = await page.goto('/properties?seg=castle&bhk=-1,abc&min=lots&sort=%3Cscript%3E&zone=mars&q=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
    expect(res?.status()).toBe(200);
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('a search page links to each listing on it', async ({ page }) => {
    await page.goto('/bangalore/sarjapur-road');
    const expected = listings.filter((p) => p.corridorId === 'sarjapur-road');
    for (const p of expected) await expect(page.locator(`main a[href="/properties/${p.slug}"]`).first()).toBeAttached();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('heading', { name: /questions buyers ask/i })).toBeVisible();
  });
});

test.describe('a property page', () => {
  test.beforeEach(async ({ page }) => quiet(page));
  const withGallery = listings.find((p) => p.media.gallery.length > 2)!;

  test('photos open in a viewer that moves and closes with the keyboard', async ({ page }) => {
    await page.goto(`/properties/${withGallery.slug}`);
    await page.locator('main button:has(img), main [role="button"]:has(img)').first().click();
    const viewer = page.getByRole('dialog', { name: /photos/i });
    await expect(viewer).toBeVisible();
    const counter = viewer.getByText(/^\d+ \/ \d+$/);
    const before = await counter.textContent();
    await page.keyboard.press('ArrowRight');
    await expect(counter).not.toHaveText(before!);
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText(before!);
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
  });

  test('all photos on the page actually load', async ({ page }) => {
    await page.goto(`/properties/${withGallery.slug}`);
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('main img')) as HTMLImageElement[];
      for (const img of imgs) {
        img.loading = 'eager';
        img.scrollIntoView();
      }
      await new Promise((r) => setTimeout(r, 2500));
      return imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
    });
    expect(broken).toEqual([]);
  });

  test('WhatsApp enquiry names the project', async ({ page }) => {
    await page.goto(`/properties/${withGallery.slug}`);
    const wa = page.locator('main a[href*="wa.me"]').first();
    const text = decodeURIComponent((await wa.getAttribute('href'))!.split('text=')[1] ?? '');
    expect(text).toContain(withGallery.title);
    expect(text.startsWith('Hi EstateNav')).toBe(true);
  });

  test('section links jump to their sections, including FAQs', async ({ page }) => {
    await page.goto(`/properties/${withGallery.slug}`);
    await expect(page.locator('#faq')).toBeAttached();
    await expect(page.locator('#overview')).toBeAttached();
  });
});

test.describe('enquiries (sample data: nothing is stored live or emailed)', () => {
  test.beforeEach(async ({ page }) => quiet(page));

  test('contact form: errors first, then a registered request', async ({ page }) => {
    await page.goto('/contact?intent=price-sheet');
    const form = page.locator('main form');
    await form.getByRole('button', { name: /unlock|send|schedule/i }).click();
    await expect(form.getByText(/please enter your name/i)).toBeVisible();
    await form.getByLabel(/^name/i).fill('QA Tester');
    await form.getByLabel(/mobile/i).fill('98765 43210');
    await form.getByRole('button', { name: /unlock|send|schedule/i }).click();
    await expect(page.getByRole('status')).toContainText(/request registered/i);
  });

  test('list your property: strip → form, prefilled and sent', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('list-property').click();
    await page.getByRole('link', { name: /fill a short form/i }).click();
    await expect(page).toHaveURL(/intent=list-property/);
    await expect(page.locator('h1')).toHaveText('List your property');
    const form = page.locator('main form');
    await expect(form.getByLabel(/message/i)).toHaveValue(/list my property/);
    await form.getByLabel(/^name/i).fill('Owner QA');
    await form.getByLabel(/mobile/i).fill('9876543210');
    await form.getByRole('button', { name: /send property details/i }).click();
    await expect(page.getByRole('status')).toContainText(/request registered/i);
  });

  test('list your property: WhatsApp option carries the starter text', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('list-property').click();
    const href = await page.getByRole('link', { name: /message on whatsapp/i }).getAttribute('href');
    expect(decodeURIComponent(href!)).toContain("I'd like to list my property");
  });
});

test.describe('works on any screen', () => {
  test.beforeEach(async ({ page }) => quiet(page));
  for (const path of ['/', '/properties', '/bangalore', `/properties/${listings[0].slug}`, '/contact', '/blogs']) {
    test(`no sideways scrolling on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await noHorizontalScroll(page);
    });
  }

  test('theme switch changes and remembers the theme', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the theme switch sits in the menu on phones');
    await page.goto('/');
    const html = page.locator('html');
    const before = (await html.getAttribute('class')) ?? '';
    await page.getByRole('button', { name: /theme|dark|light/i }).first().click();
    await expect.poll(async () => (await html.getAttribute('class'))?.includes('dark')).toBe(!before.includes('dark'));
    await page.reload();
    await expect.poll(async () => (await html.getAttribute('class'))?.includes('dark')).toBe(!before.includes('dark'));
  });

  test('phone menu opens and links to listing your property', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phones only');
    await page.goto('/');
    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.getByRole('link', { name: /list your property/i }).last()).toBeVisible();
  });
});
