import type { EnquiryIntent, Lens, Property, SearchSegment } from './data/types';
import { formatINRRange, formatSqftRange } from './price';

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
  return formatINRRange(property.priceMin, property.priceMax, property.transaction === 'rent' ? ' /month' : '');
}

export function rateLabel(property: Property): string | null {
  if (property.pricePerSqft == null) return null;
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

export const INTENT_LABEL: Record<EnquiryIntent, string> = {
  'site-visit': 'Site visit',
  'price-sheet': 'Price sheet',
  'loan-help': 'Loan help',
  general: 'General',
  callback: 'Callback',
};
