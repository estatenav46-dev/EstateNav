'use client';

import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowDownUp, ArrowLeft, ArrowUpRight, Calculator, ChevronRight, GitCompareArrows, IndianRupee, MessageCircle, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
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
  sortListings,
  SORT_OPTIONS,
  type ListingState,
} from '@/lib/listingFilters';
import { bhkLabel, LENS_LABEL, SEGMENT_NOUN } from '@/lib/property';
import { liveZones, comingSoonZones, zoneById, zoneOfCorridor, type Zone } from '@/lib/regions';
import { SALE_BUDGET_CHOICES, TYPE_CHIPS } from '@/lib/categories';
import { budgetSummary } from '@/components/search/BudgetRange';
import { PROPERTY_TYPE_LABEL } from '@/lib/listingMeta';
import { FilterPanel } from '@/components/listings/FilterPanel';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { PlaceSnapshot } from '@/components/explore/PlaceSnapshot';
import { placeGuide } from '@/lib/placeGuides';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useMediaQuery } from '@/lib/ui/hooks';
import { breadcrumbJsonLd } from '@/lib/seo';
import { ADVISOR_NAME, whatsAppLink } from '@/lib/contact';
import { compareSheetStore, compareStore } from '@/lib/ui/stores';
import { budgetBucket, track } from '@/lib/ui/visitor';
import { latestSnapshots } from '@/components/home/MarketTicker';

const CostStudio = dynamic(() => import('@/components/property/CostStudio'), { ssr: false, loading: () => <div className="skeleton h-80 rounded-xl" /> });
const LENSES: Lens[] = ['first-home', 'upgrading', 'nri', 'senior'];

const PAGE = 12;

type RailItem = { key: string; label: string; sub?: string; count: number; active: boolean; visual: React.ReactNode; onSelect: () => void };

// Filters the left rail and type chips don't already show, as removable chips.
function extraChips(s: ListingState, builders: Map<string, string> = new Map()): { key: string; label: string; patch: Partial<ListingState> }[] {
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
  s.dev.forEach((d) => chips.push({ key: `d-${d}`, label: builders.get(d) ?? d, patch: { dev: s.dev.filter((x) => x !== d) } }));
  s.ptype.forEach((t) => chips.push({ key: `t-${t}`, label: PROPERTY_TYPE_LABEL[t], patch: { ptype: s.ptype.filter((x) => x !== t) } }));
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
      <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 font-serif text-base text-ink-muted">
        {label.charAt(0)}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-surface-2">
      <Image src={property.media.cover.url} alt="" fill sizes="44px" quality={40} className="object-cover" />
    </span>
  );
}

