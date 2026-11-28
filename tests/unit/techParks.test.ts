import { describe, expect, it } from 'vitest';
import { variant } from '../fixtures';
import { applyListing, DEFAULT_LISTING_STATE, matchesListing, parseListingState, serializeListingState } from '@/lib/listingFilters';
import { isNearPark, parkLabel, parkMatch, techParkById } from '@/lib/techParks';

const manyata = techParkById('manyata')!;
const itpl = techParkById('itpl')!;
const wipro = techParkById('sarjapur-wipro')!;
const itPark = (name: string, distanceKm: number | null, travelMins: number | null = null) => ({ id: name, category: 'it-park' as const, name, distanceKm, travelMins });

describe('tech park search', () => {
  it('uses the distance the brochure gives, under any of the park’s names', () => {
    const p = variant({ id: 'a', corridorId: 'whitefield', geo: null, nearby: [itPark('ITPB (International Tech Park)', 3.5)] });
    const m = parkMatch(p, itpl)!;
    expect(m).toMatchObject({ how: 'brochure', km: 3.5 });
    expect(parkLabel(m, itpl)).toBe('3.5 km to ITPL Whitefield');
  });

  it('falls back to the map pin, then to the park’s own areas', () => {
    const pinned = variant({ id: 'b', corridorId: 'sarjapur-road', geo: { lat: 13.06, lng: 77.62 }, nearby: [] });
    expect(parkMatch(pinned, manyata)?.how).toBe('map');
    expect(isNearPark(pinned, manyata, 5)).toBe(true);
    const unpinned = variant({ id: 'c', corridorId: 'thanisandra', geo: null, nearby: [] });
    expect(parkMatch(unpinned, manyata)?.how).toBe('area');
    const elsewhere = variant({ id: 'd', corridorId: 'mysore-road', geo: null, nearby: [] });
    expect(parkMatch(elsewhere, manyata)).toBeNull();
  });

  it('only trusts a shared name like "Wipro" in that park’s part of the city', () => {
    const ecity = variant({ id: 'e', corridorId: 'electronic-city', geo: null, nearby: [itPark('Wipro', 2)] });
    expect(parkMatch(ecity, wipro)).toBeNull();
    const sarjapur = variant({ id: 'f', corridorId: 'sarjapur-road', geo: null, nearby: [itPark('Wipro Corporate Office', 2)] });
    expect(parkMatch(sarjapur, wipro)?.how).toBe('brochure');
  });

  it('filters by distance, lists nearest first and keeps the choice in the URL', () => {
    const near = variant({ id: 'near', slug: 'near', corridorId: 'north-bengaluru', geo: null, nearby: [itPark('Manyata Tech Park', 2)] });
    const mid = variant({ id: 'mid', slug: 'mid', corridorId: 'north-bengaluru', geo: null, nearby: [itPark('Manyata Tech Park', null, 20)] });
    const far = variant({ id: 'far', slug: 'far', corridorId: 'north-bengaluru', geo: null, nearby: [itPark('Manyata Tech Park', 14)] });
    const state = parseListingState(new URLSearchParams('park=manyata'));
    expect(state.parkKm).toBe(10);
    expect(applyListing([far, mid, near], state).map((p) => p.id)).toEqual(['near', 'mid']);
    expect(matchesListing(far, { ...state, parkKm: 15 })).toBe(true);
    expect(serializeListingState({ ...DEFAULT_LISTING_STATE, park: 'manyata', parkKm: 15 })).toBe('park=manyata&pkm=15');
    expect(parseListingState(new URLSearchParams('park=nowhere')).park).toBe('');
  });
});
