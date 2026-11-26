// Search landing pages: /bangalore, /bangalore/[place], /bangalore/[place]/[filter] and the
// city-wide /bangalore/[filter]. Each page is built from the live listings and exists only while
// enough listings match it (no thin or empty pages), so new listings in the admin create new
// pages by themselves and the sitemap follows.

import type { Corridor, Property } from './data/types';
import { matchesSegment } from './property';
import { ZONES, zoneOfCorridor, type ZoneId } from './regions';
import { formatINRShort } from './price';

export const CITY = 'Bangalore';
export const CITY_ALT = 'Bengaluru';
export const LANDING_ROOT = '/bangalore';

// ---- Filters (the "what") ----

export interface LandingFilter {
  slug: string;
  /** Plural noun for headings: "Flats & apartments for sale". */
  noun: string;
  /** Short noun for links: "Flats". */
  short: string;
  /** Search terms buyers use, worked into the intro and meta description. */
  terms: string;
  match: (p: Property) => boolean;
  /** The same filter on the explore page, for "refine this search". */
  explore: Record<string, string>;
}

const isSaleHome = (p: Property) => matchesSegment(p, 'residential');
const hasBhk = (p: Property, n: number) => p.bhkOptions.some((b) => Math.floor(b) === n);
export const hasPrice = (p: Property) => !p.priceOnRequest && p.priceMin > 1;

export const FILTERS: LandingFilter[] = [
  { slug: 'flats', noun: 'Flats & apartments for sale', short: 'Flats', terms: 'flats, apartments and gated-community homes for sale', match: isSaleHome, explore: { seg: 'residential' } },
  { slug: 'plots', noun: 'Plots for sale', short: 'Plots', terms: 'residential plots, villa plots and plotted developments', match: (p) => matchesSegment(p, 'plot'), explore: { seg: 'plot' } },
  { slug: 'offices', noun: 'Office spaces', short: 'Offices', terms: 'office spaces and commercial workspaces', match: (p) => matchesSegment(p, 'commercial'), explore: { seg: 'commercial' } },
  { slug: 'flats-for-rent', noun: 'Homes for rent', short: 'For rent', terms: 'flats and homes for rent', match: (p) => matchesSegment(p, 'rent'), explore: { seg: 'rent' } },
  { slug: '2-bhk-flats', noun: '2 BHK flats for sale', short: '2 BHK flats', terms: '2 BHK flats and apartments', match: (p) => isSaleHome(p) && hasBhk(p, 2), explore: { seg: 'residential', bhk: '2,2.5' } },
  { slug: '3-bhk-flats', noun: '3 BHK flats for sale', short: '3 BHK flats', terms: '3 BHK flats and apartments', match: (p) => isSaleHome(p) && hasBhk(p, 3), explore: { seg: 'residential', bhk: '3,3.5' } },
  { slug: '4-bhk-flats', noun: '4 BHK flats & villas for sale', short: '4 BHK homes', terms: '4 BHK flats, villas and row houses', match: (p) => isSaleHome(p) && hasBhk(p, 4), explore: { seg: 'residential', bhk: '4,4.5' } },
  { slug: 'ready-to-move-flats', noun: 'Ready-to-move flats', short: 'Ready to move', terms: 'ready-to-move flats with possession now', match: (p) => isSaleHome(p) && p.possession.status === 'ready', explore: { seg: 'residential', pos: 'ready' } },
  { slug: 'new-launch-projects', noun: 'New launch projects', short: 'New launches', terms: 'new launch and pre-launch projects', match: (p) => p.transaction === 'sale' && (p.isNewLaunch || p.possession.status === 'pre-launch'), explore: { status: 'pre-launch,new-launch' } },
  { slug: 'flats-under-1-crore', noun: 'Flats under ₹1 crore', short: 'Under ₹1 Cr', terms: 'affordable flats under 1 crore', match: (p) => isSaleHome(p) && hasPrice(p) && p.priceMin <= 10_000_000, explore: { seg: 'residential', max: '10000000' } },
  { slug: 'flats-under-2-crore', noun: 'Flats under ₹2 crore', short: 'Under ₹2 Cr', terms: 'flats under 2 crore', match: (p) => isSaleHome(p) && hasPrice(p) && p.priceMin <= 20_000_000, explore: { seg: 'residential', max: '20000000' } },
];

export const filterBySlug = (slug: string) => FILTERS.find((f) => f.slug === slug) ?? null;

// ---- Places (the "where") ----

export type LandingPlace =
  | { kind: 'city'; slug: ''; name: string; match: (p: Property) => boolean; explore: Record<string, string> }
  | { kind: 'region'; slug: string; zone: ZoneId; name: string; areas: string; match: (p: Property) => boolean; explore: Record<string, string> }
  | { kind: 'area'; slug: string; corridor: Corridor; zone: ZoneId; name: string; match: (p: Property) => boolean; explore: Record<string, string> };

