import type { Property } from './data/types';

// Bengaluru is browsed region → area (corridor) → location (locality).
export type ZoneId = 'north' | 'east' | 'south-east' | 'south' | 'west' | 'central' | 'other';

export interface Zone {
  id: ZoneId;
  name: string;
  short: string;
  /** A few well-known places, shown under the region name. */
  areas: string;
  corridorIds: string[];
  available: boolean;
  /** Compass heading for the direction arrow (degrees, 0 = north). Null draws a centre dot. */
  heading: number | null;
}

export const ZONES: Zone[] = [
  { id: 'north', name: 'North Bengaluru', short: 'North', areas: 'Hebbal · Devanahalli · Airport Road', corridorIds: ['north-bengaluru'], available: true, heading: 0 },
  { id: 'east', name: 'East Bengaluru', short: 'East', areas: 'Whitefield · Varthur · Outer Ring Road', corridorIds: ['whitefield', 'varthur', 'outer-ring-road'], available: true, heading: 90 },
  { id: 'south-east', name: 'South-East Bengaluru', short: 'South-East', areas: 'Sarjapur Road · Dommasandra · Attibele', corridorIds: ['sarjapur-road'], available: true, heading: 135 },
  { id: 'south', name: 'South Bengaluru', short: 'South', areas: 'Electronic City · Bommasandra · Hosur Road', corridorIds: ['electronic-city'], available: true, heading: 180 },
  { id: 'west', name: 'West Bengaluru', short: 'West', areas: 'Yeshwanthpur · Rajajinagar · Tumkur Road', corridorIds: [], available: false, heading: 270 },
  { id: 'central', name: 'Central Bengaluru', short: 'Central', areas: 'Indiranagar · Koramangala · CBD', corridorIds: [], available: false, heading: null },
];

// Corridors added later in the admin that no region claims yet still need a home.
const OTHER: Zone = { id: 'other', name: 'Other areas', short: 'Other', areas: 'More Bengaluru localities', corridorIds: [], available: true, heading: null };

export const ZONE_IDS = [...ZONES.map((z) => z.id), OTHER.id] as const;

export function zoneOfCorridor(corridorId: string): ZoneId {
  return ZONES.find((z) => z.corridorIds.includes(corridorId))?.id ?? 'other';
}

export function zoneById(id: string): Zone | undefined {
  return id === 'other' ? OTHER : ZONES.find((z) => z.id === id);
}

export function inZone(property: Property, zoneId: string): boolean {
  return zoneOfCorridor(property.corridorId) === zoneId;
}

/** Regions with listings, in display order; "Other areas" only appears when it has listings. */
export function liveZones(properties: Property[]): Zone[] {
  const live = ZONES.filter((z) => z.available);
  return properties.some((p) => zoneOfCorridor(p.corridorId) === 'other') ? [...live, OTHER] : live;
}

export const comingSoonZones = () => ZONES.filter((z) => !z.available);
