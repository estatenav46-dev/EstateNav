import type { Property, SearchSegment } from './data/types';
import { matchesSegment } from './property';

// Shortcuts on the home page ("What are you looking for?"). Each opens the explore page
// with the matching filter already applied.
export type NeedIcon = 'apartment' | 'plot' | 'ready' | 'launch' | 'budget' | 'family' | 'nri' | 'first-home' | 'office';

export interface NeedTile {
  id: string;
  label: string;
  icon: NeedIcon;
  query: Record<string, string>;
  matches: (p: Property) => boolean;
}

export const NEED_TILES: NeedTile[] = [
  { id: 'apartments', label: 'Apartments', icon: 'apartment', query: { seg: 'residential' }, matches: (p) => matchesSegment(p, 'residential') },
  { id: 'plots', label: 'Plots', icon: 'plot', query: { seg: 'plot' }, matches: (p) => matchesSegment(p, 'plot') },
  { id: 'ready', label: 'Ready to move', icon: 'ready', query: { pos: 'ready' }, matches: (p) => p.possession.status === 'ready' && p.transaction === 'sale' },
  { id: 'new-launch', label: 'New launches', icon: 'launch', query: { status: 'pre-launch,new-launch' }, matches: (p) => p.isNewLaunch || p.possession.status === 'pre-launch' },
  { id: 'under-1-5', label: 'Under ₹1.5 Cr', icon: 'budget', query: { max: '15000000' }, matches: (p) => p.transaction === 'sale' && p.priceMin <= 15_000_000 },
  { id: '3bhk', label: '3 BHK & up', icon: 'family', query: { bhk: '3,3.5,4,4.5,5' }, matches: (p) => p.bhkOptions.some((b) => b >= 3) },
  { id: 'first-home', label: 'First home', icon: 'first-home', query: { lens: 'first-home' }, matches: (p) => p.lenses.includes('first-home') },
  { id: 'nri', label: 'NRI picks', icon: 'nri', query: { lens: 'nri' }, matches: (p) => p.lenses.includes('nri') },
  { id: 'offices', label: 'Offices', icon: 'office', query: { seg: 'commercial' }, matches: (p) => matchesSegment(p, 'commercial') },
];

// Property-type chips on the explore page.
export const TYPE_CHIPS: { seg: SearchSegment | ''; label: string }[] = [
  { seg: '', label: 'All' },
  { seg: 'residential', label: 'Apartments' },
  { seg: 'plot', label: 'Plots' },
  { seg: 'commercial', label: 'Offices' },
  { seg: 'rent', label: 'Homes for rent' },
];

// Quick budgets for sale listings (rent and office budgets live in the full filter sheet).
export const SALE_BUDGET_CHOICES: { id: string; label: string; min: number | null; max: number | null }[] = [
  { id: 'any', label: 'Any budget', min: null, max: null },
  { id: 'u1', label: 'Under ₹1 Cr', min: null, max: 10_000_000 },
  { id: '1-1.5', label: '₹1 – 1.5 Cr', min: 10_000_000, max: 15_000_000 },
  { id: '1.5-2', label: '₹1.5 – 2 Cr', min: 15_000_000, max: 20_000_000 },
  { id: '2+', label: '₹2 Cr +', min: 20_000_000, max: null },
];
