'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Corridor, Property, SearchSegment } from '@/lib/data/types';
import { DEFAULT_LISTING_STATE, matchesListing, serializeListingState, type ListingState } from '@/lib/listingFilters';
import { bhkLabel, SEGMENT_LABEL, SEGMENT_NOUN } from '@/lib/property';
import { rememberSearch } from '@/lib/ui/stores';
import type { Suggestion } from './LocalityAutocomplete';

export const SIZE_CHOICES: Record<'plot' | 'workspace', { label: string; min: number | null; max: number | null }[]> = {
  plot: [
    { label: '1,200 sq.ft +', min: 1200, max: null },
    { label: '1,500 sq.ft +', min: 1500, max: null },
    { label: '1,800 sq.ft +', min: 1800, max: null },
  ],
  workspace: [
    { label: 'Up to 15,000 sq.ft', min: null, max: 15000 },
    { label: '15,000–40,000 sq.ft', min: 15000, max: 40000 },
    { label: '40,000 sq.ft +', min: 40000, max: null },
  ],
};

export function useHeroSearch(properties: Property[], corridors: Corridor[], seg: SearchSegment) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [corridorId, setCorridorId] = useState<string | null>(null);
  const [bhk, setBhk] = useState<number[]>([]);
  const [size, setSize] = useState<{ min: number | null; max: number | null } | null>(null);
  const [budget, setBudget] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

  useEffect(() => {
    setBhk([]);
    setSize(null);
    setBudget({ min: null, max: null });
  }, [seg]);

  const state: ListingState = useMemo(
    () => ({
      ...DEFAULT_LISTING_STATE,
      seg,
      q: corridorId ? '' : q,
      corridors: corridorId ? [corridorId] : [],
      bhk: seg === 'residential' ? bhk : [],
      sizeMin: seg === 'residential' ? null : size?.min ?? null,
      sizeMax: seg === 'residential' ? null : size?.max ?? null,
      min: budget.min,
      max: budget.max,
    }),
    [seg, q, corridorId, bhk, size, budget],
  );

  const count = useMemo(() => properties.filter((p) => matchesListing(p, state)).length, [properties, state]);
  const href = `/properties?${serializeListingState(state)}`;
  const corridorName = corridors.find((c) => c.id === corridorId)?.name;
  const where = corridorName ?? (q.trim() || 'All Bengaluru');
  const summary = `${SEGMENT_LABEL[seg]} · ${where}${bhk.length && seg === 'residential' ? ` · ${bhk.map(bhkLabel).join(', ')}` : ''}`;
  const [one, many] = SEGMENT_NOUN[seg];
  const cta = count === 0 ? 'See closest matches' : `Show ${count} ${count === 1 ? one : many}`;

  const submit = () => {
    rememberSearch({ label: summary, href });
    router.push(href);
  };

  const pick = (suggestion: Suggestion) => {
    if (suggestion.kind === 'project') {
      router.push(`/properties/${suggestion.slug}`);
      return;
    }
    if (suggestion.kind === 'recent') {
      router.push(suggestion.href);
      return;
    }
    if (suggestion.kind === 'corridor') {
      setCorridorId(suggestion.id);
      setQ(suggestion.label);
      return;
    }
    setCorridorId(null);
    setQ(suggestion.label);
  };

  const changeQuery = (value: string) => {
    setQ(value);
    setCorridorId(null);
  };

  return { q, changeQuery, pick, bhk, setBhk, size, setSize, budget, setBudget, count, cta, submit, summary, noun: many };
}