export const CITY_PLACE: LandingPlace = { kind: 'city', slug: '', name: CITY, match: () => true, explore: {} };

const regionSlug = (zone: ZoneId) => `${zone}-bangalore`;

export function landingPlaces(corridors: Corridor[]): LandingPlace[] {
  const regions: LandingPlace[] = ZONES.map((z) => ({
    kind: 'region' as const,
    slug: regionSlug(z.id),
    zone: z.id,
    name: z.name.replace('Bengaluru', CITY),
    areas: z.areas,
    match: (p: Property) => zoneOfCorridor(p.corridorId) === z.id,
    explore: { zone: z.id },
  }));
  const areas: LandingPlace[] = corridors.map((c) => ({
    kind: 'area' as const,
    slug: c.slug,
    corridor: c,
    zone: zoneOfCorridor(c.id),
    name: c.name,
    match: (p: Property) => p.corridorId === c.id,
    explore: { ...(zoneOfCorridor(c.id) !== 'other' ? { zone: zoneOfCorridor(c.id) } : {}), corridor: c.id },
  }));
  return [...regions, ...areas];
}

// A page needs this many listings to exist: one for a whole place or a city-wide filter, two for a
// place + filter page, so a single listing never gets a page of its own besides its project page.
const MIN_PLACE = 1;
const MIN_PLACE_FILTER = 2;
const MIN_CITY_FILTER = 1;

export function minFor(place: LandingPlace, filter: LandingFilter | null) {
  if (!filter) return MIN_PLACE;
  return place.kind === 'city' ? MIN_CITY_FILTER : MIN_PLACE_FILTER;
}

export function landingPath(place: LandingPlace, filter: LandingFilter | null) {
  return [LANDING_ROOT, place.slug, filter?.slug].filter(Boolean).join('/');
}

export function exploreHref(place: LandingPlace, filter: LandingFilter | null) {
  const params = new URLSearchParams({ ...place.explore, ...(filter?.explore ?? {}) });
  const q = params.toString();
  return `/properties${q ? `?${q}` : ''}`;
}

export interface LandingPage {
  place: LandingPlace;
  filter: LandingFilter | null;
  path: string;
  listings: Property[];
}

/** Every landing page that has enough listings, for the sitemap, llms.txt and link blocks. */
export function allLandingPages(properties: Property[], corridors: Corridor[]): LandingPage[] {
  const pages: LandingPage[] = [];
  const places = [CITY_PLACE, ...landingPlaces(corridors)];
  for (const place of places) {
    const inPlace = properties.filter(place.match);
    if (place.kind !== 'city' && inPlace.length >= MIN_PLACE) pages.push({ place, filter: null, path: landingPath(place, null), listings: inPlace });
    for (const filter of FILTERS) {
      const listings = inPlace.filter(filter.match);
      if (listings.length >= minFor(place, filter)) pages.push({ place, filter, path: landingPath(place, filter), listings });
    }
  }
  return pages;
}

/** Resolves a URL to a page, or null when it does not exist (unknown slug or too few listings). */
export function resolveLanding(segments: string[], properties: Property[], corridors: Corridor[]): LandingPage | null {
  const places = landingPlaces(corridors);
  let place: LandingPlace | undefined;
  let filter: LandingFilter | null = null;
  if (segments.length === 1) {
    filter = filterBySlug(segments[0]);
    place = filter ? CITY_PLACE : places.find((p) => p.slug === segments[0]);
  } else if (segments.length === 2) {
    place = places.find((p) => p.slug === segments[0]);
    filter = filterBySlug(segments[1]);
    if (!filter) return null;
  }
  if (!place) return null;
  const listings = properties.filter(place.match).filter((p) => (filter ? filter.match(p) : true));
  if (listings.length < minFor(place, filter)) return null;
  return { place, filter, path: landingPath(place, filter), listings };
}

// ---- Words and facts ----

export function placeLabel(place: LandingPlace) {
  return place.kind === 'area' ? `${place.name}, ${CITY}` : place.name;
}

export function landingHeading(page: Pick<LandingPage, 'place' | 'filter'>) {
  const noun = page.filter?.noun ?? 'New flats, plots & offices';
  return `${noun} in ${placeLabel(page.place)}`;
}

export interface LandingFacts {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  ready: Property[];
  launches: Property[];
  developers: string[];
  areas: { id: string; name: string; count: number }[];
  bhk: number[];
  rera: number;
  updatedAt: string | null;
}

