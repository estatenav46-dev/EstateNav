import { describe, expect, it } from 'vitest';
import { corridors, properties, variant } from '../fixtures';
import { breadcrumbJsonLd, faqJsonLd, propertyBreadcrumbs, propertyFaqs, propertyJsonLd, propertyPlaceJsonLd, propertySeo, siteJsonLd } from '@/lib/seo';
import { seedSettings } from '@/lib/data/adapters/mock/seed';

describe('property titles and descriptions', () => {
  it('uses the admin-written title and description when present', () => {
    const p = variant({ seo: { title: 'Custom title', description: 'Custom description', ogImageId: null } });
    expect(propertySeo(p)).toEqual({ title: 'Custom title', description: 'Custom description' });
  });

  it.each(properties.map((p) => [p.title, p]))('falls back to a searchable title and description for %s', (_t, base) => {
    const p = { ...(base as (typeof properties)[number]), seo: { title: '', description: '', ogImageId: null } };
    const { title, description } = propertySeo(p);
    expect(title.startsWith(p.title.slice(0, 20))).toBe(true);
    expect(title).toMatch(/Bangalore/);
    expect(title.length).toBeLessThanOrEqual(70);
    expect(description).toMatch(/Bengaluru/);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).not.toMatch(/undefined|null/);
  });

  it('replaces a title the importer cut short with "…"', () => {
    const p = variant({ seo: { title: 'Abhee Celestial City | 2 BHK, 3 BHK Apartments in Sarjapur Road, Beng…', description: '', ogImageId: null } });
    expect(propertySeo(p).title.endsWith('…')).toBe(false);
    expect(propertySeo(p).title).toMatch(/Bangalore$/);
  });

  it('says "Price on request" instead of a price when hidden', () => {
    const p = variant({ priceOnRequest: true, seo: { title: '', description: '', ogImageId: null } });
    expect(propertySeo(p).description).toMatch(/Price on request/);
    expect(propertyFaqs(p).find((f) => /price/i.test(f.q))?.a).toMatch(/on request/);
  });
});

describe('structured data', () => {
  it('drops offers when the price is on request', () => {
    expect(propertyJsonLd(variant({ priceOnRequest: true }))).not.toHaveProperty('offers');
    expect(propertyJsonLd(variant({ priceOnRequest: false }))).toHaveProperty('offers.lowPrice');
  });

  it('adds the map pin only when the listing has one', () => {
    expect(propertyPlaceJsonLd(variant({ geo: null }))).not.toHaveProperty('geo');
    expect(propertyPlaceJsonLd(variant({ geo: { lat: 12.9, lng: 77.6 } }))).toHaveProperty('geo.latitude', 12.9);
  });

  it('links breadcrumbs to the area search page', () => {
    const p = properties.find((x) => x.corridorId === 'whitefield')!;
    const crumbs = propertyBreadcrumbs(p, corridors);
    expect(crumbs.map((c) => c.path)).toEqual(['/', '/bangalore', '/bangalore/whitefield', `/properties/${p.slug}`]);
    expect(breadcrumbJsonLd(crumbs).itemListElement[2].item).toBe('https://estatenav.in/bangalore/whitefield');
  });

  it('falls back to the explore link for an unknown area', () => {
    const crumbs = propertyBreadcrumbs(variant({ corridorId: 'mystery' }), corridors);
    expect(crumbs[2].path).toBe('/properties?corridor=mystery');
  });

  it('produces JSON that survives a round trip for every listing', () => {
    for (const p of properties) {
      const data = [propertyJsonLd(p), propertyPlaceJsonLd(p), faqJsonLd(propertyFaqs(p))];
      expect(JSON.parse(JSON.stringify(data))).toEqual(data);
    }
  });

  it('describes the site and organisation', () => {
    const [site, org] = siteJsonLd(seedSettings);
    expect(site['@type']).toBe('WebSite');
    expect(org).toMatchObject({ '@type': 'Organization', areaServed: { alternateName: 'Bangalore' } });
  });
});