function Rail({ items, back, label, tools }: { items: RailItem[]; back?: { label: string; onSelect: () => void }; label: string; tools?: React.ReactNode }) {
  return (
    <nav aria-label={label} className="no-scrollbar sticky top-[60px] h-[calc(100dvh-60px)] w-[88px] shrink-0 overflow-y-auto overscroll-contain border-r border-line pb-24 sm:w-[220px] lg:w-[260px] md:pb-6">
      <p className="hidden px-4 pb-1 pt-5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted sm:block">{label}</p>
      {back && (
        <button type="button" onClick={back.onSelect} className="flex min-h-[48px] w-full items-center justify-center gap-1.5 px-2 text-xs font-semibold text-accent-ink hover:text-ink sm:justify-start sm:px-4 sm:text-sm">
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="truncate">{back.label}</span>
        </button>
      )}
      <ul className="space-y-0.5 px-1.5 py-1 sm:px-2.5">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={item.onSelect}
              aria-current={item.active ? 'true' : undefined}
              className={`relative flex w-full flex-col items-center gap-1.5 rounded-[12px] px-1 py-2.5 text-center transition-colors duration-fast sm:flex-row sm:gap-3 sm:px-2 sm:text-left ${
                item.active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(var(--shadow)/0.08)] ring-1 ring-line' : 'text-ink-muted hover:bg-surface-2/70 hover:text-ink'
              }`}
            >
              {item.visual}
              <span className="min-w-0 flex-1">
                <span className={`block text-[11px] leading-tight sm:truncate sm:text-sm ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {item.sub && <span className="mt-0.5 hidden truncate text-xs text-ink-muted sm:block">{item.sub}</span>}
              </span>
              <span className={`tabular text-[10px] font-semibold sm:text-xs ${item.count ? '' : 'opacity-60'} ${item.active ? 'text-accent-ink' : ''}`}>{item.count}</span>
            </button>
          </li>
        ))}
      </ul>
      {tools && <div className="mx-4 hidden border-t border-line pb-4 pt-5 lg:block">{tools}</div>}
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

  // Personalisation signal (sent only with cookie consent): what this visitor is narrowing to.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!state.zone && !state.seg && !state.corridors.length && state.min == null && state.max == null) return;
      track('filter', {
        zone: state.zone || null,
        corridor: state.corridors.length === 1 ? state.corridors[0] : null,
        seg: state.seg || null,
        budget: state.max != null || state.min != null ? budgetBucket(state.max ?? state.min ?? 0) : null,
      });
    }, 900);
    return () => clearTimeout(t);
  }, [state.zone, state.seg, state.corridors, state.min, state.max]);

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
        visual: <Thumb property={sortListings(properties, 'relevance')[0]} label="All" />,
        onSelect: () => goZone(null),
      },
      ...liveZones(properties).map((z) => ({
        key: z.id,
        label: z.short,
        sub: z.areas,
        count: countWith({ zone: z.id, corridors: [], loc: '' }),
        active: false,
        visual: <Thumb property={sortListings(properties.filter((p) => zoneOfCorridor(p.corridorId) === z.id), 'relevance')[0]} label={z.short} />,
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
        visual: <Thumb property={sortListings(inZoneList, 'relevance')[0]} label={zone.short} />,
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
  const chips = extraChips(state, new Map(properties.map((p) => [p.developerId, p.developerName]))).filter((c) => !c.key.startsWith('l-') || state.lens.length > 1);
  const lensChips = LENSES.map((l) => ({ lens: l, count: countWith({ lens: [l] }) })).filter((l) => l.count > 0);
  const toggleApproval = (key: ListingState['approvals'][number]) =>
    update({ approvals: state.approvals.includes(key) ? state.approvals.filter((a) => a !== key) : [...state.approvals, key] });
  const benchmarkCorridor = area?.id ?? (singleArea ? zoneCorridors[0]?.id : undefined);
  const guide = placeGuide(zone?.id, benchmarkCorridor);
  const benchmark = benchmarkCorridor ? latestSnapshots(snapshots).find((s) => s.corridorId === benchmarkCorridor) : undefined;
  // With no match, or only one or two, offer the filters to relax that bring in more projects.
  const suggestions = results.length <= 2 ? relaxSuggestions(properties, state).filter((s) => s.count > results.length) : [];

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

  const askText = `Hi EstateNav, I'm looking for ${state.seg ? SEGMENT_NOUN[state.seg][1] : 'property'} in ${title} on EstateNav and couldn't find a match. Do you have anything coming up there?`;

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
              <legend className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-ink" strokeWidth={1.75} aria-hidden="true" /> RERA audit checklist
              </legend>
              <div className="mt-2 space-y-0.5">
                {APPROVAL_OPTIONS.map((o) => (
                  <label key={o.value} className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm">
                    <input type="checkbox" checked={state.approvals.includes(o.value)} onChange={() => toggleApproval(o.value)} className="h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
                    <span className="flex-1">{o.label}</span>
                    <span className="tabular text-xs text-ink-muted">{countWith({ approvals: Array.from(new Set([...state.approvals, o.value])) })}</span>
                  </label>
                ))}
                <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={state.verified} onChange={() => update({ verified: !state.verified })} className="h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
                  <span className="flex-1">K-RERA number shown</span>
                  <span className="tabular text-xs text-ink-muted">{countWith({ verified: true })}</span>
                </label>
              </div>
            </fieldset>
            <div className="space-y-2">
              <button type="button" onClick={() => setStudio(true)} className="btn-secondary min-h-[44px] w-full justify-start px-3">
                <Calculator className="h-4 w-4 text-accent-ink" strokeWidth={1.75} aria-hidden="true" /> Cost &amp; EMI studio
              </button>
              {compare.length > 0 && (
                <button type="button" onClick={() => compareSheetStore.set(true)} className="btn-secondary min-h-[44px] w-full justify-start px-3">
                  <GitCompareArrows className="h-4 w-4 text-accent-ink" strokeWidth={1.75} aria-hidden="true" /> Compare {compare.length} selected
                </button>
              )}
            </div>
          </div>
        }
      />

      <div ref={top} className="min-w-0 flex-1 scroll-mt-[60px] px-3 pb-28 pt-4 sm:px-5 sm:pt-6 lg:px-8 md:pb-20">
        {/* Headline on the left; on wide screens what's around the place fills the right. */}
        <div className="lg:flex lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
        <div className="hidden sm:block">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="flex items-start gap-2 sm:mt-1">
          {zone && (
            <button type="button" onClick={up} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface hover:border-ink/40 sm:hidden" aria-label="Go back one level">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-[1.6rem] leading-tight sm:text-[2.1rem] lg:text-[2.3rem]">{title}</h1>
            <p className="mt-1 truncate text-[13px] text-ink-muted sm:text-[0.95rem]" aria-live="polite">
              <strong className="text-ink">{results.length}</strong> {results.length === 1 ? one : many}
              {context ? ` · ${context}` : ''}
            </p>
            {benchmark && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                <span>
                  Benchmark <strong className="tabular font-mono text-ink">₹{Math.round(benchmark.avgPricePerSqft).toLocaleString('en-IN')}/sq.ft</strong>
                </span>
                <span className={`tabular inline-flex items-center font-mono ${benchmark.yoyChangePct >= 0 ? 'text-accent-ink' : 'text-danger'}`}>
                  {benchmark.yoyChangePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />}
                  {Math.abs(benchmark.yoyChangePct).toFixed(1)}% YoY
                </span>
                <span>· {benchmark.source}, {new Date(`${benchmark.asOf.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
              </p>
            )}
          </div>
          <label className="relative hidden w-56 shrink-0 self-center md:block lg:hidden">
            <span className="sr-only">Search in these results</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
            <input value={state.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search project or builder…" className="field min-h-[44px] pl-10 text-sm" />
          </label>
        </div>
        {guide && <p className="mt-2 hidden max-w-xl text-sm leading-snug text-ink-muted md:block lg:hidden">{guide.intro}</p>}
        </div>
        <PlaceSnapshot place={title} guide={guide} className="hidden w-[min(54%,42rem)] shrink-0 lg:block" />
        </div>

        {/* Toolbar: what kind of property, then budget, filters and sort. */}
        <div className="sticky top-[60px] z-20 -mx-3 mt-3 border-b border-line bg-bg/95 px-3 py-2.5 backdrop-blur-md sm:-mx-5 sm:mt-4 sm:px-5 lg:-mx-8 lg:px-8">
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
              <Select
                label="Budget"
                value={budgetId}
                options={[
                  ...(budgetId === 'custom' ? [{ value: 'custom', label: budgetSummary(state.min, state.max, false) }] : []),
                  ...SALE_BUDGET_CHOICES.map((b) => ({ value: b.id, label: b.label, count: countWith({ min: b.min, max: b.max }) })),
                ]}
                onChange={(id) => {
                  const b = SALE_BUDGET_CHOICES.find((x) => x.id === id);
                  if (b) update({ min: b.min, max: b.max });
                }}
                icon={<IndianRupee className="hidden h-4 w-4 text-accent-ink sm:block" aria-hidden="true" />}
                className="h-12 min-w-0 flex-1 gap-1.5 rounded-full border border-line bg-surface pl-4 pr-1.5 text-[13px] font-semibold sm:gap-2.5 hover:border-ink/40 data-[open=true]:border-ink sm:h-10 sm:w-52 sm:flex-none sm:text-sm"
              />
            )}
            <Select
              label="Sort by"
              value={state.sort}
              options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.value === 'relevance' ? 'Featured first' : o.label }))}
              onChange={(v) => update({ sort: v as ListingState['sort'] })}
              hideChevron
              align="end"
              menuWidth={230}
              display={
                <span className="flex items-center justify-center gap-2">
                  <ArrowDownUp className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span className="hidden sm:inline">{state.sort === 'relevance' ? 'Featured first' : SORT_OPTIONS.find((o) => o.value === state.sort)?.label}</span>
                </span>
              }
              className={`h-12 w-12 shrink-0 justify-center rounded-full border text-sm font-semibold sm:h-10 sm:w-auto sm:px-4 ${state.sort !== 'relevance' ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink hover:border-ink/40'}`}
            />
            <button
              type="button"
              onClick={() => setSheet(true)}
              className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors active:scale-[0.96] sm:h-10 sm:w-auto sm:px-4 ${chips.length ? 'bg-ink text-bg' : 'border border-line bg-surface text-ink hover:border-ink/40'}`}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">More filters</span>
              <span className="sr-only sm:hidden">Filters</span>
              {chips.length > 0 && <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] leading-[18px] text-accent-on sm:static sm:bg-bg/20 sm:px-1.5 sm:text-xs sm:text-bg">{chips.length}</span>}
            </button>
            <label className="relative ml-auto hidden w-64 shrink-0 lg:block xl:w-72">
              <span className="sr-only">Search in these results</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
              <input value={state.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search project or builder…" className="field min-h-[40px] rounded-full pl-10 text-sm" />
            </label>
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
            <span className="shrink-0 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">For</span>
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
                  <X className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
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

        <section id="listing-results" aria-label="Matching properties" className="mt-5 sm:mt-6">
          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-card border border-line bg-surface px-5 py-14 text-center sm:py-16">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                <Search className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-serif text-2xl sm:text-[2rem]">Nothing listed here yet</h2>
              <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-muted">Our advisor often knows of launches and resale units before they are listed. Ask, or widen the search.</p>
              {suggestions.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button key={s.label} type="button" onClick={() => update(s.patch, Boolean(s.patch.zone !== undefined || s.patch.corridors || s.patch.loc !== undefined))} className="chip text-sm active:scale-[0.96]">
                      {s.label} <span className="text-xs text-ink-muted">{s.count}</span>
                    </button>
                  ))}
                </div>
              )}
              <a href={whatsAppLink(askText)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 active:scale-[0.98]">
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> Connect with dedicated area advisor
              </a>
            </div>
          ) : (
            <ul data-testid="results" key={`${state.zone}|${state.corridors.join()}|${state.loc}|${state.seg}`} className="stagger grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p, i) => (
                <li key={p.id} style={{ '--i': Math.min(i, 8) } as React.CSSProperties} className={results.length === 1 ? 'col-span-2 sm:col-span-1' : undefined}>
                  <ExploreCard property={p} priority={i < 2} />
                </li>
              ))}
              {results.length <= 2 && (
                <li className={results.length === 1 ? 'col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-3' : 'col-span-2 lg:col-span-1 xl:col-span-2'}>
                  <div className="flex h-full flex-col justify-center rounded-card border border-dashed border-line-strong bg-surface/60 p-6 sm:p-8">
                    <p className="sheet-label">Only {results.length} {results.length === 1 ? one : many} here</p>
                    <h2 className="mt-2 font-serif text-[1.6rem] leading-tight">Want more options?</h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">Widen the search, or ask the advisor about launches and resale units that are not listed yet.</p>
                    {suggestions.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                          <button key={s.label} type="button" onClick={() => update(s.patch, Boolean(s.patch.zone !== undefined || s.patch.corridors || s.patch.loc !== undefined))} className="chip active:scale-[0.96]">
                            {s.label} <span className="text-xs text-ink-muted">{s.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <a href={whatsAppLink(askText)} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5 self-start">
                      <MessageCircle className="h-4 w-4 text-accent-ink" strokeWidth={1.75} aria-hidden="true" /> Ask the area advisor
                    </a>
                  </div>
                </li>
              )}
            </ul>
          )}

          {results.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn-secondary">
                Show {Math.min(PAGE, results.length - limit)} more
              </button>
            </div>
          )}

          {!zone && results.length > 0 && comingSoonZones(properties).length > 0 && (
            <p className="mt-10 text-center text-sm text-ink-muted">
              {comingSoonZones(properties)
                .map((z) => z.name)
                .join(' and ')}{' '}
              coming soon.
            </p>
          )}
        </section>

        {zone && results.length > 0 && !area && !state.loc && zoneCorridors.length > 1 && (
          <p className="mt-6 flex items-center justify-center gap-1 text-xs text-ink-muted">
            Tip: pick an area on the left to see its locations <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
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
