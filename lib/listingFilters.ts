import type { Lens, Property, SearchSegment } from './data/types';
import { matchesSegment, possessionMonths, statusChip } from './property';
import { formatINR } from './price';
import { inZone, ZONE_IDS, zoneOfCorridor } from './regions';
import { DEFAULT_RADIUS, isNearPark, parkMatch, RADIUS_CHOICES, techParkById } from './techParks';

// One filter engine for home search, the explore page and the "relax filter" suggestions.
// Filtering runs in memory over the published catalogue.

export type ListingSort = 'relevance' | 'price-asc' | 'price-desc' | 'possession' | 'newest';
export type PossessionBucket = '' | 'ready' | '12m' | '1-3y' | '3y+';
export type ListingView = 'grid' | 'list';
export type StatusKey = 'ready' | 'under-construction' | 'pre-launch' | 'new-launch';
export type ApprovalKey = 'a-khata' | 'plan' | 'bank';

export interface ListingState {
  seg: SearchSegment | '';
  q: string;
  /** Region (see lib/regions.ts); corridors narrow it to an area, loc to one locality. */
  zone: string;
  corridors: string[];
  loc: string;
  bhk: number[];
  min: number | null;
  max: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  possession: PossessionBucket;
  status: StatusKey[];
  amenities: string[];
  approvals: ApprovalKey[];
  verified: boolean;
  lens: Lens[];
  /** Builder (developer) ids. */
  dev: string[];
  /** Property types (apartment, villa, plot…). */
  ptype: Property['propertyType'][];
  /** Tech park id (lib/techParks.ts): only homes near it, nearest first. */
  park: string;
  /** How far from the tech park, in km. */
  parkKm: number;
  sort: ListingSort;
  view: ListingView;
}

export const DEFAULT_LISTING_STATE: ListingState = {
  seg: '', q: '', zone: '', corridors: [], loc: '', bhk: [], min: null, max: null, sizeMin: null, sizeMax: null,
  possession: '', status: [], amenities: [], approvals: [], verified: false, lens: [], dev: [], ptype: [], park: '', parkKm: DEFAULT_RADIUS, sort: 'relevance', view: 'grid',
};

export const SALE_BUDGETS = [5_000_000, 7_500_000, 10_000_000, 12_500_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000];
export const RENT_BUDGETS = [500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000];
export const BHK_CHOICES = [1, 2, 2.5, 3, 3.5, 4, 4.5, 5];
export const POSSESSION_OPTIONS: { value: Exclude<PossessionBucket, ''>; label: string }[] = [
  { value: 'ready', label: 'Ready to move' },
  { value: '12m', label: 'Within 12 months' },
  { value: '1-3y', label: '1–3 years' },
  { value: '3y+', label: '3+ years' },
];
export const STATUS_OPTIONS: { value: StatusKey; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'under-construction', label: 'Under construction' },
  { value: 'pre-launch', label: 'Pre-launch' },
  { value: 'new-launch', label: 'New launch' },
];
export const APPROVAL_OPTIONS: { value: ApprovalKey; label: string }[] = [
  { value: 'a-khata', label: 'A-Khata' },
  { value: 'plan', label: 'BBMP / BDA / BMRDA plan' },
  { value: 'bank', label: 'Bank APF' },
];
export const SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'possession', label: 'Possession: soonest' },
  { value: 'newest', label: 'Newest' },
];

export function budgetPresets(seg: SearchSegment | '') {
  return seg === 'rent' || seg === 'commercial' ? RENT_BUDGETS : SALE_BUDGETS;
}

const STATUS_FROM_CHIP: Record<ReturnType<typeof statusChip>, StatusKey> = {
  Ready: 'ready',
  'Under construction': 'under-construction',
  'Pre-launch': 'pre-launch',
  'New launch': 'new-launch',
};

export const statusKey = (property: Property): StatusKey => STATUS_FROM_CHIP[statusChip(property)];

