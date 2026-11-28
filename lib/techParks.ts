import type { Property } from './data/types';

// Search by tech park: "homes near Manyata", "near ITPL"… Bengaluru buyers often pick a home by
// their office first. A listing is near a park when:
//   1. its brochure lists that park among nearby places (with the distance or drive time it gives),
//   2. or its map pin is within range of the park,
//   3. or, with neither, it sits in one of the park's own areas (shown last, without a distance).
// Brochures name parks loosely ("ITPL", "ITPB", "International Tech Park"), so each park carries
// the spellings it goes by.

export interface TechPark {
  id: string;
  name: string;
  /** Short label for chips and cards. */
  short: string;
  /** Where it is, in words buyers use. */
  area: string;
  geo: { lat: number; lng: number };
  /** Names a brochure may use for it. */
  match: RegExp;
  /** The park's own neighbourhood (corridor ids): homes there count as near it when nothing more
   *  precise is known. Kept tight, since a corridor like North Bengaluru spans 30 km. */
  corridors: string[];
  /** For names shared with other places (e.g. "Wipro"), trust a brochure match only in these areas. */
  trustOnlyIn?: string[];
}

export const TECH_PARKS: TechPark[] = [
  {
    id: 'manyata',
    name: 'Manyata Tech Park',
    short: 'Manyata',
    area: 'Nagawara, Hebbal',
    geo: { lat: 13.0453, lng: 77.6205 },
    match: /manyata/,
    corridors: ['thanisandra', 'hennur-road', 'jakkur'],
  },
  {
    id: 'kirloskar',
    name: 'Kirloskar Tech Park',
    short: 'Kirloskar',
    area: 'Hebbal, Bellary Road',
    geo: { lat: 13.0428, lng: 77.5932 },
    match: /kirloskar/,
    corridors: ['jakkur'],
  },
  {
    id: 'aerospace',
    name: 'KIADB Aerospace & Hardware Park',
    short: 'Aerospace Park',
    area: 'Devanahalli, near the airport',
    geo: { lat: 13.225, lng: 77.705 },
    match: /aerospace|hardware park|kiadb (sez|hardware)|devanahalli business park|prestige tech cloud/,
    corridors: ['devanahalli'],
  },
  {
    id: 'bagmane',
    name: 'Bagmane Tech Park',
    short: 'Bagmane',
    area: 'CV Raman Nagar',
    geo: { lat: 12.9806, lng: 77.662 },
    match: /bagmane/,
    corridors: [],
  },
  {
    id: 'itpl',
    name: 'ITPL & EPIP Zone',
    short: 'ITPL Whitefield',
    area: 'Whitefield',
    geo: { lat: 12.9857, lng: 77.7368 },
    match: /\bitp[lb]\b|international tech park|epip|export promotion|gr tech|shantiniketan|sigma (soft )?tech|brigade tech|bearys|\bbgrt\b/,
    corridors: ['whitefield', 'varthur'],
  },
  {
    id: 'marathahalli-orr',
    name: 'Prestige Tech Park & Cessna',
    short: 'Marathahalli ORR',
    area: 'Kadubeesanahalli, Outer Ring Road',
    geo: { lat: 12.9385, lng: 77.6955 },
    match: /prestige tech park|cessna|embassy tech square/,
    corridors: ['outer-ring-road'],
  },
  {
    id: 'bellandur-orr',
    name: 'Ecospace, Ecoworld & Embassy TechVillage',
    short: 'Bellandur ORR',
    area: 'Bellandur, Outer Ring Road',
    geo: { lat: 12.9265, lng: 77.683 },
    match: /ecospace|eco ?world|softzone|touchstone|embassy ?tech ?village|\betv\b|divyas+h?ree tech/,
    corridors: ['outer-ring-road', 'hsr-layout'],
  },
  {
    id: 'sarjapur-wipro',
    name: 'Wipro & RGA Tech Park',
    short: 'Sarjapur Road',
    area: 'Doddakannelli, Sarjapur Road',
    geo: { lat: 12.9101, lng: 77.6899 },
    match: /wipro|rga ?tech/,
    corridors: ['sarjapur-road'],
    trustOnlyIn: ['sarjapur-road', 'outer-ring-road', 'varthur', 'hsr-layout'],
  },
  {
    id: 'electronic-city',
    name: 'Electronic City',
    short: 'Electronic City',
    area: 'Phase 1 & 2, Hosur Road',
    geo: { lat: 12.8452, lng: 77.6602 },
    match: /electronic city|\be ?city\b|infosys|biocon/,
    corridors: ['electronic-city', 'hosur-road'],
    trustOnlyIn: ['electronic-city', 'hosur-road', 'jigani', 'bannerghatta-road', 'sarjapur-road', 'hsr-layout', 'kanakapura-road'],
  },
  {
    id: 'golflinks',
    name: 'Embassy GolfLinks',
    short: 'GolfLinks',
    area: 'Domlur, Intermediate Ring Road',
    geo: { lat: 12.9541, lng: 77.6431 },
    match: /golf ?links/,
    corridors: [],
  },
  {
    id: 'global-village',
    name: 'Global Village Tech Park',
    short: 'Global Village',
    area: 'RR Nagar, Mysore Road',
    geo: { lat: 12.9035, lng: 77.499 },
    match: /global village/,
    corridors: ['mysore-road'],
  },
];

