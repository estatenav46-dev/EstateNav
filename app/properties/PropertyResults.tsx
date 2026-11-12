'use client';

import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowDownUp, ArrowLeft, ArrowUpRight, Calculator, ChevronRight, GitCompareArrows, MessageCircle, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import type { Corridor, Lens, MarketSnapshot, Property, SiteSettings } from '@/lib/data/types';
import {
  APPROVAL_OPTIONS,
  DEFAULT_LISTING_STATE,
  POSSESSION_OPTIONS,
  STATUS_OPTIONS,
  applyListing,
  matchesListing,
  parseListingState,
  relaxSuggestions,
  serializeListingState,
  SORT_OPTIONS,
  type ListingState,
} from '@/lib/listingFilters';
import { bhkLabel, LENS_LABEL, SEGMENT_NOUN } from '@/lib/property';
import { liveZones, comingSoonZones, zoneById, zoneOfCorridor, type Zone } from '@/lib/regions';
import { SALE_BUDGET_CHOICES, TYPE_CHIPS } from '@/lib/categories';
import { budgetSummary } from '@/components/search/BudgetRange';
import { FilterPanel } from '@/components/listings/FilterPanel';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { ZoneDial } from '@/components/explore/ZoneDial';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { Modal } from '@/components/ui/Modal';
import { useMediaQuery } from '@/lib/ui/hooks';
import { breadcrumbJsonLd } from '@/lib/seo';
import { ADVISOR_NAME, whatsAppLink } from '@/lib/contact';
import { compareSheetStore, compareStore } from '@/lib/ui/stores';
import { latestSnapshots } from '@/components/home/MarketTicker';

const CostStudio = dynamic(() => import('@/components/property/CostStudio'), { ssr: false, loading: () => <div className="skeleton h-80 rounded-xl" /> });
const LENSES: Lens[] = ['first-home', 'upgrading', 'nri', 'senior'];

const PAGE = 12;

type RailItem = { key: string; label: string; sub?: string; count: number; active: boolean; visual: React.ReactNode; onSelect: () => void };

// Filters the left rail and type chips don't already show, as removable chips.
function extraChips(s: ListingState): { key: string; label: string; patch: Partial<ListingState> }[] {
  const chips: { key: string; label: string; patch: Partial<ListingState> }[] = [];
  if (s.q) chips.push({ key: 'q', label: `“${s.q}”`, patch: { q: '' } });
  s.bhk.forEach((b) => chips.push({ key: `b-${b}`, label: bhkLabel(b), patch: { bhk: s.bhk.filter((x) => x !== b) } }));
  if (s.min != null || s.max != null)
    chips.push({ key: 'budget', label: budgetSummary(s.min, s.max, s.seg === 'rent' || s.seg === 'commercial'), patch: { min: null, max: null } });
  if (s.sizeMin != null || s.sizeMax != null) chips.push({ key: 'size', label: `${s.sizeMin ?? 0}–${s.sizeMax ?? '∞'} sq.ft`, patch: { sizeMin: null, sizeMax: null } });
  if (s.possession) chips.push({ key: 'pos', label: POSSESSION_OPTIONS.find((o) => o.value === s.possession)!.label, patch: { possession: '' } });
  s.status.forEach((v) => chips.push({ key: `s-${v}`, label: STATUS_OPTIONS.find((o) => o.value === v)!.label, patch: { status: s.status.filter((x) => x !== v) } }));
  s.amenities.forEach((a) => chips.push({ key: `a-${a}`, label: a, patch: { amenities: s.amenities.filter((x) => x !== a) } }));
  s.approvals.forEach((v) => chips.push({ key: `ap-${v}`, label: APPROVAL_OPTIONS.find((o) => o.value === v)!.label, patch: { approvals: s.approvals.filter((x) => x !== v) } }));
  if (s.verified) chips.push({ key: 'verified', label: 'K-RERA verified', patch: { verified: false } });
  s.lens.forEach((l) => chips.push({ key: `l-${l}`, label: LENS_LABEL[l], patch: { lens: s.lens.filter((x) => x !== l) } }));
  return chips;
}

function UrlSync({ onChange }: { onChange: (query: string) => void }) {
  const query = useSearchParams().toString();
  useEffect(() => onChange(query), [query, onChange]);
  return null;
}

