'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Check, IndianRupee, Ruler, Sparkles } from 'lucide-react';
import type { Corridor, Property } from '@/lib/data/types';
import { applyListing, DEFAULT_LISTING_STATE, serializeListingState, sortListings, type ListingState } from '@/lib/listingFilters';
import { matchesSegment } from '@/lib/property';
import { SALE_BUDGET_CHOICES } from '@/lib/categories';
import { useReducedMotionPreference } from '@/lib/ui/hooks';
import { conciergeStore } from '@/lib/ui/visitor';
import { QuickSearch } from '@/components/explore/QuickSearch';
import { Select } from '@/components/ui/Select';
import { NeedIcon, type NeedIconName } from '@/components/icons/NeedIcons';
import { startNavProgress } from '@/components/ui/NavProgress';
import { HeroShowcase } from './HeroShowcase';

type Seg = 'residential' | 'plot' | 'commercial';
type Choice = { id: string; label: string; patch: Partial<ListingState> };

const SLIDE_MS = 6500;

// One switch re-skins the hero: headline, search hint, the second field and the spotlight.
// Until the visitor picks a segment (or starts searching) it cycles on its own:
// Residential → Plots → Commercial, one project at a time.
const SEGMENTS: Record<Seg, { tab: string; icon: NeedIconName; noun: [string, string]; headline: [string, string]; sub: string; placeholder: string; fieldLabel: string; choices: Choice[] }> = {
  residential: {
    tab: 'Residential',
    icon: 'apartment',
    noun: ['home', 'homes'],
    headline: ['Verified homes across', 'Bengaluru’s growth corridors.'],
    sub: 'Direct developer pricing, zero buyer brokerage and K-RERA details you can check yourself.',
    placeholder: 'Micro-market or project, e.g. Whitefield…',
    fieldLabel: 'Budget',
    choices: SALE_BUDGET_CHOICES.map((b) => ({ id: b.id, label: b.label, patch: { min: b.min, max: b.max } })),
  },
  plot: {
    tab: 'Plots',
    icon: 'plot',
    noun: ['plot', 'plots'],
    headline: ['Plots with the', 'paperwork in view.'],
    sub: 'Gated layouts on the Sarjapur and Whitefield belts, with approval and title details shown wherever we hold them.',
    placeholder: 'Plotted belt or layout, e.g. Sarjapur…',
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
    icon: 'office',
    noun: ['workspace', 'workspaces'],
    headline: ['Workspaces on the', 'city’s tech corridors.'],
    sub: 'Warm-shell floors and managed suites on Outer Ring Road and North Bengaluru, leased on direct terms.',
    placeholder: 'Tech corridor, e.g. Outer Ring Road…',
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

export function HomeHero({ properties, corridors }: { properties: Property[]; corridors: Corridor[] }) {
  const router = useRouter();
  const reduced = useReducedMotionPreference();
  const [seg, setSeg] = useState<Seg>('residential');
  const [choice, setChoice] = useState('any');
  const [query, setQuery] = useState('');
  const [locked, setLocked] = useState(false);
  const [cursor, setCursor] = useState<Record<Seg, number>>({ residential: 0, plot: 0, commercial: 0 });
  const [dir, setDir] = useState<1 | -1>(1);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const copy = SEGMENTS[seg];
  const lead = copy.headline[0].split(' ');
  const words = [...lead, ...copy.headline[1].split(' ')];

  const bySeg = useMemo(() => {
    const featured = sortListings(properties.filter((p) => p.featured), 'relevance');
    const out = {} as Record<Seg, Property[]>;
    for (const id of SEG_IDS) {
      const own = featured.filter((p) => matchesSegment(p, id));
      out[id] = (own.length ? own : sortListings(properties.filter((p) => matchesSegment(p, id)), 'relevance')).slice(0, 6);
    }
    return out;
  }, [properties]);
  const cycle = SEG_IDS.filter((id) => bySeg[id].length > 0);
  const all = useMemo(() => Array.from(new Map(SEG_IDS.flatMap((id) => bySeg[id]).map((p) => [p.id, p])).values()), [bySeg]);
  const slides = bySeg[seg];
  const index = slides.length ? cursor[seg] % slides.length : 0;
  const nextSeg = cycle[(cycle.indexOf(seg) + 1) % Math.max(1, cycle.length)] ?? seg;
  const upcoming = locked || cycle.length < 2 ? slides[(index + 1) % Math.max(1, slides.length)] : bySeg[nextSeg][cursor[nextSeg] % Math.max(1, bySeg[nextSeg].length)];
  const running = !paused && !hold && !hiddenTab && onScreen && !reduced && (locked ? slides.length > 1 : cycle.length > 1 || slides.length > 1);

  // Sliding indicator behind the active segment tab.
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[SEG_IDS.indexOf(seg)];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [seg]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('seg');
    if (fromUrl && (SEG_IDS as string[]).includes(fromUrl)) {
      setSeg(fromUrl as Seg);
      setLocked(true);
    }
    const visibility = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    // Nothing cycles (or re-renders) while the visitor is further down the page.
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.15 });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      io.disconnect();
    };
  }, []);

  const advance = () => {
    setDir(1);
    if (!locked && cycle.length > 1) {
      setCursor((c) => ({ ...c, [seg]: c[seg] + 1 }));
      setSeg(nextSeg);
      setChoice('any');
    } else {
      setCursor((c) => ({ ...c, [seg]: c[seg] + 1 }));
    }
    setTick((t) => t + 1);
  };
  const step = (d: 1 | -1) => {
    setDir(d);
    setCursor((c) => ({ ...c, [seg]: c[seg] + d + slides.length }));
    setTick((t) => t + 1);
  };
  const pick = (i: number) => {
    if (i === index) return;
    setDir(i > index ? 1 : -1);
    setCursor((c) => ({ ...c, [seg]: c[seg] - index + i }));
    setTick((t) => t + 1);
  };
  const chooseSeg = (next: Seg) => {
    setLocked(true);
    if (next === seg) return;
    setDir(SEG_IDS.indexOf(next) > SEG_IDS.indexOf(seg) ? 1 : -1);
    setSeg(next);
    setChoice('any');
    setTick((t) => t + 1);
    const url = new URL(window.location.href);
    if (next === 'residential') url.searchParams.delete('seg');
    else url.searchParams.set('seg', next);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const picked = copy.choices.find((c) => c.id === choice) ?? copy.choices[0];
  const filters: ListingState = { ...DEFAULT_LISTING_STATE, seg, q: query.trim(), ...picked.patch };
  const count = applyListing(properties, filters).length;
  const params = Object.fromEntries(new URLSearchParams(serializeListingState({ ...filters, q: '' })));
  const options = copy.choices.map((c) => ({ value: c.id, label: c.label, count: applyListing(properties, { ...DEFAULT_LISTING_STATE, seg, q: query.trim(), ...c.patch }).length }));
  const timerKey = `${seg}-${index}-${tick}`;

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" data-scrub="exit" data-scrub-span="0.8" className="relative isolate z-10 overflow-x-clip border-b border-line">
      <div className={`mx-auto grid max-w-container gap-8 px-4 pb-8 pt-5 sm:px-6 sm:pt-8 ${all.length ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'lg:max-w-3xl'} lg:items-center lg:gap-12 lg:px-8 lg:pb-12 lg:pt-10`}>
        <div className="sc-hero-copy relative z-20 min-w-0">
          <p className="rise-in hidden text-sm font-medium text-ink-muted sm:block">Bengaluru&apos;s verified property desk</p>

          {/* All three headlines share one grid cell, so switching never shifts the page. */}
          <div className="grid sm:mt-3 [&>*]:[grid-area:1/1]">
            {SEG_IDS.map((id) =>
              id === seg ? (
                <h1 key={seg} id="hero-title" className="hero-accent font-serif text-[2rem] leading-[1.06] tracking-[-0.02em] sm:text-[2.6rem] lg:text-[2.75rem] xl:text-[3.1rem]">
                  {words.map((w, i) => (
                    <span key={`${seg}-${i}`}>
                      <span className="word-mask">
                        <span style={{ '--i': i } as CSSProperties} className={i >= lead.length ? 'text-accent-ink' : undefined}>{w}</span>
                      </span>{' '}
                    </span>
                  ))}
                </h1>
              ) : (
                <p key={id} aria-hidden="true" className="invisible font-serif text-[2rem] leading-[1.06] tracking-[-0.02em] sm:text-[2.6rem] lg:text-[2.75rem] xl:text-[3.1rem]">
                  {SEGMENTS[id].headline.join(' ')}
                </p>
              ),
            )}
          </div>
          <div className="mt-3 hidden max-w-md sm:grid [&>*]:[grid-area:1/1]">
            {SEG_IDS.map((id) => (
              <p key={id === seg ? `${seg}-sub` : id} aria-hidden={id !== seg || undefined} className={`text-[1.0625rem] leading-relaxed text-ink-muted ${id === seg ? 'rise-in' : 'invisible'}`} style={{ '--d': '380ms' } as CSSProperties}>
                {SEGMENTS[id].sub}
              </p>
            ))}
          </div>

          <div className="rise-in mt-5 sm:mt-6" style={{ '--d': '480ms' } as CSSProperties}>
            <div role="tablist" aria-label="Property segment" className="relative flex w-full rounded-[14px] bg-surface-2 p-1 sm:inline-flex sm:w-auto">
              <span aria-hidden="true" className="absolute top-1 h-[calc(100%-8px)] overflow-hidden rounded-[10px] bg-surface shadow-[0_1px_2px_rgb(var(--shadow)/0.12),0_6px_16px_-8px_rgb(var(--shadow)/0.35)] transition-[transform,width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: pill.w, transform: `translateX(${pill.x - 4}px)`, left: 4 }}>
                {!locked && !reduced && <span key={timerKey} className="timer-fill absolute inset-x-0 bottom-0 h-[3px] bg-brass" style={{ '--dur': `${SLIDE_MS}ms`, animationPlayState: running ? 'running' : 'paused' } as CSSProperties} />}
              </span>
              {SEG_IDS.map((id, i) => (
                <button
                  key={id}
                  ref={(node) => {
                    tabRefs.current[i] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={seg === id}
                  onClick={() => chooseSeg(id)}
                  className={`relative z-10 inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors duration-slow sm:flex-none sm:px-5 ${seg === id ? (pill.w ? 'text-ink' : 'bg-surface text-ink') : 'text-ink-muted hover:text-ink'}`}
                >
                  <NeedIcon name={SEGMENTS[id].icon} className="hidden h-[18px] w-[18px] sm:block" />
                  {SEGMENTS[id].tab}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rise-in relative z-30 mt-3 rounded-[16px] border border-line bg-surface p-2 shadow-[0_30px_60px_-40px_rgb(var(--shadow)/0.55)] transition-[box-shadow,border-color] duration-slow focus-within:border-accent-ink/40 focus-within:shadow-[0_30px_70px_-36px_rgb(var(--accent)/0.45)]"
            style={{ '--d': '580ms' } as CSSProperties}
            onFocusCapture={() => setLocked(true)}
          >
            <QuickSearch id="hero-search-input" properties={properties} corridors={corridors} placeholder={copy.placeholder} params={params} value={query} onValueChange={setQuery} />
            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Select
                label={copy.fieldLabel}
                caption={copy.fieldLabel}
                value={picked.id}
                options={options}
                onChange={setChoice}
                icon={
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink">
                    {seg === 'plot' ? <Ruler className="h-4 w-4" aria-hidden="true" /> : <IndianRupee className="h-4 w-4" aria-hidden="true" />}
                  </span>
                }
                className="min-h-[48px] rounded-[12px] border border-transparent bg-surface-2 px-3 text-[0.95rem] font-semibold hover:border-line data-[open=true]:border-accent-ink data-[open=true]:bg-surface"
              />
              <button
                type="button"
                onClick={() => {
                  startNavProgress();
                  router.push(`/properties?${serializeListingState(filters)}`);
                }}
                className="btn-primary min-h-[48px] rounded-[12px] px-6"
              >
                Show {count} {count === 1 ? copy.noun[0] : copy.noun[1]}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <ul className="rise-in mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted sm:mt-5 sm:gap-x-6 sm:gap-y-2 sm:text-sm" style={{ '--d': '680ms' } as CSSProperties}>
            {['K-RERA details on every project', 'Zero buyer brokerage', 'Developer’s own price list'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent-ink"><Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /></span> {t}
              </li>
            ))}
          </ul>
          <div className="rise-in mt-5 hidden flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 sm:flex" style={{ '--d': '780ms' } as CSSProperties}>
            <button
              type="button"
              onClick={() => conciergeStore.set(true)}
              className="arrow-host group inline-flex min-h-[44px] items-center gap-3 text-sm font-semibold text-ink"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest text-forest-on transition-transform duration-base group-hover:-translate-y-px">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="link-draw">Not sure where to start? Get matched in 30 seconds</span>
              <ArrowRight className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="sc-hero-media relative z-10 min-w-0">
          <div className="frame-in">
          <HeroShowcase
            all={all}
            slides={slides}
            index={index}
            dir={dir}
            segLabel={copy.tab}
            duration={SLIDE_MS}
            timerKey={timerKey}
            running={running}
            animate={!reduced}
            paused={paused}
            preload={upcoming ? [upcoming.id] : []}
            onAdvance={advance}
            onStep={step}
            onPick={pick}
            onHold={setHold}
            onTogglePause={() => setPaused((p) => !p)}
          />
          </div>
        </div>
      </div>
    </section>
  );
}
