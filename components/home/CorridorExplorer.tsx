'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Map as MapIcon } from 'lucide-react';
import type { Corridor, MarketSnapshot, Property } from '@/lib/data/types';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Skyline } from '@/components/map/Skyline';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { formatINR } from '@/lib/price';

const CorridorMap = dynamic(() => import('@/components/map/CorridorMap').then((m) => m.CorridorMap), {
  ssr: false,
  loading: () => <div className="skeleton aspect-[440/470] w-full rounded-card" />,
});

function CorridorCard({ corridor, count }: { corridor: Corridor; count: number }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-line">
      <div className="relative h-36 bg-accent">
        {corridor.heroImage && (
          <Image src={corridor.heroImage.url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={corridor.heroImage.blurDataURL} className="object-cover opacity-70 mix-blend-luminosity grayscale" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-scrim/70 to-transparent" aria-hidden="true" />
        <Skyline corridor={corridor.svgPathId} className="absolute inset-x-0 bottom-0 h-14 w-full text-white/80" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <p className="font-serif text-2xl leading-none">{corridor.name}</p>
          <p className="shrink-0 font-mono text-2xs">{count} {count === 1 ? 'project' : 'projects'}</p>
        </div>
      </div>
      <p className="bg-surface px-4 py-3 text-sm text-ink-muted">{corridor.description}</p>
    </div>
  );
}

// Map on the left, a live-filtered rail of projects on the right. The corridor stats strip
// renders only when sourced market snapshots exist.
export function CorridorExplorer({ corridors, properties, snapshots }: { corridors: Corridor[]; properties: Property[]; snapshots: MarketSnapshot[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mapSheet, setMapSheet] = useState(false);
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const corridor = corridors.find((c) => c.id === selected) ?? null;
  const visible = useMemo(() => properties.filter((p) => !selected || p.corridorId === selected), [properties, selected]);
  const counts = useMemo(() => Object.fromEntries(corridors.map((c) => [c.id, properties.filter((p) => p.corridorId === c.id).length])), [corridors, properties]);
  const snapshot = snapshots.find((s) => s.corridorId === selected);

  const map = near ? <CorridorMap corridors={corridors} properties={properties} selected={selected} onSelect={setSelected} /> : <div className="skeleton aspect-[440/470] w-full rounded-card" />;

  return (
    <section ref={sectionRef} id="corridors" aria-labelledby="corridors-title" className="mx-auto mt-20 max-w-container scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sheet-label">Sheet A-02 · Corridors</p>
          <h2 id="corridors-title" className="mt-2 font-serif text-2xl sm:text-3xl">Explore by corridor</h2>
          <p className="mt-2 max-w-xl text-ink-muted">Pick a corridor on the map to see what we list there. Every project carries its K-RERA number.</p>
        </div>
        <Link href={selected ? `/properties?corridor=${selected}` : '/properties'} className="btn-secondary">
          {selected ? `All ${counts[selected] ?? 0} in ${corridor?.name}` : 'All listings'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:hidden" role="group" aria-label="Corridors">
        <button type="button" className="chip shrink-0" aria-pressed={!selected} onClick={() => setSelected(null)}>All</button>
        {corridors.map((c) => (
          <button key={c.id} type="button" className="chip shrink-0" aria-pressed={selected === c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}>
            {c.name} <span className="font-mono text-2xs text-ink-muted">{counts[c.id] ?? 0}</span>
          </button>
        ))}
        <button type="button" className="chip shrink-0" onClick={() => setMapSheet(true)}>
          <MapIcon className="h-4 w-4" aria-hidden="true" /> Map
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
        <div className="hidden lg:block">
          <div className="panel sticky top-24 p-4">{map}</div>
        </div>
        <div className="min-w-0 space-y-4">
          {corridor ? <CorridorCard corridor={corridor} count={counts[corridor.id] ?? 0} /> : null}
          {snapshot && (
            <div className="panel flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm">
              <span>Avg {formatINR(snapshot.avgPricePerSqft)}/sq.ft</span>
              <span>{snapshot.yoyChangePct > 0 ? '+' : ''}{snapshot.yoyChangePct}% YoY</span>
              <span className="text-2xs text-ink-muted">Source: {snapshot.source} · as of {snapshot.asOf}</span>
            </div>
          )}
          {visible.length ? (
            <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0" aria-label={corridor ? `Projects on ${corridor.name}` : 'All projects'}>
              {visible.map((property) => (
                <li key={property.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] xl:w-[44%]">
                  <PropertyCard property={property} sizes="(min-width: 1280px) 26vw, (min-width: 640px) 46vw, 82vw" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel px-5 py-8 text-ink-muted">Nothing listed on {corridor?.name} yet. Ask the advisor about upcoming launches here.</p>
          )}
        </div>
      </div>

      <Sheet open={mapSheet} onOpenChange={setMapSheet} title="Corridor map" description="Tap a corridor to filter the projects." fullHeight>
        {mapSheet && <CorridorMap corridors={corridors} properties={properties} selected={selected} onSelect={(id) => { setSelected(id); setMapSheet(false); }} />}
      </Sheet>
    </section>
  );
}