function Thumb({ property, label }: { property?: Property; label: string }) {
  if (!property) {
    return (
      <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold text-ink-muted">
        {label.charAt(0)}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-2">
      <Image src={property.media.cover.url} alt="" fill sizes="44px" quality={40} className="object-cover" />
    </span>
  );
}

function Rail({ items, back, label, tools }: { items: RailItem[]; back?: { label: string; onSelect: () => void }; label: string; tools?: React.ReactNode }) {
  return (
    <nav aria-label={label} className="no-scrollbar sticky top-[60px] h-[calc(100dvh-60px)] w-[88px] shrink-0 overflow-y-auto overscroll-contain border-r border-line bg-surface/60 pb-24 sm:w-[210px] lg:w-[250px] md:pb-6">
      {back && (
        <button type="button" onClick={back.onSelect} className="flex min-h-[48px] w-full items-center justify-center gap-1 border-b border-line px-2 text-xs font-semibold text-accent-ink hover:bg-surface-2 sm:justify-start sm:px-4 sm:text-sm">
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{back.label}</span>
        </button>
      )}
      <ul className="py-1">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={item.onSelect}
              aria-current={item.active ? 'true' : undefined}
              className={`relative flex w-full flex-col items-center gap-1.5 px-1.5 py-3 text-center transition-colors duration-fast sm:flex-row sm:gap-3 sm:px-4 sm:text-left ${
                item.active ? 'bg-accent-soft/70 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {item.active && <span aria-hidden="true" className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-accent sm:left-0 sm:right-auto sm:rounded-l-none sm:rounded-r-full" />}
              {item.visual}
              <span className="min-w-0 flex-1">
                <span className={`block text-[11px] leading-tight sm:truncate sm:text-sm ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {item.sub && <span className="mt-0.5 hidden truncate text-xs text-ink-muted sm:block">{item.sub}</span>}
              </span>
              <span className={`text-[10px] font-semibold sm:rounded-full sm:px-2 sm:py-0.5 sm:text-xs ${item.count ? 'sm:bg-surface-2' : 'opacity-60'} ${item.active ? 'text-accent-ink' : ''}`}>{item.count}</span>
            </button>
          </li>
        ))}
      </ul>
      {tools && <div className="hidden border-t border-line p-4 lg:block">{tools}</div>}
    </nav>
  );
}

type Props = { properties: Property[]; corridors: Corridor[]; snapshots: MarketSnapshot[]; costs: SiteSettings['costs']; costDisclaimer: string };

