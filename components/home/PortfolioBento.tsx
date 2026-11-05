'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useFlip } from '@/lib/ui/useFlip';

const LENSES = [
  { id: 'all', label: 'All', test: () => true, href: '/properties' },
  { id: 'first-home', label: 'First home', test: (p: Property) => p.lenses.includes('first-home'), href: '/properties?lens=first-home' },
  { id: 'upgrading', label: 'Upgrading', test: (p: Property) => p.lenses.includes('upgrading'), href: '/properties?lens=upgrading' },
  { id: 'nri', label: 'NRI portfolio', test: (p: Property) => p.lenses.includes('nri'), href: '/properties?lens=nri' },
  { id: 'ready', label: 'Ready to move', test: (p: Property) => p.possession.status === 'ready', href: '/properties?pos=ready' },
  { id: 'plots', label: 'Plots', test: (p: Property) => p.segment === 'plot', href: '/properties?seg=plot' },
] as const;

// Bento: one 2×2 feature card and four standard cards, re-filtered by buyer "lens" in place.
export function PortfolioBento({ properties }: { properties: Property[] }) {
  const [lens, setLens] = useState<(typeof LENSES)[number]['id']>('all');
  const grid = useRef<HTMLUListElement>(null);
  const active = LENSES.find((l) => l.id === lens)!;
  const items = useMemo(() => properties.filter(active.test).slice(0, 5), [properties, active]);
  const total = useMemo(() => properties.filter(active.test).length, [properties, active]);
  useFlip(grid, `${lens}:${items.map((p) => p.id).join(',')}`);

  return (
    <section aria-labelledby="portfolio-title" className="mx-auto mt-24 max-w-container px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sheet-label">Sheet A-03 · Featured portfolio</p>
          <h2 id="portfolio-title" className="mt-2 font-serif text-2xl sm:text-3xl">Shortlist-ready projects</h2>
        </div>
        <Link href={active.href} className="inline-flex min-h-[48px] items-center gap-1.5 text-sm text-accent-ink hover:underline">
          See all {total} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Buyer lens">
        {LENSES.map((l) => (
          <button key={l.id} type="button" aria-pressed={lens === l.id} onClick={() => setLens(l.id)} className="chip shrink-0">
            {l.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{`${total} projects match ${active.label}`}</p>
      <ul ref={grid} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((property, i) => (
          <li key={property.id} data-flip-id={property.id} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}>
            <PropertyCard property={property} variant={i === 0 ? 'feature' : 'grid'} sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'} />
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="panel mt-6 px-5 py-8 text-ink-muted">Nothing under this lens right now — the advisor can tell you what is coming.</p>}
    </section>
  );
}
