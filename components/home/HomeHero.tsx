'use client';

import { AnimatePresence, m } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { Corridor, Property, SearchSegment } from '@/lib/data/types';
import { matchesSegment, SEGMENT_LABEL } from '@/lib/property';
import { heroSearchStore } from '@/lib/ui/stores';
import { HeroCarousel } from './HeroCarousel';
import { SearchConsole } from '@/components/search/SearchConsole';
import { MobileSearchSheet } from '@/components/search/MobileSearchSheet';
import { buildSuggestions } from '@/components/search/LocalityAutocomplete';
import { useHeroSearch } from '@/components/search/useHeroSearch';

const SEGMENTS: { id: SearchSegment; headline: string; sub: string }[] = [
  { id: 'residential', headline: 'Verified homes across Bengaluru’s growth corridors.', sub: 'Direct-developer pricing, zero buyer brokerage, and RERA details you can check yourself.' },
  { id: 'plot', headline: 'Plots with the paperwork in view.', sub: 'Gated layouts on the Sarjapur and Whitefield belts, with approval and title details shown wherever we hold them.' },
  { id: 'commercial', headline: 'Workspaces on the city’s office corridors.', sub: 'Warm-shell floors and managed suites on Outer Ring Road and North Bengaluru, leased on direct terms.' },
  { id: 'rent', headline: 'Leases without the broker layer.', sub: 'Rental listings on direct terms. Ask for availability and a walkthrough.' },
];

const isSegment = (value: string | null): value is SearchSegment => SEGMENTS.some((s) => s.id === value);

function SegmentSwitcher({ value, onChange, compact }: { value: SearchSegment; onChange: (s: SearchSegment) => void; compact?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ x: 0, w: 0 });
  const index = SEGMENTS.findIndex((s) => s.id === value);
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[index];
      if (el) setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [index]);

  return (
    <div role="tablist" aria-label="Property segment" className={`relative flex w-full rounded-full border border-line bg-surface p-1 sm:inline-flex sm:w-auto ${compact ? 'sm:w-full' : ''}`}>
      <span
        aria-hidden="true"
        className="absolute left-0 top-1 h-[calc(100%-8px)] w-[100px] origin-left rounded-full bg-ink transition-transform duration-base ease-out"
        style={{ transform: `translateX(${indicator.x}px) scaleX(${indicator.w / 100})` }}
      />
      {SEGMENTS.map((segment, i) => (
        <button
          key={segment.id}
          ref={(node) => {
            refs.current[i] = node;
          }}
          type="button"
          role="tab"
          aria-selected={value === segment.id}
          onClick={() => onChange(segment.id)}
          className={`relative z-10 min-h-[44px] flex-1 rounded-full px-2 text-sm transition-colors duration-base sm:flex-none sm:px-5 ${compact ? 'sm:flex-1' : ''} ${value === segment.id ? 'text-bg' : 'text-ink-muted hover:text-ink'}`}
        >
          {SEGMENT_LABEL[segment.id]}
        </button>
      ))}
    </div>
  );
}

function HeroInner({ properties, corridors, initialSeg }: { properties: Property[]; corridors: Corridor[]; initialSeg: SearchSegment }) {
  const [seg, setSeg] = useState<SearchSegment>(initialSeg);
  const [sheet, setSheet] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const search = useHeroSearch(properties, corridors, seg);
  const suggestions = useMemo(() => buildSuggestions(properties, corridors), [properties, corridors]);
  const copy = SEGMENTS.find((s) => s.id === seg)!;
  const slides = useMemo(() => properties.filter((p) => matchesSegment(p, seg)).slice(0, 6), [properties, seg]);

  const changeSeg = (next: SearchSegment) => {
    setSeg(next);
    const url = new URL(window.location.href);
    if (next === 'residential') url.searchParams.delete('seg');
    else url.searchParams.set('seg', next);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  // Read ?seg= after hydration so the server-rendered hero (and its LCP image) is never replaced.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('seg');
    if (isSegment(fromUrl) && fromUrl !== initialSeg) setSeg(fromUrl);
  }, [initialSeg]);

  useEffect(() => {
    heroSearchStore.set((s) => ({ ...s, summary: search.summary }));
  }, [search.summary]);

  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    // The header pill appears only once the console has scrolled up past the header.
    const io = new IntersectionObserver(([entry]) => heroSearchStore.set((s) => ({ ...s, visible: entry.isIntersecting || entry.boundingClientRect.top > 0 })), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      heroSearchStore.set((s) => ({ ...s, visible: true }));
    };
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="border-b border-line bg-surface-2/60 pb-20 pt-6 lg:pb-14">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="sheet-label">Sheet A-01 · Bengaluru advisory catalogue</p>
            <SegmentSwitcher value={seg} onChange={changeSeg} />
          </div>
          <div className="mt-5 grid max-w-4xl xl:max-w-none [&>*]:[grid-area:1/1]">
            <AnimatePresence initial={false}>
              <m.div key={seg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
                <h1 id="hero-title" className="font-serif text-3xl sm:text-4xl">
                  {copy.headline}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-ink-muted sm:text-lg">{copy.sub}</p>
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1720px]">
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={seg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
              {slides.length ? <HeroCarousel slides={slides} label={`Featured ${SEGMENT_LABEL[seg].toLowerCase()} projects`} /> : <p className="px-4 text-ink-muted">No featured projects in this segment yet.</p>}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      <div ref={consoleRef} className="relative z-20 mx-auto -mt-8 max-w-container px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block">
          <SearchConsole seg={seg} search={search} suggestions={suggestions} />
        </div>
        <button type="button" onClick={() => setSheet(true)} className="panel flex min-h-[56px] w-full items-center gap-3 px-4 text-left shadow-[0_18px_40px_-24px_rgb(var(--shadow)/0.5)] lg:hidden">
          <Search className="h-5 w-5 text-accent-ink" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-ink-muted">Search Sarjapur, Whitefield…</span>
          <span className="shrink-0 font-mono text-2xs text-ink-muted">{search.count} found</span>
        </button>
        <MobileSearchSheet open={sheet} onOpenChange={setSheet} seg={seg} search={search} suggestions={suggestions} segmentSwitcher={<SegmentSwitcher value={seg} onChange={changeSeg} compact />} />
      </div>
    </section>
  );
}

export function HomeHero({ properties, corridors }: { properties: Property[]; corridors: Corridor[] }) {
  return <HeroInner properties={properties} corridors={corridors} initialSeg="residential" />;
}
