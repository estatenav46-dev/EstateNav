import { describe, expect, it } from 'vitest';
import { properties } from '../fixtures';
import { applyListing, DEFAULT_LISTING_STATE, parseListingState, queryTokens, serializeListingState } from '@/lib/listingFilters';

const search = (q: string) => applyListing(properties, { ...DEFAULT_LISTING_STATE, q });
const titles = (q: string) => search(q).map((p) => p.title);

describe('search by project name', () => {
  it.each(properties.map((p) => [p.title]))('puts "%s" first when searched by its name', (title) => {
    expect(titles(title)[0]).toBe(title);
  });

  it('finds a project from part of its name, in any case', () => {
    expect(titles('silicon shine')[0]).toBe('Abhee Silicon Shine (Phase 2)');
    expect(titles('AARIA')[0]).toBe('Abhee Aaria');
  });

  it('ignores punctuation and filler words', () => {
    expect(titles('silicon shine phase 2')[0]).toBe('Abhee Silicon Shine (Phase 2)');
    expect(titles('Abhee Aaria Bangalore')[0]).toBe('Abhee Aaria');
    expect(titles('prestige tech cloud - tower b')[0]).toBe('Prestige Tech Cloud – Tower B');
  });
});

describe('search by place, builder and type', () => {
  it('understands "plots in whitefield"', () => {
    const hits = search('plots in whitefield');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((p) => p.segment === 'plot' && p.corridorName === 'Whitefield')).toBe(true);
  });

  it('understands "flats in sarjapur road"', () => {
    const hits = search('flats in sarjapur road');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((p) => p.segment === 'residential' && p.corridorName === 'Sarjapur Road')).toBe(true);
  });

  it('understands BHK written either way', () => {
    const a = search('2bhk').map((p) => p.id);
    const b = search('2 BHK').map((p) => p.id);
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b);
  });

  it('finds every listing by a builder', () => {
    expect(search('prestige').every((p) => p.developerName === 'Prestige Group')).toBe(true);
  });

  it('returns everything for an empty or filler-only search', () => {
    expect(search('').length).toBe(properties.length);
    expect(search('   ').length).toBe(properties.length);
    expect(search('property in bangalore').length).toBe(properties.length);
  });

  it('returns nothing (and does not throw) for nonsense and odd input', () => {
    expect(search('zzzz-not-a-project')).toEqual([]);
    expect(() => search('<script>alert(1)</script>')).not.toThrow();
    expect(() => search('(((.*')).not.toThrow();
    expect(() => search('x'.repeat(5000))).not.toThrow();
  });
});

describe('tokens', () => {
  it('drops stop words and joins BHK', () => {
    expect(queryTokens('3 BHK flats in Bangalore')).toEqual(['3bhk', 'flats']);
    expect(queryTokens('Électronic City')).toEqual(['electronic', 'city']);
  });
});

describe('explore URLs', () => {
  it('round-trips the filter state', () => {
    const state = parseListingState(new URLSearchParams('seg=residential&zone=east&corridor=whitefield&bhk=2,3&min=5000000&max=20000000&pos=ready&sort=price-asc'));
    expect(parseListingState(new URLSearchParams(serializeListingState(state)))).toEqual(state);
  });

  it('ignores invalid values instead of failing', () => {
    const s = parseListingState(new URLSearchParams('seg=castle&bhk=abc,-2,3&min=lots&sort=random&zone=mars&status=nope'));
    expect(s.seg).toBe('');
    expect(s.bhk).toEqual([3]);
    expect(s.min).toBeNull();
    expect(s.sort).toBe('relevance');
    expect(s.zone).toBe('');
    expect(s.status).toEqual([]);
  });

  it('still understands links from the old site', () => {
    const s = parseListingState(new URLSearchParams('for=buy&locality=whitefield&budgetMax=15000000&possession=ready'));
    expect(s.seg).toBe('residential');
    expect(s.q).toBe('whitefield');
    expect(s.max).toBe(15_000_000);
    expect(s.possession).toBe('ready');
  });
});
