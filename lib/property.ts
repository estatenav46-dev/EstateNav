import type { Configuration, EnquiryIntent, Lens, Property, SearchSegment, UnitKind } from './data/types';
import { formatINR, formatINRRange, formatSqftRange } from './price';

export const SEGMENT_LABEL: Record<SearchSegment, string> = { residential: 'Residential', plot: 'Plots', commercial: 'Commercial', rent: 'Rent' };
export const SEGMENT_NOUN: Record<SearchSegment, [string, string]> = {
  residential: ['home', 'homes'],
  plot: ['plot', 'plots'],
  commercial: ['workspace', 'workspaces'],
  rent: ['rental', 'rentals'],
};

export const LENS_LABEL: Record<Lens, string> = {
  'first-home': 'First home',
  upgrading: 'Upgrading',
  nri: 'NRI portfolio',
  senior: 'Senior-friendly',
  investor: 'Investor',
};

export type StatusChip = 'Ready' | 'Under construction' | 'Pre-launch' | 'New launch';

export function statusChip(property: Property): StatusChip {
  if (property.possession.status === 'ready') return 'Ready';
  if (property.possession.status === 'pre-launch') return 'Pre-launch';
  return property.isNewLaunch ? 'New launch' : 'Under construction';
}

export function matchesSegment(property: Property, segment: SearchSegment | ''): boolean {
  if (!segment) return true;
  if (segment === 'rent') return property.transaction === 'rent';
  return property.segment === segment && (segment === 'commercial' || property.transaction === 'sale');
}

export function configLabels(property: Property): string[] {
  return property.configurations.map((c) => c.label);
}

export function sizeLabel(property: Property): string | null {
  const range = formatSqftRange(property.sizeMin, property.sizeMax);
  if (!range) return null;
  const basis = property.segment === 'plot' ? 'plot' : property.configurations.some((c) => c.superSqftMin != null) ? 'super built-up' : 'carpet';
  return `${range} ${basis}`;
}

export function priceLabel(property: Property): string {
  if (property.priceOnRequest) return 'Price on request';
  return formatINRRange(property.priceMin, property.priceMax, property.transaction === 'rent' ? ' /month' : '');
}

/** Short "from" price for cards: "₹1.2 Cr" or "Price on request". */
export function fromPrice(property: Property): string {
  return property.priceOnRequest ? 'Price on request' : formatINR(property.priceMin);
}

export function rateLabel(property: Property): string | null {
  if (property.priceOnRequest || property.pricePerSqft == null) return null;
  const value = `₹${Math.round(property.pricePerSqft).toLocaleString('en-IN')}/sq.ft`;
  return property.transaction === 'rent' ? `${value}/month` : value;
}

/** Ready = 0; otherwise months from now, using the stored date or a year in the label. */
export function possessionMonths(property: Property, now = new Date()): number {
  if (property.possession.status === 'ready') return 0;
  let date = property.possession.date ? new Date(property.possession.date) : null;
  if (!date) {
    const year = property.possession.label.match(/\b(20\d\d)\b/)?.[1];
    if (year) date = new Date(Number(year), 11, 1);
  }
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.max(0, (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth()));
}

/** "PRM/KA/RERA/…/240520/006890" keeps the identifying ends readable in tight rows. */
export function shortRera(number: string): string {
  const parts = number.split('/');
  return parts.length > 5 ? `${parts.slice(0, 3).join('/')}/…/${parts.slice(-2).join('/')}` : number;
}

export function bhkLabel(bhk: number): string {
  return bhk >= 5 ? '5+ BHK' : `${bhk} BHK`;
}

export const UNIT_KIND_LABEL: Record<UnitKind, string> = {
  apartment: 'Apartment',
  studio: 'Studio',
  duplex: 'Duplex',
  penthouse: 'Penthouse',
  villa: 'Villa',
  'row-house': 'Row house',
  villament: 'Villament',
  'independent-house': 'Independent house',
  plot: 'Plot',
  office: 'Office',
  retail: 'Retail',
};

/** Group heading for a unit: "3 BHK", "4 BHK Row house", "Studio" or the unit's own name. */
export function unitGroupLabel(c: Configuration): string {
  const kind = c.unitKind && c.unitKind !== 'apartment' ? UNIT_KIND_LABEL[c.unitKind] : null;
  if (c.bhk != null) return kind && c.unitKind !== 'plot' ? `${bhkLabel(c.bhk)} ${kind}` : bhkLabel(c.bhk);
  return c.unitKind === 'studio' ? 'Studio' : c.label;
}

export const PLAN_AUTHORITY_LABEL: Record<string, string> = {
  BBMP: 'BBMP',
  GBA: 'GBA',
  BDA: 'BDA',
  BMRDA: 'BMRDA',
  BIAAPA: 'BIAAPA',
  APA: 'Anekal Planning Authority',
  HPA: 'Hoskote Planning Authority',
  NPA: 'Nelamangala Planning Authority',
  KIADB: 'KIADB',
  DTCP: 'DTCP',
  Panchayat: 'Gram Panchayat',
  Other: 'Sanctioned',
};

export const INTENT_LABEL: Record<EnquiryIntent, string> = {
  'site-visit': 'Site visit',
  'price-sheet': 'Price sheet',
  'loan-help': 'Loan help',
  general: 'General',
  callback: 'Callback',
};

/** An offer is shown until the day after its end date. */
export function activeOffer(property: Property, now = new Date()): Property['offer'] {
  const offer = property.offer;
  if (!offer?.text) return null;
  return !offer.validUntil || offer.validUntil >= now.toISOString().slice(0, 10) ? offer : null;
}

/** Project-scale facts for cards and the overview, e.g. ["13.4 acres", "1,140 units", "9 towers"]. */
export function scaleFacts(property: Property): string[] {
  const f = property.facts;
  return [
    f.landAcres ? `${Number(f.landAcres.toFixed(2))} acres` : null,
    f.totalUnits ? `${f.totalUnits.toLocaleString('en-IN')} units` : null,
    f.towers ? `${f.towers} ${f.towers === 1 ? 'tower' : 'towers'}` : null,
  ].filter((v): v is string => Boolean(v));
}