export const RADIUS_CHOICES = [5, 10, 15, 25] as const;
/** Homes in the park's own neighbourhood without a measured distance count as this far. */
const AREA_KM = 10;
export const DEFAULT_RADIUS = 10;

export function techParkById(id: string): TechPark | undefined {
  return TECH_PARKS.find((p) => p.id === id);
}

export type ParkMatch = {
  /** Kilometres (from the brochure or the map pin); null when only a drive time or the area is known. */
  km: number | null;
  mins: number | null;
  /** Where the answer came from. */
  how: 'brochure' | 'map' | 'area';
  /** Distance used for range checks and sorting (a drive time counts as ~0.5 km per minute, i.e. 30 km/h in city traffic). */
  sortKm: number;
};

const normalise = (text: string) => ` ${text.toLowerCase().replace(/[^a-z0-9&]+/g, ' ').trim()} `;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** How near a listing is to a tech park, or null when nothing says it is. */
export function parkMatch(property: Property, park: TechPark): ParkMatch | null {
  // 1. The brochure lists it.
  const trusted = !park.trustOnlyIn || park.trustOnlyIn.includes(property.corridorId);
  if (trusted) {
    const listed = property.nearby.filter((n) => (n.category === 'it-park' || n.category === 'landmark') && park.match.test(normalise(n.name)));
    if (listed.length) {
      const est = (n: (typeof listed)[number]) => n.distanceKm ?? (n.travelMins != null ? n.travelMins / 2 : Infinity);
      const best = [...listed].sort((a, b) => est(a) - est(b))[0];
      const sortKm = est(best);
      // A brochure that names the park without a distance says it is within reach, not how far:
      // count it as ~15 km, so it shows from the 15 km choice up.
      return { km: best.distanceKm, mins: best.travelMins, how: 'brochure', sortKm: Number.isFinite(sortKm) ? sortKm : 15 };
    }
  }
  // 2. The map pin.
  if (property.geo) {
    const km = haversineKm(property.geo, park.geo);
    return { km: Math.round(km * 10) / 10, mins: null, how: 'map', sortKm: km };
  }
  // 3. The area.
  if (park.corridors.includes(property.corridorId)) return { km: null, mins: null, how: 'area', sortKm: AREA_KM };
  return null;
}

/** True when the listing is within `radiusKm` of the park (area-only matches count from 10 km up). */
export function isNearPark(property: Property, park: TechPark, radiusKm = DEFAULT_RADIUS): boolean {
  const m = parkMatch(property, park);
  return m != null && m.sortKm <= radiusKm;
}

/** A short line for cards: "≈ 4 km to Manyata", "20 min to ITPL Whitefield", "Near Bellandur ORR". */
export function parkLabel(m: ParkMatch, park: TechPark): string {
  if (m.km != null) return `${m.how === 'map' ? '≈ ' : ''}${Number(m.km.toFixed(1))} km to ${park.short}`;
  if (m.mins != null) return `${m.mins} min to ${park.short}`;
  return m.how === 'area' ? `Same area as ${park.short}` : `Near ${park.short}`;
}

/** Tech parks with at least one listing near them, most listings first. */
export function parksWithHomes(properties: Property[], radiusKm = DEFAULT_RADIUS) {
  return TECH_PARKS.map((park) => {
    const near = properties.filter((p) => isNearPark(p, park, radiusKm));
    return { park, count: near.length, near };
  })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}