// Words people type that say nothing about which project they mean ("flats in bangalore").
const STOP_WORDS = new Set(['in', 'at', 'near', 'on', 'for', 'the', 'a', 'of', 'and', 'by', 'to', 'sale', 'buy', 'new', 'bangalore', 'bengaluru', 'blr', 'project', 'projects', 'property', 'properties', 'home', 'homes']);
// Type words match the listing's kind instead of its text.
const TYPE_WORDS: Record<string, (p: Property) => boolean> = {
  flat: (p) => p.segment === 'residential', flats: (p) => p.segment === 'residential',
  apartment: (p) => p.segment === 'residential', apartments: (p) => p.segment === 'residential',
  plot: (p) => p.segment === 'plot', plots: (p) => p.segment === 'plot', land: (p) => p.segment === 'plot',
  office: (p) => p.segment === 'commercial', offices: (p) => p.segment === 'commercial', commercial: (p) => p.segment === 'commercial',
  villa: (p) => ['villa', 'row-house', 'villament'].includes(p.propertyType), villas: (p) => ['villa', 'row-house', 'villament'].includes(p.propertyType),
  rent: (p) => p.transaction === 'rent', rental: (p) => p.transaction === 'rent',
};

const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/(\d)\s*bhk/g, '$1bhk')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();

/** The words of a search, without filler; "3 BHK" becomes one token "3bhk". */
export function queryTokens(q: string): string[] {
  return normalise(q)
    .split(' ')
    .filter((t) => t && !STOP_WORDS.has(t));
}

/** Search words that name something (place, builder, project), without type words like "flats". */
export function nameTokens(q: string): string[] {
  return queryTokens(q).filter((t) => !TYPE_WORDS[t]);
}

/** Lower-case, accent-free, punctuation-free text for matching against queryTokens(). */
export const searchText = (text: string) => ` ${normalise(text)} `;

function haystack(property: Property) {
  const configs = property.configurations.map((c) => c.label).join(' ');
  const bhk = property.bhkOptions.map((b) => `${Math.floor(b)}bhk`).join(' ');
  return ` ${normalise(`${property.title} ${property.phase ?? ''} ${property.locality} ${property.corridorName} ${property.developerName} ${property.address} ${configs} ${property.rera.number ?? ''}`)} ${bhk} `;
}

function matchesQuery(property: Property, q: string) {
  const tokens = queryTokens(q);
  if (!tokens.length) return true;
  const text = haystack(property);
  return tokens.every((token) => (TYPE_WORDS[token] ? TYPE_WORDS[token](property) : text.includes(token)));
}

/** How well a listing answers a search: its own name first, then builder, then place. */
export function queryScore(property: Property, q: string): number {
  const query = normalise(q);
  const tokens = queryTokens(q).filter((t) => !TYPE_WORDS[t]);
  if (!tokens.length) return 0;
  const title = normalise(property.title);
  let score = 0;
  if (title === query) score += 100;
  else if (title.startsWith(query) || query.startsWith(title)) score += 60;
  else if (title.includes(query)) score += 40;
  score += tokens.filter((t) => title.includes(t)).length * 10;
  score += tokens.filter((t) => normalise(property.developerName).includes(t)).length * 3;
  score += tokens.filter((t) => normalise(`${property.locality} ${property.corridorName}`).includes(t)).length * 2;
  return score;
}

function overlaps(min: number | null, max: number | null, from: number | null, to: number | null) {
  if (from == null && to == null) return true;
  if (min == null) return false;
  const upper = max ?? min;
  if (from != null && upper < from) return false;
  if (to != null && min > to) return false;
  return true;
}

function matchesPossession(property: Property, bucket: PossessionBucket) {
  if (!bucket) return true;
  const months = possessionMonths(property);
  if (bucket === 'ready') return property.possession.status === 'ready';
  if (property.possession.status === 'ready') return false;
  if (bucket === '12m') return months <= 12;
  if (bucket === '1-3y') return months > 12 && months <= 36;
  return months > 36;
}

