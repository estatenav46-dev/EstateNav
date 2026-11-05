'use client';

import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, LayoutGrid, List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Corridor, Property } from '@/lib/data/types';
import {
  APPROVAL_OPTIONS,
  applyListing,
  countActiveFilters,
  DEFAULT_LISTING_STATE,
  parseListingState,
  POSSESSION_OPTIONS,
  relaxSuggestions,
  serializeListingState,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type ListingState,
  type ListingView,
} from '@/lib/listingFilters';
import { bhkLabel, LENS_LABEL, SEGMENT_LABEL, SEGMENT_NOUN } from '@/lib/property';
import { budgetSummary } from '@/components/search/BudgetRange';
import { FilterPanel } from '@/components/listings/FilterPanel';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { breadcrumbJsonLd } from '@/lib/seo';
import { useFlip } from '@/lib/ui/useFlip';

const CorridorMap = dynamic(() => import('@/components/map/CorridorMap').then((m) => m.CorridorMap), { ssr: false, loading: () => <div className="skeleton aspect-[440/470] rounded-card" /> });

function EmptyPlot() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-56 text-ink-muted" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 96L110 64l90 32-90 20z" strokeDasharray="5 4" />
      <path d="M20 96v-8M110 64v-8M200 96v-8M110 116v-8" strokeWidth="2" />
      <path d="M150 74c0-14 8-22 8-30m0 30c0-10-6-16-6-24 0-6 6-10 6-10s6 4 6 10c0 8-6 14-6 24" />
      <path d="M60 80h-6M60 80l8-14" />
      <circle cx="110" cy="40" r="4" />
      <path d="M110 44v12" />
    </svg>
  );
}

function chipsFor(s: ListingState, corridors: Corridor[]): { key: string; label: string; patch: Partial<ListingState> }[] {
  const chips: { key: string; label: string; patch: Partial<ListingState> }[] = [];
  if (s.seg) chips.push({ key: 'seg', label: SEGMENT_LABEL[s.seg], patch: { seg: '' } });
  if (s.q) chips.push({ key: 'q', label: `“${s.q}”`, patch: { q: '' } });
  s.corridors.forEach((id) => chips.push({ key: `c-${id}`, label: corridors.find((c) => c.id === id)?.name ?? id, patch: { corridors: s.corridors.filter((x) => x !== id) } }));
  s.bhk.forEach((b) => chips.push({ key: `b-${b}`, label: bhkLabel(b), patch: { bhk: s.bhk.filter((x) => x !== b) } }));
  if (s.min != null || s.max != null) chips.push({ key: 'budget', label: budgetSummary(s.min, s.max, s.seg === 'rent' || s.seg === 'commercial'), patch: { min: null, max: null } });
  if (s.sizeMin != null || s.sizeMax != null) chips.push({ key: 'size', label: `${s.sizeMin ?? 0}–${s.sizeMax ?? '∞'} sq.ft`, patch: { sizeMin: null, sizeMax: null } });
  if (s.possession) chips.push({ key: 'pos', label: POSSESSION_OPTIONS.find((o) => o.value === s.possession)!.label, patch: { possession: '' } });
  s.status.forEach((v) => chips.push({ key: `s-${v}`, label: STATUS_OPTIONS.find((o) => o.value === v)!.label, patch: { status: s.status.filter((x) => x !== v) } }));
  s.amenities.forEach((a) => chips.push({ key: `a-${a}`, label: a, patch: { amenities: s.amenities.filter((x) => x !== a) } }));
  s.approvals.forEach((v) => chips.push({ key: `ap-${v}`, label: APPROVAL_OPTIONS.find((o) => o.value === v)!.label, patch: { approvals: s.approvals.filter((x) => x !== v) } }));
  if (s.verified) chips.push({ key: 'verified', label: 'K-RERA verified', patch: { verified: false } });
  s.lens.forEach((l) => chips.push({ key: `l-${l}`, label: LENS_LABEL[l], patch: { lens: s.lens.filter((x) => x !== l) } }));
  return chips;
}

const PAGE = 12;

