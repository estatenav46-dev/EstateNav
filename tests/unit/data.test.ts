import { describe, expect, it } from 'vitest';
import { properties, variant } from '../fixtures';
import { toCardView, toPublicProperty } from '@/lib/data/publicView';
import { propertySchema } from '@/lib/data/schemas';
import { registerCorridorZones, zoneOfCorridor } from '@/lib/regions';
import { similarProperties } from '@/lib/similar';
import { mockRepos } from '@/lib/data/adapters/mock';

describe('sample data', () => {
  it('every sample listing passes the data model', () => {
    for (const p of properties) expect(propertySchema.safeParse(p).success).toBe(true);
  });

  it('has unique ids and slugs', () => {
    expect(new Set(properties.map((p) => p.id)).size).toBe(properties.length);
    expect(new Set(properties.map((p) => p.slug)).size).toBe(properties.length);
  });

  it('the mock repository returns only published listings', async () => {
    const published = await mockRepos.properties.list({ status: 'published' });
    expect(published.every((p) => p.status === 'published')).toBe(true);
  });
});

describe('what reaches the browser', () => {
  it('removes links to on-request documents', () => {
    const p = variant({
      documents: [
        { id: 'd1', label: 'Price sheet', kind: 'price-sheet', access: 'on-request', url: 'https://secret.example/price.pdf', storagePath: 'x', bytes: null, external: false },
        { id: 'd2', label: 'Brochure', kind: 'brochure', access: 'public', url: 'https://cdn.example/brochure.pdf', storagePath: 'y', bytes: null, external: false },
      ] as never,
    });
    const pub = toPublicProperty(p);
    expect(JSON.stringify(pub)).not.toContain('secret.example');
    expect(pub.documents.find((d) => d.id === 'd2')?.url).toBe('https://cdn.example/brochure.pdf');
  });

  it('falls back to the first gallery photo when the cover was removed', () => {
    const p = properties.find((x) => x.media.gallery.length > 1)!;
    const removed = { ...p, media: { ...p.media, cover: { ...p.media.cover, id: 'gone' } } };
    expect(toPublicProperty(removed).media.cover.id).toBe(p.media.gallery[0].id);
  });

  it('keeps cards light: no description, documents or full gallery', () => {
    const card = toCardView(properties[0]);
    expect(card.description).toBe('');
    expect(card.documents).toEqual([]);
    expect(card.media.gallery.length).toBeLessThanOrEqual(8);
  });
});

describe('regions', () => {
  it('uses the region set in the admin over the built-in map', () => {
    registerCorridorZones([{ id: 'test-area', zone: 'north' }]);
    expect(zoneOfCorridor('test-area')).toBe('north');
  });

  it('puts unknown areas under "other"', () => {
    expect(zoneOfCorridor('nowhere-at-all')).toBe('other');
  });
});

describe('similar homes', () => {
  it('never suggests the listing itself, and respects the limit', () => {
    for (const p of properties) {
      const similar = similarProperties(p, properties, 3);
      expect(similar.length).toBeLessThanOrEqual(3);
      expect(similar.some((m) => m.property.id === p.id)).toBe(false);
    }
  });

  it('copes with a catalogue of one', () => {
    expect(similarProperties(properties[0], [properties[0]])).toEqual([]);
  });

  it('ranks listings by how close their price is before area or BHK', () => {
    const base = properties.find((p) => !p.priceOnRequest && p.priceMin > 0)!;
    const kin = { segment: base.segment, transaction: base.transaction, priceOnRequest: false, featured: false };
    // Same area and BHK, but three times the price.
    const pricey = { ...base, ...kin, id: 'pricey', slug: 'pricey', priceMin: base.priceMin * 3, priceMax: null };
    // Another area and other BHK, but within 10% of the price.
    const close = { ...base, ...kin, id: 'close', slug: 'close', corridorId: 'elsewhere-area', bhkOptions: [9], priceMin: Math.round(base.priceMin * 1.1), priceMax: null };
    const order = similarProperties(base, [base, pricey, close]).map((m) => m.property.id);
    expect(order[0]).toBe('close');
    expect(similarProperties(base, [base, close])[0].reasons[0]).toBe('Similar price');
  });
});
