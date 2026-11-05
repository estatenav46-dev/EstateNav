'use client';

import { Search } from 'lucide-react';
import type { SearchSegment } from '@/lib/data/types';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { BudgetRange } from './BudgetRange';
import { LocalityAutocomplete, type Suggestion } from './LocalityAutocomplete';
import { BhkChips, SizeChips } from './SearchConsole';
import type { useHeroSearch } from './useHeroSearch';

export function MobileSearchSheet({ open, onOpenChange, seg, search, suggestions, segmentSwitcher }: { open: boolean; onOpenChange: (v: boolean) => void; seg: SearchSegment; search: ReturnType<typeof useHeroSearch>; suggestions: Suggestion[]; segmentSwitcher: React.ReactNode }) {
  const rent = seg === 'rent' || seg === 'commercial';
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      fullHeight
      footer={
        <button type="button" onClick={search.submit} className="btn-primary w-full text-base">
          <Search className="h-4 w-4" aria-hidden="true" /> {search.cta}
        </button>
      }
    >
      <div className="space-y-6">
        {segmentSwitcher}
        <div>
          <label htmlFor="sheet-search-input" className="sheet-label mb-2 block">Where</label>
          <LocalityAutocomplete id="sheet-search-input" value={search.q} onChange={search.changeQuery} onPick={search.pick} suggestions={suggestions} />
        </div>
        <div>
          <p className="sheet-label mb-2">{seg === 'residential' ? 'BHK' : seg === 'plot' ? 'Plot size' : 'Floor area'}</p>
          {seg === 'residential' ? <BhkChips value={search.bhk} onChange={search.setBhk} /> : <SizeChips seg={seg} value={search.size} onChange={search.setSize} />}
        </div>
        <div>
          <p className="sheet-label mb-2">{rent ? 'Monthly budget' : 'Budget'}</p>
          <BudgetRange idPrefix="sheet-budget" rent={rent} min={search.budget.min} max={search.budget.max} onChange={(min, max) => search.setBudget({ min, max })} />
        </div>
      </div>
    </Sheet>
  );
}
