'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Corridor, Property } from '@/lib/data/types';
import { applyListing, DEFAULT_LISTING_STATE, serializeListingState, sortListings, type ListingState } from '@/lib/listingFilters';
import { matchesSegment } from '@/lib/property';
import { SALE_BUDGET_CHOICES } from '@/lib/categories';
import { heroSearchStore } from '@/lib/ui/stores';
import { QuickSearch } from '@/components/explore/QuickSearch';
import { HeroCarousel } from './HeroCarousel';

type Seg = 'residential' | 'plot' | 'commercial';
type Choice = { id: string; label: string; patch: Partial<ListingState> };

// The state re-skin: one switch changes the headline, the second console field, the
// featured slides and the search hint, without a page reload.
const SEGMENTS: Record<Seg, { tab: string; noun: [string, string]; headline: string; sub: string; placeholder: string; fieldLabel: string; choices: Choice[] }> = {
  residential: {
    tab: 'Residential',
    noun: ['home', 'homes'],
    headline: 'Verified homes across Bengaluru’s growth corridors.',
    sub: 'Direct developer pricing, zero buyer brokerage and K-RERA details you can check yourself.',
    placeholder: 'Micro-market or project, e.g. Whitefield',
    fieldLabel: 'Budget',
    choices: SALE_BUDGET_CHOICES.map((b) => ({ id: b.id, label: b.label, patch: { min: b.min, max: b.max } })),
  },
  plot: {
    tab: 'Plots',
    noun: ['plot', 'plots'],
    headline: 'Plots with the paperwork in view.',
    sub: 'Gated layouts on the Sarjapur and Whitefield belts, with approval and title details shown wherever we hold them.',
    placeholder: 'Plotted belt or layout, e.g. Sarjapur',
    fieldLabel: 'Plot size',
    choices: [
      { id: 'any', label: 'Any plot size', patch: { sizeMin: null } },
      { id: '1200', label: '1,200 sq.ft +', patch: { sizeMin: 1200 } },
      { id: '1500', label: '1,500 sq.ft +', patch: { sizeMin: 1500 } },
      { id: '1800', label: '1,800 sq.ft +', patch: { sizeMin: 1800 } },
    ],
  },
  commercial: {
    tab: 'Commercial',
    noun: ['workspace', 'workspaces'],
    headline: 'Workspaces on the city’s tech corridors.',
    sub: 'Warm-shell floors and managed suites on Outer Ring Road and North Bengaluru, leased on direct terms.',
    placeholder: 'Tech corridor, e.g. Outer Ring Road',
    fieldLabel: 'Monthly rent',
    choices: [
      { id: 'any', label: 'Any monthly rent', patch: { min: null, max: null } },
      { id: 'u10', label: 'Under ₹10 L / month', patch: { min: null, max: 1_000_000 } },
      { id: '10-25', label: '₹10 – 25 L / month', patch: { min: 1_000_000, max: 2_500_000 } },
      { id: '25+', label: '₹25 L + / month', patch: { min: 2_500_000, max: null } },
    ],
  },
};
const SEG_IDS = Object.keys(SEGMENTS) as Seg[];

export function HomeHero({ properties, corridors, partnerDeveloper }: { properties: Property[]; corridors: Corridor[]; partnerDeveloper: string }) {
  const router = useRouter();
  const [seg, setSeg] = useState<Seg>('residential');
  const [choice, setChoice] = useState('any');
  const [query, setQuery] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const copy = SEGMENTS[seg];
  const picked = copy.choices.find((c) => c.id === choice) ?? copy.choices[0];

  const featured = useMemo(() => sortListings(properties.filter((p) => p.featured), 'relevance'), [properties]);
  const slides = useMemo(() => {
    const inSeg = featured.filter((p) => matchesSegment(p, seg));
    return (inSeg.length ? inSeg : featured).slice(0, 6);
  }, [featured, seg]);

  const filters: ListingState = { ...DEFAULT_LISTING_STATE, seg, q: query.trim(), ...picked.patch };
  const count = applyListing(properties, filters).length;
  const params = Object.fromEntries(new URLSearchParams(serializeListingState({ ...filters, q: '' })));

  const changeSeg = (next: Seg) => {
    setSeg(next);
    setChoice('any');
    const url = new URL(window.location.href);
    if (next === 'residential') url.searchParams.delete('seg');
    else url.searchParams.set('seg', next);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  // ?seg= links open the matching state; read after hydration so the server render stays stable.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('seg');
    if (fromUrl && (SEG_IDS as string[]).includes(fromUrl)) setSeg(fromUrl as Seg);
  }, []);

  useEffect(() => {
    heroSearchStore.set((s) => ({ ...s, summary: 'Search a region, area or project' }));
    const el = consoleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => heroSearchStore.set((s) => ({ ...s, visible: entry.isIntersecting || entry.boundingClientRect.top > 0 })), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      heroSearchStore.set((s) => ({ ...s, visible: true }));
    };
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="mx-auto grid max-w-container gap-8 px-4 pt-5 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-10 lg:px-8 lg:pt-8">
        {/* Left console (40%) */}
        <div className="min-w-0">
          <div role="tablist" aria-label="Property segment" className="inline-flex w-full rounded-full border border-line bg-surface p-1 sm:w-auto">
            {SEG_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={seg === id}
                onClick={() => changeSeg(id)}
                className={`min-h-[48px] flex-1 rounded-full px-4 text-sm font-semibold transition-colors duration-base sm:flex-none sm:px-5 ${seg === id ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink'}`}
              >
                {SEGMENTS[id].tab}
              </button>
            ))}
          </div>

          <div key={seg} className={`mt-5 ${seg === 'residential' ? '' : 'animate-fade-up'}`}>
            <h1 id="hero-title" className="font-serif text-[2rem] leading-[1.08] sm:text-4xl">{copy.headline}</h1>
            <p className="mt-3 max-w-xl text-base text-ink-muted">{copy.sub}</p>
          </div>

          <div ref={consoleRef} className="relative z-30 mt-6 rounded-2xl border border-line bg-surface p-3 shadow-[0_18px_40px_-28px_rgb(var(--shadow)/0.55)]">
            <QuickSearch id="hero-search-input" properties={properties} corridors={corridors} placeholder={copy.placeholder} params={params} value={query} onValueChange={setQuery} />
            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block">
                <span className="sr-only">{copy.fieldLabel}</span>
                <select value={picked.id} onChange={(e) => setChoice(e.target.value)} className="field min-h-[52px] rounded-2xl font-medium">
                  {copy.choices.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => router.push(`/properties?${serializeListingState(filters)}`)}
                className="btn-primary min-h-[52px] rounded-2xl px-6"
              >
                Show {count} {count === 1 ? copy.noun[0] : copy.noun[1]} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <a href="#partner" className="group mt-4 inline-flex min-h-[48px] items-center gap-2 text-sm text-ink-muted hover:text-ink">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>
              Partner Developer: <strong className="font-semibold text-ink">{partnerDeveloper}</strong>
            </span>
            <ArrowDown className="h-4 w-4 shrink-0 text-accent-ink transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        </div>

        {/* Right spotlight (60%) */}
        <div className="min-w-0">
          <div key={seg} className={seg === 'residential' ? '' : 'animate-fade-up'}>
            {slides.length > 0 && <HeroCarousel slides={slides} label={`Featured ${copy.tab.toLowerCase()} projects`} contained />}
          </div>
        </div>
      </div>
    </section>
  );
}
