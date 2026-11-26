import { seedCorridors, seedProperties } from '@/lib/data/adapters/mock/seed';
import { registerCorridorZones } from '@/lib/regions';
import type { Property } from '@/lib/data/types';

// The nine sample listings and six areas the mock adapter serves, with their regions registered
// the way the site does it on every request.
registerCorridorZones(seedCorridors);
export const properties = seedProperties.filter((p) => p.status === 'published');
export const corridors = seedCorridors;

/** A listing with some fields replaced, for edge cases. */
export function variant(overrides: Partial<Property>, base: Property = properties[0]): Property {
  return { ...base, ...overrides };
}