// Only this tiny component reads useSearchParams, so the results above it still render on the
// server. It reports URL changes (header links, back/forward) to the workspace.
function UrlSync({ onChange }: { onChange: (query: string) => void }) {
  const query = useSearchParams().toString();
  useEffect(() => onChange(query), [query, onChange]);
  return null;
}

// Split workspace: sticky filter rail, instant client-side results, URL-backed state.
export default function PropertyResults({ properties, corridors }: { properties: Property[]; corridors: Corridor[] }) {
  const pathname = usePathname();
  const [state, setState] = useState<ListingState>(DEFAULT_LISTING_STATE);
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const written = useRef('');
  const writeTimer = useRef<ReturnType<typeof setTimeout>>();
  const grid = useRef<HTMLUListElement>(null);

  // Links that change the URL (header, footer, browser history) win over local state.
  const syncFromUrl = useMemo(
    () => (query: string) => {
      document.documentElement.removeAttribute('data-listing-pending');
      if (query === written.current) return;
      written.current = query;
      setState(parseListingState(new URLSearchParams(query)));
    },
    [],
  );

  const update = (patch: Partial<ListingState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => {
        const qs = serializeListingState(next);
        written.current = qs;
        window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
      }, 250);
      return next;
    });
    setLimit(PAGE);
  };
  useEffect(() => () => clearTimeout(writeTimer.current), []);

  const results = useMemo(() => applyListing(properties, state), [properties, state]);
  const shown = results.slice(0, limit);
  const chips = chipsFor(state, corridors);
  const active = countActiveFilters(state);
  const suggestions = results.length === 0 ? relaxSuggestions(properties, state) : [];
  const corridorName = state.corridors.length === 1 ? corridors.find((c) => c.id === state.corridors[0])?.name : undefined;
  const [one, many] = state.seg ? SEGMENT_NOUN[state.seg] : ['listing', 'listings'];
  const heading = `${state.seg ? SEGMENT_LABEL[state.seg] : 'All'} listings${corridorName ? ` on ${corridorName}` : ' in Bengaluru'}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    ...(state.seg ? [{ name: SEGMENT_LABEL[state.seg], path: `/properties?seg=${state.seg}` }] : []),
    ...(corridorName ? [{ name: corridorName, path: `/properties?${state.seg ? `seg=${state.seg}&` : ''}corridor=${state.corridors[0]}` }] : []),
  ];
  useFlip(grid, `${state.view}:${shown.map((p) => p.id).join(',')}`);

  const setView = (view: ListingView) => update({ view });
  const filterProps = { state, update, corridors, properties };

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <UrlSync onChange={syncFromUrl} />
      </Suspense>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-2 font-serif text-2xl sm:text-3xl">{heading}</h1>

      {/* Phones: sticky search, filters and sort. */}
      <div className="sticky top-[60px] z-30 -mx-4 mt-3 flex items-center gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur lg:hidden">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search listings</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input value={state.q} onChange={(e) => update({ q: e.target.value })} placeholder="Sarjapur, Whitefield…" className="field pl-10" />
        </label>
        <button type="button" onClick={() => setSheet('filters')} className="icon-btn relative" aria-label={`Filters${active ? `, ${active} active` : ''}`}>
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          {active > 0 && <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-accent px-1 text-center text-2xs leading-5 text-accent-on">{active}</span>}
        </button>
        <button type="button" onClick={() => setSheet('sort')} className="icon-btn" aria-label="Sort">
          <ArrowDownUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-[84px] max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain rounded-card border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">Filters</p>
              {active > 0 && (
                <button type="button" onClick={() => update({ ...DEFAULT_LISTING_STATE, view: state.view, sort: state.sort })} className="min-h-[40px] text-sm text-accent-ink hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel {...filterProps} idPrefix="rail" />
          </div>
        </aside>

        <section id="listing-results" aria-labelledby="results-title" className="min-w-0">
          <h2 id="results-title" className="sr-only">Results</h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg" aria-live="polite">
              <span aria-hidden="true" className="font-serif text-2xl">
                <NumberRoll value={results.length} />
              </span>{' '}
              <span aria-hidden="true" className="text-ink-muted">{results.length === 1 ? one : many}</span>
              <span className="sr-only">{`${results.length} ${results.length === 1 ? one : many} found`}</span>
            </p>
            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                Sort
                <select value={state.sort} onChange={(e) => update({ sort: e.target.value as ListingState['sort'] })} className="field min-h-[44px] w-auto py-0 pr-8 text-sm">
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <div role="radiogroup" aria-label="View" className="flex rounded-xl border border-line bg-surface p-1">
                {([['grid', LayoutGrid], ['list', List], ['map', MapIcon]] as const).map(([view, Icon]) => (
                  <button key={view} type="button" role="radio" aria-checked={state.view === view} aria-label={`${view} view`} onClick={() => setView(view)} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${state.view === view ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:text-ink'}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button type="button" onClick={() => update(chip.patch)} className="chip text-2xs" aria-label={`Remove filter ${chip.label}`}>
                    {chip.label}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 ? (
            <div className="panel mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
              <EmptyPlot />
              <div>
                <h2 className="font-serif text-2xl">No exact matches</h2>
                <p className="mt-1 text-ink-muted">Nothing fits every filter. Try one of these:</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <li key={s.label}>
                      <button type="button" onClick={() => update(s.patch)} className="chip min-h-[44px]">
                        {s.label} <span className="font-mono text-2xs text-ink-muted">→ {s.count} {s.count === 1 ? 'result' : 'results'}</span>
                      </button>
                    </li>
                  ))}
                  {suggestions.length === 0 && (
                    <li>
                      <button type="button" onClick={() => update({ ...DEFAULT_LISTING_STATE })} className="btn-secondary">Clear all filters</button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : state.view === 'map' ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="panel p-4">
                <CorridorMap corridors={corridors} properties={results} selected={state.corridors.length === 1 ? state.corridors[0] : null} onSelect={(id) => update({ corridors: id ? [id] : [] })} />
              </div>
              <ul className="space-y-4">
                {shown.map((p) => (
                  <li key={p.id}>
                    <PropertyCard property={p} variant="list" sizes="(min-width: 1280px) 15vw, 40vw" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul ref={grid} className={`mt-6 grid grid-cols-1 gap-5 ${state.view === 'list' ? '' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
              {shown.map((p, i) => (
                <li key={p.id} data-flip-id={p.id}>
                  <PropertyCard property={p} priority={i === 0} variant={state.view === 'list' ? 'list' : 'grid'} />
                </li>
              ))}
            </ul>
          )}

          {results.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn-secondary">
                Show more ({results.length - limit} left)
              </button>
            </div>
          )}
        </section>
      </div>

      <Sheet
        open={sheet === 'filters'}
        onOpenChange={(open) => setSheet(open ? 'filters' : null)}
        title="Filters"
        description={active ? `${active} active` : undefined}
        footer={
          <div className="flex gap-2">
            {active > 0 && (
              <button type="button" onClick={() => update({ ...DEFAULT_LISTING_STATE, view: state.view, sort: state.sort })} className="btn-secondary">
                Clear
              </button>
            )}
            <button type="button" onClick={() => setSheet(null)} className="btn-primary flex-1">
              Show {results.length} {results.length === 1 ? 'result' : 'results'}
            </button>
          </div>
        }
      >
        <FilterPanel {...filterProps} idPrefix="sheet" />
      </Sheet>

      <Sheet open={sheet === 'sort'} onOpenChange={(open) => setSheet(open ? 'sort' : null)} title="Sort by">
        <div role="radiogroup" aria-label="Sort by" className="grid gap-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={state.sort === o.value}
              onClick={() => {
                update({ sort: o.value });
                setSheet(null);
              }}
              className={`flex min-h-[48px] items-center justify-between rounded-lg px-3 text-left ${state.sort === o.value ? 'bg-accent-soft text-accent-ink' : 'hover:bg-surface-2'}`}
            >
              {o.label}
            </button>
          ))}
          <div role="radiogroup" aria-label="View" className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-3">
            {(['grid', 'list', 'map'] as const).map((view) => (
              <button key={view} type="button" role="radio" aria-checked={state.view === view} onClick={() => { setView(view); setSheet(null); }} className="chip justify-center capitalize">
                {view}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </main>
  );
}
