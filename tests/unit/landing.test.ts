import { describe, expect, it } from 'vitest';
import { corridors, properties, variant } from '../fixtures';
import {
  allLandingPages,
  CITY_PLACE,
  exploreHref,
  FILTERS,
  filterBySlug,
  landingFacts,
  landingFaqs,
  landingHeading,
  landingPath,
  landingPlaces,
  landingSummary,
  resolveLanding,
} from '@/lib/landing';

const pages = allLandingPages(properties, corridors);
const paths = pages.map((p) => p.path);

describe('which search pages exist', () => {
  it('has a page for every area that has a listing, and none for empty areas', () => {
    for (const c of corridors) {
      const count = properties.filter((p) => p.corridorId === c.id).length;
      expect(paths.includes(`/bangalore/${c.slug}`)).toBe(count >= 1);
    }
  });

  it('never creates a place + filter page with fewer than two listings', () => {
    for (const p of pages.filter((x) => x.place.kind !== 'city' && x.filter)) expect(p.listings.length).toBeGreaterThanOrEqual(2);
  });

  it('has city-wide pages for flats, plots and offices from the sample data', () => {
    expect(paths).toEqual(expect.arrayContaining(['/bangalore/flats', '/bangalore/plots', '/bangalore/offices']));
  });

  it('gives every page a unique, lower-case, hyphenated path under /bangalore', () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(p).toMatch(/^\/bangalore(\/[a-z0-9-]+){1,2}$/);
  });

  it('lists only matching listings on each page', () => {
    for (const page of pages) {
      for (const listing of page.listings) {
        expect(page.place.match(listing)).toBe(true);
        if (page.filter) expect(page.filter.match(listing)).toBe(true);
      }
    }
  });

  it('keeps area slugs and filter slugs from colliding', () => {
    const filterSlugs = new Set(FILTERS.map((f) => f.slug));
    for (const place of landingPlaces(corridors)) expect(filterSlugs.has(place.slug)).toBe(false);
  });
});

describe('resolving a URL', () => {
  it('finds an area page', () => {
    const page = resolveLanding(['whitefield'], properties, corridors);
    expect(page?.place.kind).toBe('area');
    expect(page?.listings.every((p) => p.corridorId === 'whitefield')).toBe(true);
  });

  it('treats a single filter slug as a city-wide page', () => {
    const page = resolveLanding(['plots'], properties, corridors);
    expect(page?.place).toBe(CITY_PLACE);
    expect(page?.listings.every((p) => p.segment === 'plot')).toBe(true);
  });

  it('finds region pages by their -bangalore slug', () => {
    const page = resolveLanding(['south-east-bangalore'], properties, corridors);
    expect(page?.place.kind).toBe('region');
    expect(page?.listings.length).toBeGreaterThan(0);
  });

  it.each([
    [['nowhere']],
    [['whitefield', 'castles']],
    [['whitefield', 'offices']], // no offices there
    [['west-bangalore']], // region with no listings yet
    [['a', 'b', 'c']],
    [[]],
  ])('returns null for %j', (segments) => {
    expect(resolveLanding(segments as string[], properties, corridors)).toBeNull();
  });

  it('returns nothing at all when the catalogue is empty', () => {
    expect(allLandingPages([], corridors)).toEqual([]);
    expect(resolveLanding(['flats'], [], corridors)).toBeNull();
  });
});

describe('filters', () => {
  it('counts 2.5 BHK as a 2 BHK home', () => {
    const p = variant({ segment: 'residential', transaction: 'sale', bhkOptions: [2.5] });
    expect(filterBySlug('2-bhk-flats')!.match(p)).toBe(true);
    expect(filterBySlug('3-bhk-flats')!.match(p)).toBe(false);
  });

  it('leaves price-on-request and ₹1 placeholder prices out of budget pages', () => {
    const under = filterBySlug('flats-under-1-crore')!;
    expect(under.match(variant({ segment: 'residential', transaction: 'sale', priceMin: 9_000_000, priceOnRequest: false }))).toBe(true);
    expect(under.match(variant({ segment: 'residential', transaction: 'sale', priceMin: 9_000_000, priceOnRequest: true }))).toBe(false);
    expect(under.match(variant({ segment: 'residential', transaction: 'sale', priceMin: 1, priceOnRequest: false }))).toBe(false);
  });

  it('keeps rentals out of sale pages', () => {
    const rental = variant({ segment: 'residential', transaction: 'rent' });
    expect(filterBySlug('flats')!.match(rental)).toBe(false);
    expect(filterBySlug('flats-for-rent')!.match(rental)).toBe(true);
  });

  it('builds the matching explore link', () => {
    const page = resolveLanding(['whitefield'], properties, corridors)!;
    expect(exploreHref(page.place, filterBySlug('flats'))).toBe('/properties?zone=east&corridor=whitefield&seg=residential');
    expect(exploreHref(CITY_PLACE, null)).toBe('/properties');
  });
});

describe('words on the page', () => {
  it('writes a heading with the type and the place', () => {
    const page = resolveLanding(['whitefield'], properties, corridors)!;
    expect(landingHeading({ place: page.place, filter: filterBySlug('plots') })).toBe('Plots for sale in Whitefield, Bangalore');
    expect(landingPath(page.place, filterBySlug('plots'))).toBe('/bangalore/whitefield/plots');
  });

  it('states the real count and price range in the summary', () => {
    const page = resolveLanding(['sarjapur-road'], properties, corridors)!;
    const summary = landingSummary(page);
    expect(summary).toContain(`${page.listings.length} verified projects`);
    expect(summary).toMatch(/priced .*(L|Cr)/);
  });

  it('answers FAQs from the data, including RERA coverage', () => {
    const page = resolveLanding(['flats'], properties, corridors)!;
    const faqs = landingFaqs(page);
    expect(faqs.length).toBeGreaterThanOrEqual(4);
    expect(faqs.find((f) => /RERA/.test(f.q))?.a).toMatch(/K-RERA/);
    for (const f of faqs) {
      expect(f.q.endsWith('?')).toBe(true);
      expect(f.a.length).toBeGreaterThan(20);
      expect(f.a).not.toMatch(/undefined|null|NaN/);
    }
  });

  it('works out facts without a price', () => {
    const facts = landingFacts([variant({ priceOnRequest: true })]);
    expect(facts.minPrice).toBeNull();
    expect(facts.count).toBe(1);
  });
});