export function matchesListing(property: Property, s: ListingState): boolean {
  if (!matchesSegment(property, s.seg)) return false;
  if (!matchesQuery(property, s.q)) return false;
  if (s.zone && !inZone(property, s.zone)) return false;
  if (s.corridors.length && !s.corridors.includes(property.corridorId)) return false;
  if (s.loc && property.locality !== s.loc) return false;
  if (s.bhk.length && !s.bhk.some((b) => (b >= 5 ? property.bhkOptions.some((o) => o >= 5) : property.bhkOptions.includes(b)))) return false;
  // Without a segment the budget is a purchase budget; monthly rents don't compare with it.
  if ((s.min != null || s.max != null) && !s.seg && property.transaction === 'rent') return false;
  // A starting price of ₹1 means "no price yet" (imported with price on request): leave it out of budget searches.
  if ((s.min != null || s.max != null) && property.priceMin <= 1) return false;
  if (!overlaps(property.priceMin, property.priceMax, s.min, s.max)) return false;
  if (!overlaps(property.sizeMin, property.sizeMax, s.sizeMin, s.sizeMax)) return false;
  if (!matchesPossession(property, s.possession)) return false;
  if (s.status.length && !s.status.includes(statusKey(property))) return false;
  if (s.amenities.some((a) => !property.amenities.includes(a))) return false;
  if (s.approvals.includes('a-khata') && property.approvals.khata !== 'A') return false;
  if (s.approvals.includes('plan') && !property.approvals.planAuthority) return false;
  if (s.approvals.includes('bank') && property.bankApprovals.length === 0) return false;
  if (s.verified && !(property.rera.registered && property.rera.number)) return false;
  if (s.lens.length && !s.lens.some((l) => property.lenses.includes(l))) return false;
  if (s.dev.length && !s.dev.includes(property.developerId)) return false;
  if (s.ptype.length && !s.ptype.includes(property.propertyType)) return false;
  if (s.park) {
    const park = techParkById(s.park);
    if (park && !isNearPark(property, park, s.parkKm)) return false;
  }
  return true;
}

export function sortListings(properties: Property[], sort: ListingSort): Property[] {
  const list = [...properties];
  const byRank = (a: Property, b: Property) => Number(b.featured) - Number(a.featured) || a.featuredRank - b.featuredRank;
  list.sort((a, b) => {
    if (sort === 'price-asc') return a.priceMin - b.priceMin || byRank(a, b);
    if (sort === 'price-desc') return b.priceMin - a.priceMin || byRank(a, b);
    if (sort === 'possession') return possessionMonths(a) - possessionMonths(b) || byRank(a, b);
    if (sort === 'newest') return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || byRank(a, b);
    return byRank(a, b);
  });
  return list;
}

export function applyListing(properties: Property[], state: ListingState): Property[] {
  const sorted = sortListings(properties.filter((p) => matchesListing(p, state)), state.sort);
  // Near a tech park: nearest first, unless the visitor picked another order.
  const park = state.park ? techParkById(state.park) : undefined;
  if (park && state.sort === 'relevance' && !state.q.trim()) {
    const km = (p: Property) => parkMatch(p, park)?.sortKm ?? Infinity;
    return sorted.map((p, i) => ({ p, i, km: km(p) })).sort((a, b) => a.km - b.km || a.i - b.i).map((x) => x.p);
  }
  // A search by name puts that project first when the visitor has not picked another order.
  if (state.q.trim() && state.sort === 'relevance') {
    return sorted.map((p, i) => ({ p, i, score: queryScore(p, state.q) })).sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.p);
  }
  return sorted;
}

export function countActiveFilters(s: ListingState): number {
  return (
    (s.seg ? 1 : 0) + (s.q ? 1 : 0) + s.corridors.length + s.bhk.length + (s.min != null || s.max != null ? 1 : 0) +
    (s.sizeMin != null || s.sizeMax != null ? 1 : 0) + (s.possession ? 1 : 0) + s.status.length + s.amenities.length +
    s.approvals.length + (s.verified ? 1 : 0) + s.lens.length + (s.park ? 1 : 0)
  );
}