export default function PropertyResults({ properties, corridors, snapshots, costs, costDisclaimer }: Props) {
  const pathname = usePathname();
  const [state, setState] = useState<ListingState>(DEFAULT_LISTING_STATE);
  const [sheet, setSheet] = useState(false);
  const [studio, setStudio] = useState(false);
  const wide = useMediaQuery('(min-width: 768px)');
  const compare = compareStore.useValue();
  const [limit, setLimit] = useState(PAGE);
  const written = useRef('');
  const writeTimer = useRef<ReturnType<typeof setTimeout>>();
  const top = useRef<HTMLDivElement>(null);

  const syncFromUrl = useCallback((query: string) => {
    document.documentElement.removeAttribute('data-listing-pending');
    if (query === written.current) return;
    written.current = query;
    setState(parseListingState(new URLSearchParams(query)));
    setLimit(PAGE);
  }, []);

  // Filters replace the URL quietly; moving between regions and areas adds a history step,
  // so the phone's back button walks back up the way an app would.
  const update = (patch: Partial<ListingState>, step = false) => {
    setState((current) => {
      const next = { ...current, ...patch };
      const write = () => {
        const qs = serializeListingState(next);
        written.current = qs;
        window.history[step ? 'pushState' : 'replaceState'](null, '', qs ? `${pathname}?${qs}` : pathname);
      };
      clearTimeout(writeTimer.current);
      if (step) write();
      else writeTimer.current = setTimeout(write, 250);
      return next;
    });
    setLimit(PAGE);
    if (step && top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ block: 'start' });
  };
  useEffect(() => () => clearTimeout(writeTimer.current), []);

  // Area changes from the filter sheet keep the region in step with the chosen corridors.
  const panelUpdate = (patch: Partial<ListingState>) => {
    if (!patch.corridors) return update(patch);
    const zones = new Set(patch.corridors.map(zoneOfCorridor));
    update({ ...patch, zone: zones.size === 1 ? Array.from(zones)[0] : patch.corridors.length ? '' : state.zone, loc: '' });
  };

  const zone = state.zone ? zoneById(state.zone) : undefined;
  const area = state.corridors.length === 1 ? corridors.find((c) => c.id === state.corridors[0]) : undefined;
  const results = useMemo(() => applyListing(properties, state), [properties, state]);
  const shown = results.slice(0, limit);
  const countWith = (patch: Partial<ListingState>) => properties.filter((p) => matchesListing(p, { ...state, ...patch })).length;

  // Corridors in this region, including ones only known from listings.
  const zoneCorridors = useMemo(() => {
    if (!zone) return [];
    const ids = new Set([...zone.corridorIds, ...properties.filter((p) => zoneOfCorridor(p.corridorId) === zone.id).map((p) => p.corridorId)]);
    return corridors.filter((c) => ids.has(c.id)).sort((a, b) => a.order - b.order);
  }, [zone, corridors, properties]);
  const localitiesOf = (filter: (p: Property) => boolean) => Array.from(new Set(properties.filter(filter).map((p) => p.locality))).sort();
  const singleArea = zoneCorridors.length === 1;

  const goZone = (z: Zone | null) => update({ zone: z?.id ?? '', corridors: [], loc: '' }, true);
  const up = () => {
    if (state.loc && !singleArea) update({ loc: '' }, true);
    else if (state.corridors.length || state.loc) update({ corridors: [], loc: '' }, true);
    else update({ zone: '', corridors: [], loc: '' }, true);
  };

  let railItems: RailItem[];
  let railBack: { label: string; onSelect: () => void } | undefined;
  if (!zone) {
    railItems = [
      {
        key: 'all',
        label: 'All Bengaluru',
        sub: 'Every region',
        count: countWith({ zone: '', corridors: [], loc: '' }),
        active: true,
        visual: <ZoneDial zone={{ id: 'central', name: 'All', short: 'All', areas: '', corridorIds: [], available: true, heading: null }} size={44} />,
        onSelect: () => goZone(null),
      },
      ...liveZones(properties).map((z) => ({
        key: z.id,
        label: z.short,
        sub: z.areas,
        count: countWith({ zone: z.id, corridors: [], loc: '' }),
        active: false,
        visual: <ZoneDial zone={z} size={44} />,
        onSelect: () => goZone(z),
      })),
    ];
  } else {
    railBack = { label: 'All regions', onSelect: () => goZone(null) };
    const inZoneList = properties.filter((p) => zoneOfCorridor(p.corridorId) === zone.id);
    railItems = [
      {
        key: 'all',
        label: `All ${zone.short}`,
        sub: zone.areas,
        count: countWith({ corridors: [], loc: '' }),
        active: (!state.corridors.length || (singleArea && state.corridors[0] === zoneCorridors[0]?.id)) && !state.loc,
        visual: <ZoneDial zone={zone} size={44} />,
        onSelect: () => update({ corridors: [], loc: '' }, true),
      },
      ...(singleArea
        ? localitiesOf((p) => zoneOfCorridor(p.corridorId) === zone.id).map((loc) => ({
            key: `l-${loc}`,
            label: loc,
            count: countWith({ corridors: [], loc }),
            active: state.loc === loc,
            visual: <Thumb property={inZoneList.find((p) => p.locality === loc)} label={loc} />,
            onSelect: () => update({ corridors: [], loc }, true),
          }))
        : zoneCorridors.map((c) => ({
            key: c.id,
            label: c.name,
            count: countWith({ corridors: [c.id], loc: '' }),
            active: state.corridors.length === 1 && state.corridors[0] === c.id,
            visual: <Thumb property={inZoneList.find((p) => p.corridorId === c.id)} label={c.name} />,
            onSelect: () => update({ corridors: [c.id], loc: '' }, true),
          }))),
    ];
  }

  // Locations inside a chosen area, when the region has several areas.
  const locChips = area && !singleArea ? localitiesOf((p) => p.corridorId === area.id) : [];
  const hasHomeRentals = properties.some((p) => p.transaction === 'rent' && p.segment !== 'commercial');
  const typeChips = TYPE_CHIPS.filter((t) => (t.seg === 'rent' ? hasHomeRentals : true)).map((t) => ({ ...t, count: countWith({ seg: t.seg }) }));
  const saleBudgets = state.seg === '' || state.seg === 'residential' || state.seg === 'plot';
  const budgetId = SALE_BUDGET_CHOICES.find((b) => b.min === state.min && b.max === state.max)?.id ?? 'custom';
  const chips = extraChips(state).filter((c) => !c.key.startsWith('l-') || state.lens.length > 1);
  const lensChips = LENSES.map((l) => ({ lens: l, count: countWith({ lens: [l] }) })).filter((l) => l.count > 0);
  const toggleApproval = (key: ListingState['approvals'][number]) =>
    update({ approvals: state.approvals.includes(key) ? state.approvals.filter((a) => a !== key) : [...state.approvals, key] });
  const benchmarkCorridor = area?.id ?? (singleArea ? zoneCorridors[0]?.id : undefined);
  const benchmark = benchmarkCorridor ? latestSnapshots(snapshots).find((s) => s.corridorId === benchmarkCorridor) : undefined;
  const suggestions = results.length === 0 ? relaxSuggestions(properties, state) : [];

  const [one, many] = state.seg ? SEGMENT_NOUN[state.seg] : ['project', 'projects'];
  const title = state.loc || area?.name || zone?.name || 'All of Bengaluru';
  const context = state.loc ? area?.name ?? zone?.name : area ? zone?.name : zone ? zone.areas : 'Pick a region to narrow it down';

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/properties' },
    ...(zone ? [{ name: zone.short, path: `/properties?zone=${zone.id}` }] : []),
    ...(zone && area ? [{ name: area.name, path: `/properties?zone=${zone.id}&corridor=${area.id}` }] : []),
  ];

  const filterFooter = (
    <div className="flex gap-2">
      {chips.length > 0 && (
        <button
          type="button"
          onClick={() => update({ ...DEFAULT_LISTING_STATE, zone: state.zone, corridors: state.corridors, loc: state.loc, seg: state.seg, sort: state.sort })}
          className="btn-secondary"
        >
          Clear
        </button>
      )}
      <button type="button" onClick={() => setSheet(false)} className="btn-primary flex-1">
        Show {results.length} {results.length === 1 ? one : many}
      </button>
    </div>
  );

  const askText = `Hi ${ADVISOR_NAME}, I'm looking for ${state.seg ? SEGMENT_NOUN[state.seg][1] : 'property'} in ${title} on EstateNav and couldn't find a match. Do you have anything coming up there?`;

  return (
    <main id="main" className="mx-auto flex max-w-container">
      <Suspense fallback={null}>
        <UrlSync onChange={syncFromUrl} />
      </Suspense>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <Rail
        items={railItems}
        back={railBack}
        label={zone ? `Areas in ${zone.name}` : 'Regions'}
        tools={
          <div className="space-y-5">
            <fieldset>
              <legend className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" /> RERA audit checklist
              </legend>
              <div className="mt-2 space-y-0.5">
                {APPROVAL_OPTIONS.map((o) => (
                  <label key={o.value} className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm">
                    <input type="checkbox" checked={state.approvals.includes(o.value)} onChange={() => toggleApproval(o.value)} className="h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
                    <span className="flex-1">{o.label}</span>
                    <span className="text-xs text-ink-muted">{countWith({ approvals: Array.from(new Set([...state.approvals, o.value])) })}</span>
                  </label>
                ))}
                <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={state.verified} onChange={() => update({ verified: !state.verified })} className="h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
                  <span className="flex-1">K-RERA number shown</span>
                  <span className="text-xs text-ink-muted">{countWith({ verified: true })}</span>
                </label>
              </div>
            </fieldset>
            <div className="space-y-2">
              <button type="button" onClick={() => setStudio(true)} className="btn-secondary min-h-[44px] w-full justify-start px-3">
                <Calculator className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Cost &amp; EMI studio
              </button>
              {compare.length > 0 && (
                <button type="button" onClick={() => compareSheetStore.set(true)} className="btn-secondary min-h-[44px] w-full justify-start px-3">
                  <GitCompareArrows className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Compare {compare.length} selected
                </button>
              )}
            </div>
          </div>
        }
      />

      <div ref={top} className="min-w-0 flex-1 scroll-mt-[60px] px-3 pb-28 pt-3 sm:px-5 lg:px-8 md:pb-16">
        <div className="hidden sm:block">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="flex items-start gap-2 sm:mt-1">
          {zone && (
            <button type="button" onClick={up} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-2 sm:hidden" aria-label="Go back one level">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl leading-tight sm:text-3xl">{title}</h1>
            <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm" aria-live="polite">
              <strong className="text-ink">{results.length}</strong> {results.length === 1 ? one : many}
              {context ? ` · ${context}` : ''}
            </p>
            {benchmark && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                <span>
                  Benchmark <strong className="tabular font-mono text-ink">₹{Math.round(benchmark.avgPricePerSqft).toLocaleString('en-IN')}/sq.ft</strong>
                </span>
                <span className={`tabular inline-flex items-center font-mono ${benchmark.yoyChangePct >= 0 ? 'text-accent-ink' : 'text-danger'}`}>
                  {benchmark.yoyChangePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
                  {Math.abs(benchmark.yoyChangePct).toFixed(1)}% YoY
                </span>
                <span>· {benchmark.source}, {new Date(`${benchmark.asOf.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
              </p>
            )}
          </div>
          <label className="relative hidden w-56 shrink-0 md:block lg:w-72">
            <span className="sr-only">Search in these results</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input value={state.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search project or builder" className="field min-h-[44px] rounded-full pl-9 text-sm" />
          </label>
        </div>

        {/* Toolbar: what kind of property, then budget, filters and sort. */}
        <div className="sticky top-[60px] z-20 -mx-3 mt-3 border-b border-line bg-bg/95 px-3 py-2 backdrop-blur sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5" role="group" aria-label="Property type">
            {typeChips.map((t) => (
              <button
                key={t.label}
                type="button"
                aria-pressed={state.seg === t.seg}
                disabled={!t.count && state.seg !== t.seg}
                onClick={() => update({ seg: t.seg })}
                className="chip min-h-[48px] shrink-0 whitespace-nowrap px-3.5 text-sm font-medium disabled:opacity-40 sm:min-h-[40px]"
              >
                {t.label}
                <span className="text-xs text-ink-muted">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {saleBudgets && (
              <label className="min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Budget</span>
                <select
                  value={budgetId}
                  onChange={(e) => {
                    const b = SALE_BUDGET_CHOICES.find((x) => x.id === e.target.value);
                    if (b) update({ min: b.min, max: b.max });
                  }}
                  className="h-12 w-full rounded-full border border-line bg-surface pl-3 pr-2 text-[13px] font-medium text-ink hover:border-line-strong sm:h-10 sm:w-44 sm:text-sm"
                >
                  {budgetId === 'custom' && <option value="custom">{budgetSummary(state.min, state.max, false)}</option>}
                  {SALE_BUDGET_CHOICES.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </label>
            )}
            {/* Phones get an icon-sized sort control; the native picker still opens on tap. */}
            <label className={`relative inline-flex h-12 w-12 shrink-0 items-center sm:h-10 justify-center rounded-full border sm:w-auto ${state.sort !== 'relevance' ? 'border-accent-ink bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink'} sm:border-0 sm:bg-transparent`}>
              <span className="sr-only">Sort by</span>
              <ArrowDownUp className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <select
                value={state.sort}
                onChange={(e) => update({ sort: e.target.value as ListingState['sort'] })}
                className="absolute inset-0 h-12 w-12 cursor-pointer opacity-0 sm:static sm:h-10 sm:w-48 sm:rounded-full sm:border sm:border-line sm:bg-surface sm:px-3 sm:text-sm sm:font-medium sm:text-ink sm:opacity-100 sm:hover:border-line-strong"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.value === 'relevance' ? 'Sort: Featured' : o.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setSheet(true)}
              className={`inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors sm:h-10 ${chips.length ? 'bg-ink text-bg' : 'border border-line bg-surface text-ink hover:border-line-strong'}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">More filters</span>
              <span className={`sm:hidden ${chips.length ? 'sr-only' : ''}`}>Filters</span>
              {chips.length > 0 && <span className="rounded-full bg-bg/20 px-1.5 text-xs">{chips.length}</span>}
            </button>
          </div>
        </div>

        {locChips.length > 1 && (
          <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1" role="group" aria-label={`Locations in ${area!.name}`}>
            <button type="button" aria-pressed={!state.loc} onClick={() => update({ loc: '' }, true)} className="chip min-h-[48px] shrink-0 px-3.5 text-sm sm:min-h-[40px]">
              All of {area!.name}
            </button>
            {locChips.map((loc) => (
              <button key={loc} type="button" aria-pressed={state.loc === loc} onClick={() => update({ loc }, true)} className="chip min-h-[48px] shrink-0 px-3.5 text-sm sm:min-h-[40px]">
                {loc}
                <span className="text-xs text-ink-muted">{countWith({ loc })}</span>
              </button>
            ))}
          </div>
        )}

        {lensChips.length > 0 && (
          <div className="no-scrollbar -mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1" role="group" aria-label="Buyer lens">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">For</span>
            <button type="button" aria-pressed={!state.lens.length} onClick={() => update({ lens: [] })} className="chip min-h-[48px] shrink-0 px-3.5 text-sm sm:min-h-[40px]">
              Everyone
            </button>
            {lensChips.map(({ lens, count }) => (
              <button
                key={lens}
                type="button"
                aria-pressed={state.lens.length === 1 && state.lens[0] === lens}
                onClick={() => update({ lens: state.lens.length === 1 && state.lens[0] === lens ? [] : [lens] })}
                className="chip min-h-[48px] shrink-0 whitespace-nowrap px-3.5 text-sm sm:min-h-[40px]"
              >
                {LENS_LABEL[lens]}
                <span className="text-xs text-ink-muted">{count}</span>
              </button>
            ))}
          </div>
        )}

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Active filters">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button type="button" onClick={() => update(chip.patch)} className="chip min-h-[48px] px-3.5 text-xs sm:min-h-[36px]" aria-label={`Remove filter ${chip.label}`}>
                  {chip.label}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => update({ ...DEFAULT_LISTING_STATE, zone: state.zone, corridors: state.corridors, loc: state.loc, seg: state.seg, sort: state.sort })}
                className="min-h-[48px] px-2 text-xs font-semibold text-accent-ink hover:underline sm:min-h-[36px]"
              >
                Clear filters
              </button>
            </li>
          </ul>
        )}

        <section id="listing-results" aria-label="Matching properties" className="mt-4">
          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface px-5 py-10 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
                <Search className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-serif text-xl sm:text-2xl">Nothing listed here yet</h2>
              <p className="mt-1 max-w-md text-sm text-ink-muted">Our advisor often knows of launches and resale units before they are listed. Ask, or widen the search.</p>
              {suggestions.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button key={s.label} type="button" onClick={() => update(s.patch, Boolean(s.patch.zone !== undefined || s.patch.corridors || s.patch.loc !== undefined))} className="chip text-sm">
                      {s.label} <span className="text-xs text-ink-muted">{s.count}</span>
                    </button>
                  ))}
                </div>
              )}
              <a href={whatsAppLink(askText)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Connect with dedicated area advisor
              </a>
            </div>
          ) : (
            <ul key={`${state.zone}|${state.corridors.join()}|${state.loc}|${state.seg}`} className="grid animate-fade-up grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              {shown.map((p, i) => (
                <li key={p.id}>
                  <ExploreCard property={p} priority={i < 2} />
                </li>
              ))}
            </ul>
          )}

          {results.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn-secondary rounded-full">
                Show {Math.min(PAGE, results.length - limit)} more
              </button>
            </div>
          )}

          {!zone && results.length > 0 && comingSoonZones().length > 0 && (
            <p className="mt-6 text-center text-xs text-ink-muted">
              {comingSoonZones()
                .map((z) => z.name)
                .join(' and ')}{' '}
              coming soon.
            </p>
          )}
        </section>

        {zone && results.length > 0 && !area && !state.loc && zoneCorridors.length > 1 && (
          <p className="mt-6 flex items-center justify-center gap-1 text-xs text-ink-muted">
            Tip: pick an area on the left to see its locations <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </p>
        )}
      </div>

      {/* More filters: a centred card from tablet up, a bottom sheet on phones. */}
      {wide ? (
        <Modal open={sheet} onOpenChange={setSheet} title="More filters" description="BHK, budget, possession, approvals and more" footer={filterFooter}>
          {sheet && <FilterPanel state={state} update={panelUpdate} corridors={corridors} properties={properties} idPrefix="modal" />}
        </Modal>
      ) : (
        <Sheet open={sheet} onOpenChange={setSheet} title="More filters" description="BHK, budget, possession, approvals and more" footer={filterFooter}>
          <FilterPanel state={state} update={panelUpdate} corridors={corridors} properties={properties} idPrefix="sheet" />
        </Sheet>
      )}

      <Sheet open={studio} onOpenChange={setStudio} direction="right" title="Cost & EMI studio" description="EMI, Karnataka stamp duty, registration and Section 24(b)" className="max-w-[560px]">
        {studio && <CostStudio costs={costs} disclaimer={costDisclaimer} initialValue={state.max ?? state.min ?? 12_500_000} idPrefix="explore-cost" stacked />}
      </Sheet>
    </main>
  );
}