export function landingFacts(listings: Property[]): LandingFacts {
  const priced = listings.filter(hasPrice);
  const areas = new Map<string, { id: string; name: string; count: number }>();
  for (const p of listings) {
    const a = areas.get(p.corridorId) ?? { id: p.corridorId, name: p.corridorName, count: 0 };
    a.count += 1;
    areas.set(p.corridorId, a);
  }
  return {
    count: listings.length,
    minPrice: priced.length ? Math.min(...priced.map((p) => p.priceMin)) : null,
    maxPrice: priced.length ? Math.max(...priced.map((p) => p.priceMax ?? p.priceMin)) : null,
    ready: listings.filter((p) => p.possession.status === 'ready'),
    launches: listings.filter((p) => p.isNewLaunch || p.possession.status === 'pre-launch'),
    developers: Array.from(new Set(listings.map((p) => p.developerName))).sort(),
    areas: Array.from(areas.values()).sort((a, b) => b.count - a.count),
    bhk: Array.from(new Set(listings.flatMap((p) => p.bhkOptions.map((b) => Math.floor(b))))).sort((a, b) => a - b),
    rera: listings.filter((p) => Boolean(p.rera.number)).length,
    updatedAt: listings.reduce<string | null>((max, p) => (!max || p.updatedAt > max ? p.updatedAt : max), null),
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const listNames = (items: string[], max = 4) => (items.length <= max ? items.join(', ') : `${items.slice(0, max).join(', ')} and ${items.length - max} more`);

export function priceRangeText(f: LandingFacts) {
  if (f.minPrice == null) return null;
  return f.maxPrice && f.maxPrice > f.minPrice ? `${formatINRShort(f.minPrice)} to ${formatINRShort(f.maxPrice)}` : `from ${formatINRShort(f.minPrice)}`;
}

/** One factual summary sentence, used as the intro and the meta description. */
export function landingSummary(page: Pick<LandingPage, 'place' | 'filter' | 'listings'>) {
  const f = landingFacts(page.listings);
  const where = placeLabel(page.place);
  const what = page.filter?.terms ?? 'flats, plots and office spaces';
  const price = priceRangeText(f);
  return [
    `${plural(f.count, 'verified project', 'verified projects')} with ${what} in ${where}${price ? `, priced ${price}` : ''}.`,
    f.developers.length ? `From ${listNames(f.developers, 3)}.` : '',
    'Direct-developer pricing, zero buyer brokerage, K-RERA details on every listing.',
  ]
    .filter(Boolean)
    .join(' ');
}

export interface Faq {
  q: string;
  a: string;
}

/** Questions buyers ask about a place or search, answered from the listings on the page. */
export function landingFaqs(page: Pick<LandingPage, 'place' | 'filter' | 'listings'>): Faq[] {
  const f = landingFacts(page.listings);
  const where = placeLabel(page.place);
  const noun = (page.filter?.short ?? 'properties').toLowerCase();
  const price = priceRangeText(f);
  const faqs: Faq[] = [];

  faqs.push({
    q: `How many ${noun === 'properties' ? 'projects' : `${noun} projects`} does EstateNav list in ${where}?`,
    a: `EstateNav currently lists ${plural(f.count, 'project', 'projects')} in ${where}${f.areas.length > 1 ? `, across ${listNames(f.areas.map((a) => a.name))}` : ''}. Every listing is checked for its K-RERA registration and shown with the developer's current guide price.`,
  });
  if (price) {
    faqs.push({
      q: `What is the price of ${noun === 'properties' ? 'property' : noun} in ${where}?`,
      a: `Developer guide prices for the projects listed in ${where} range ${price.startsWith('from') ? price : `from ${price}`}. Prices are approximate starting prices from each developer's price sheet; ask your EstateNav advisor for the latest sheet, which is shared at direct-developer pricing with no buyer brokerage.`,
    });
  }
  if (f.ready.length) {
    faqs.push({
      q: `Are there ready-to-move projects in ${where}?`,
      a: `Yes. ${plural(f.ready.length, 'project is', 'projects are')} ready to move in: ${listNames(f.ready.map((p) => p.title))}.`,
    });
  }
  if (f.launches.length) {
    faqs.push({
      q: `Which new launch projects are in ${where}?`,
      a: `New and pre-launch projects listed in ${where}: ${listNames(f.launches.map((p) => p.title))}. Launch-phase prices and inventory change quickly, so confirm availability with your advisor.`,
    });
  }
  if (f.developers.length) {
    faqs.push({
      q: `Which builders have projects in ${where}?`,
      a: `Projects listed here are by ${listNames(f.developers, 8)}. EstateNav is an authorised channel partner of these developers, so buyers pay no brokerage.`,
    });
  }
  if (f.bhk.length && (!page.filter || ['flats', 'flats-for-rent'].includes(page.filter.slug))) {
    faqs.push({ q: `What configurations are available in ${where}?`, a: `Listed homes come in ${f.bhk.map((b) => `${b} BHK`).join(', ')} configurations. Each project page shows carpet and super built-up areas, floor plans and prices per unit type.` });
  }
  faqs.push({
    q: 'Are these projects RERA registered?',
    a: `${f.rera === f.count ? 'All' : `${f.rera} of ${f.count}`} projects on this page show a K-RERA registration number, with a link to verify it on the Karnataka RERA portal${f.rera === f.count ? '' : '; for the rest, RERA details are shared on request'}.`,
  });
  return faqs;
}