/** One-tap ways out of an empty result, each with the number of matches it would give. */
export function relaxSuggestions(properties: Property[], s: ListingState) {
  const candidates: { label: string; patch: Partial<ListingState> }[] = [];
  if (s.max != null) {
    const presets = budgetPresets(s.seg);
    const higher = presets.filter((value) => value > s.max!);
    for (const value of higher.slice(0, 2)) candidates.push({ label: `Increase budget to ${formatINR(value)}`, patch: { max: value } });
    candidates.push({ label: 'Any budget', patch: { min: null, max: null } });
  }
  if (s.bhk.length) candidates.push({ label: 'Any BHK', patch: { bhk: [] } });
  if (s.loc) candidates.push({ label: 'Any location', patch: { loc: '' } });
  if (s.corridors.length) candidates.push({ label: 'Whole region', patch: { corridors: [], loc: '' } });
  if (s.zone) candidates.push({ label: 'All of Bengaluru', patch: { zone: '', corridors: [], loc: '' } });
  if (s.possession) candidates.push({ label: 'Any possession date', patch: { possession: '' } });
  if (s.status.length) candidates.push({ label: 'Any project status', patch: { status: [] } });
  if (s.sizeMin != null || s.sizeMax != null) candidates.push({ label: 'Any size', patch: { sizeMin: null, sizeMax: null } });
  if (s.amenities.length) candidates.push({ label: 'Drop amenity filters', patch: { amenities: [] } });
  if (s.approvals.length) candidates.push({ label: 'Drop approval filters', patch: { approvals: [] } });
  if (s.lens.length) candidates.push({ label: 'Any buyer lens', patch: { lens: [] } });
  if (s.dev.length) candidates.push({ label: 'Any builder', patch: { dev: [] } });
  if (s.ptype.length) candidates.push({ label: 'Any property type', patch: { ptype: [] } });
  if (s.park) {
    const wider = RADIUS_CHOICES.find((r) => r > s.parkKm);
    if (wider) candidates.push({ label: `Within ${wider} km`, patch: { parkKm: wider } });
    candidates.push({ label: 'Any tech park', patch: { park: '', parkKm: DEFAULT_RADIUS } });
  }
  if (s.verified) candidates.push({ label: 'Include unverified listings', patch: { verified: false } });
  if (s.q) candidates.push({ label: `Clear “${s.q}”`, patch: { q: '' } });
  if (s.seg) candidates.push({ label: 'All property types', patch: { seg: '' } });
  return candidates
    .map((c) => ({ ...c, count: properties.filter((p) => matchesListing(p, { ...s, ...c.patch })).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

const list = (value: string | null) => (value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []);
const num = (value: string | null) => (value && Number.isFinite(Number(value)) && value.trim() !== '' ? Number(value) : null);
const oneOf = <T extends string>(value: string | null, options: readonly T[]): T | '' => (value && (options as readonly string[]).includes(value) ? (value as T) : '');

const CORRIDOR_ALIASES: Record<string, string> = {
  'sarjapur road': 'sarjapur-road', sarjapur: 'sarjapur-road', whitefield: 'whitefield', 'electronic city': 'electronic-city',
  'north bengaluru': 'north-bengaluru', other: 'outer-ring-road', 'outer ring road': 'outer-ring-road', varthur: 'varthur',
};
const LENSES: Lens[] = ['first-home', 'upgrading', 'nri', 'senior', 'investor'];
const PROPERTY_TYPES: Property['propertyType'][] = ['apartment', 'villa', 'row-house', 'villament', 'penthouse', 'independent-house', 'plot', 'office', 'retail'];

export function parseListingState(params: URLSearchParams): ListingState {
  const s: ListingState = { ...DEFAULT_LISTING_STATE };
  s.seg = oneOf(params.get('seg'), ['residential', 'plot', 'commercial', 'rent'] as const);
  s.q = params.get('q') ?? '';
  s.corridors = list(params.get('corridor')).map((c) => CORRIDOR_ALIASES[c.toLowerCase()] ?? c);
  s.zone = oneOf(params.get('zone'), ZONE_IDS);
  // Corridor links (footer, older pages) open inside their region.
  if (!s.zone && s.corridors.length) {
    const zones = new Set(s.corridors.map(zoneOfCorridor));
    if (zones.size === 1) s.zone = Array.from(zones)[0];
  }
  s.loc = params.get('loc') ?? '';
  s.bhk = list(params.get('bhk')).map((b) => (b === '5+' ? 5 : Number(b))).filter((b) => Number.isFinite(b) && b > 0);
  s.min = num(params.get('min'));
  s.max = num(params.get('max'));
  s.sizeMin = num(params.get('smin'));
  s.sizeMax = num(params.get('smax'));
  s.possession = oneOf(params.get('pos'), ['ready', '12m', '1-3y', '3y+'] as const);
  s.status = list(params.get('status')).filter((v): v is StatusKey => STATUS_OPTIONS.some((o) => o.value === v));
  s.amenities = list(params.get('amen'));
  s.approvals = list(params.get('appr')).filter((v): v is ApprovalKey => APPROVAL_OPTIONS.some((o) => o.value === v));
  s.verified = params.get('verified') === '1' || params.get('verifiedReraOnly') === '1';
  s.lens = list(params.get('lens')).filter((v): v is Lens => (LENSES as string[]).includes(v));
  s.dev = list(params.get('dev')).map((d) => d.toLowerCase()).slice(0, 20);
  s.ptype = list(params.get('ptype')).filter((v): v is Property['propertyType'] => (PROPERTY_TYPES as string[]).includes(v));
  s.park = techParkById(params.get('park') ?? '') ? params.get('park')! : '';
  const radius = num(params.get('pkm'));
  s.parkKm = radius != null && (RADIUS_CHOICES as readonly number[]).includes(radius) ? radius : DEFAULT_RADIUS;
  s.sort = oneOf(params.get('sort'), ['relevance', 'price-asc', 'price-desc', 'possession', 'newest'] as const) || 'relevance';
  s.view = oneOf(params.get('view'), ['grid', 'list'] as const) || 'grid';

  // Links from the previous version of the site keep working.
  const legacyFor = params.get('for');
  if (!s.seg && legacyFor === 'rent') s.seg = 'rent';
  if (!s.seg && legacyFor === 'buy') s.seg = 'residential';
  if (!s.seg && legacyFor === 'plots') s.seg = 'plot';
  if (!s.seg && legacyFor === 'commercial') s.seg = 'commercial';
  if (legacyFor === 'new-launch' && !s.status.length) s.status = ['pre-launch', 'new-launch'];
  const category = params.get('category');
  if (!s.seg && category === 'plotted') s.seg = 'plot';
  if (!s.seg && (category === 'residential' || category === 'commercial')) s.seg = category;
  if (!s.q) s.q = params.get('locality') || params.get('project') || '';
  if (s.min == null) s.min = num(params.get('budgetMin'));
  if (s.max == null) s.max = num(params.get('budgetMax'));
  const legacyPossession = params.get('possessionStatus') ?? params.get('possession');
  if (!s.possession && legacyPossession === 'ready') s.possession = 'ready';
  if (!s.status.length && (legacyPossession === 'new-launch' || legacyPossession === 'under-construction')) {
    s.status = legacyPossession === 'new-launch' ? ['pre-launch', 'new-launch'] : ['under-construction'];
  }
  const legacyPlot = params.get('plotSize');
  if (s.sizeMin == null && legacyPlot) s.sizeMin = num(legacyPlot.replace(/[^\d]/g, '').slice(0, 5) || null);
  return s;
}

export function serializeListingState(s: ListingState): string {
  const params = new URLSearchParams();
  if (s.seg) params.set('seg', s.seg);
  if (s.q.trim()) params.set('q', s.q.trim());
  if (s.zone) params.set('zone', s.zone);
  if (s.corridors.length) params.set('corridor', s.corridors.join(','));
  if (s.loc) params.set('loc', s.loc);
  if (s.bhk.length) params.set('bhk', s.bhk.join(','));
  if (s.min != null) params.set('min', String(s.min));
  if (s.max != null) params.set('max', String(s.max));
  if (s.sizeMin != null) params.set('smin', String(s.sizeMin));
  if (s.sizeMax != null) params.set('smax', String(s.sizeMax));
  if (s.possession) params.set('pos', s.possession);
  if (s.status.length) params.set('status', s.status.join(','));
  if (s.amenities.length) params.set('amen', s.amenities.join(','));
  if (s.approvals.length) params.set('appr', s.approvals.join(','));
  if (s.verified) params.set('verified', '1');
  if (s.lens.length) params.set('lens', s.lens.join(','));
  if (s.dev.length) params.set('dev', s.dev.join(','));
  if (s.ptype.length) params.set('ptype', s.ptype.join(','));
  if (s.park) params.set('park', s.park);
  if (s.park && s.parkKm !== DEFAULT_RADIUS) params.set('pkm', String(s.parkKm));
  if (s.sort !== 'relevance') params.set('sort', s.sort);
  if (s.view !== 'grid') params.set('view', s.view);
  return params.toString();
}
