'use client';

import { Search } from 'lucide-react';
import type { SearchSegment } from '@/lib/data/types';
import { BHK_CHOICES } from '@/lib/listingFilters';
import { bhkLabel } from '@/lib/property';
import { Popover } from '@/components/ui/Popover';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { BudgetRange, budgetSummary } from './BudgetRange';
import { LocalityAutocomplete, type Suggestion } from './LocalityAutocomplete';
import { SIZE_CHOICES, useHeroSearch } from './useHeroSearch';

type Search = ReturnType<typeof useHeroSearch>;

export function BhkChips({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="BHK">
      <button type="button" className="chip justify-center" aria-pressed={value.length === 0} onClick={() => onChange([])}>
        Any
      </button>
      {BHK_CHOICES.map((b) => (
        <button key={b} type="button" className="chip justify-center" aria-pressed={value.includes(b)} onClick={() => onChange(value.includes(b) ? value.filter((x) => x !== b) : [...value, b].sort((x, y) => x - y))}>
          {bhkLabel(b).replace(' BHK', '')}
        </button>
      ))}
    </div>
  );
}

export function SizeChips({ seg, value, onChange }: { seg: SearchSegment; value: { min: number | null; max: number | null } | null; onChange: (v: { min: number | null; max: number | null } | null) => void }) {
  const choices = SIZE_CHOICES[seg === 'plot' ? 'plot' : 'workspace'];
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={seg === 'plot' ? 'Plot size' : 'Floor area'}>
      <button type="button" className="chip" aria-pressed={!value} onClick={() => onChange(null)}>
        Any size
      </button>
      {choices.map((c) => (
        <button key={c.label} type="button" className="chip" aria-pressed={value?.min === c.min && value?.max === c.max} onClick={() => onChange({ min: c.min, max: c.max })}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function sizeSummary(seg: SearchSegment, search: Search) {
  if (seg === 'residential') return search.bhk.length ? search.bhk.map(bhkLabel).join(', ') : 'Any BHK';
  const choice = SIZE_CHOICES[seg === 'plot' ? 'plot' : 'workspace'].find((c) => c.min === search.size?.min && c.max === search.size?.max);
  return choice?.label ?? 'Any size';
}

// Desktop search console: locality autocomplete | BHK or size | budget | live-count button.
export function SearchConsole({ seg, search, suggestions }: { seg: SearchSegment; search: Search; suggestions: Suggestion[] }) {
  const rent = seg === 'rent' || seg === 'commercial';
  return (
    <form
      role="search"
      aria-label="Search properties"
      onSubmit={(e) => {
        e.preventDefault();
        search.submit();
      }}
      className="panel grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] items-center gap-1 p-2 shadow-[0_24px_60px_-30px_rgb(var(--shadow)/0.5)]"
    >
      <div className="min-w-0 px-1">
        <label htmlFor="hero-search-input" className="sheet-label block px-3 pt-1">Where</label>
        <LocalityAutocomplete id="hero-search-input" value={search.q} onChange={search.changeQuery} onPick={search.pick} suggestions={suggestions} inputClassName="border-transparent bg-transparent hover:border-transparent" />
      </div>
      <div className="border-l border-line">
        <Popover label={seg === 'residential' ? 'BHK' : seg === 'plot' ? 'Plot size' : 'Floor area'} value={sizeSummary(seg, search)} panelClassName="w-[320px]">
          {seg === 'residential' ? <BhkChips value={search.bhk} onChange={search.setBhk} /> : <SizeChips seg={seg} value={search.size} onChange={search.setSize} />}
        </Popover>
      </div>
      <div className="border-l border-line">
        <Popover label={rent ? 'Monthly budget' : 'Budget'} value={budgetSummary(search.budget.min, search.budget.max, rent)} panelClassName="w-[360px]" align="right">
          <BudgetRange idPrefix="hero-budget" rent={rent} min={search.budget.min} max={search.budget.max} onChange={(min, max) => search.setBudget({ min, max })} />
        </Popover>
      </div>
      <button type="submit" className="btn-primary min-h-[56px] px-6 text-base">
        <Search className="h-4 w-4" aria-hidden="true" />
        {search.count > 0 ? (
          <span>
            <span aria-hidden="true">
              Show <NumberRoll value={search.count} /> {search.cta.split(' ').slice(2).join(' ')}
            </span>
            <span className="sr-only">{search.cta}</span>
          </span>
        ) : (
          search.cta
        )}
      </button>
    </form>
  );
}
