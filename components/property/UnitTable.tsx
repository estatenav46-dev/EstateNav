'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Maximize2 } from 'lucide-react';
import type { Configuration, Property } from '@/lib/data/types';
import { formatINRRange, formatSqftRange } from '@/lib/price';
import { bhkLabel } from '@/lib/property';
import { openLeadSheet } from '@/lib/ui/stores';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

const AVAILABILITY: Record<NonNullable<Configuration['availability']>, { label: string; className: string } | null> = {
  available: null,
  limited: { label: 'Few left', className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300' },
  'sold-out': { label: 'Sold out', className: 'bg-ink/10 text-ink-muted' },
};

// Every configuration in one table: sizes, price (or "on request") and its floor plan.
export function UnitTable({ property }: { property: Property }) {
  const plot = property.segment === 'plot';
  const rent = property.transaction === 'rent';
  const plans = property.media.floorPlans;
  const [viewer, setViewer] = useState<number | null>(null);
  const tabs = useMemo(() => {
    const bhks = Array.from(new Set(property.configurations.map((c) => c.bhk).filter((b): b is number => b != null))).sort((a, b) => a - b);
    return bhks.length > 1 ? bhks : [];
  }, [property.configurations]);
  const [tab, setTab] = useState<number | 'all'>('all');
  const rows = property.configurations.filter((c) => tab === 'all' || c.bhk === tab);
  const showSuper = !plot && property.configurations.some((c) => c.superSqftMin != null);
  const showBaths = property.configurations.some((c) => c.bathrooms);

  const price = (c: Configuration) => {
    if (property.priceOnRequest || !c.priceMin) return null;
    return formatINRRange(c.priceMin, c.priceMax, rent ? ' /month' : '');
  };
  const ask = (c: Configuration) => openLeadSheet('price-sheet', `Please share the price and floor plan for the ${c.label} at ${property.title}.`);

  return (
    <div>
      {tabs.length > 0 && (
        <div role="tablist" aria-label="Filter by BHK" className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
          <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')} className="chip shrink-0" data-active={tab === 'all'}>
            All ({property.configurations.length})
          </button>
          {tabs.map((b) => (
            <button key={b} type="button" role="tab" aria-selected={tab === b} onClick={() => setTab(b)} className="chip shrink-0" data-active={tab === b}>
              {bhkLabel(b)}
            </button>
          ))}
        </div>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        <li aria-hidden="true" className={`hidden gap-4 bg-surface-2/60 px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-ink-muted md:grid ${showSuper ? 'md:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1.1fr_96px]' : 'md:grid-cols-[minmax(0,1.3fr)_1.4fr_1.1fr_96px]'}`}>
          <span>Unit</span>
          <span>{plot ? 'Plot area' : 'Carpet area'}</span>
          {showSuper && <span>Super built-up</span>}
          <span>{rent ? 'Rent' : 'Price'}</span>
          <span className="text-right">Floor plan</span>
        </li>
        {rows.map((c) => {
          const planIndex = plans.findIndex((p) => p.id === c.floorPlanImageId);
          const plan = planIndex >= 0 ? plans[planIndex] : null;
          const badge = c.availability ? AVAILABILITY[c.availability] : null;
          const value = price(c);
          const area = formatSqftRange(c.carpetSqftMin, c.carpetSqftMax);
          return (
            <li key={c.id} className={`grid grid-cols-[minmax(0,1fr)_88px] gap-x-4 gap-y-1 px-4 py-3.5 md:items-center ${showSuper ? 'md:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1.1fr_96px]' : 'md:grid-cols-[minmax(0,1.3fr)_1.4fr_1.1fr_96px]'}`}>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {c.label}
                  {badge && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>{badge.label}</span>}
                </p>
                <p className="text-xs text-ink-muted">{[showBaths && c.bathrooms ? `${c.bathrooms} bath` : null, c.dimensions, c.notes].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="col-start-1 text-sm md:col-start-auto">
                <span className="text-xs text-ink-muted md:hidden">{plot ? 'Plot ' : 'Carpet '}</span>
                <span className="tabular">{area ?? <span className="text-ink-muted">Ask advisor</span>}</span>
              </div>
              {showSuper && (
                <div className="col-start-1 text-sm md:col-start-auto">
                  <span className="text-xs text-ink-muted md:hidden">Super built-up </span>
                  <span className="tabular">{formatSqftRange(c.superSqftMin, c.superSqftMax) ?? '—'}</span>
                </div>
              )}
              <div className="col-start-1 md:col-start-auto">
                {value ? (
                  <span className="tabular font-serif text-lg">
                    {value}
                    <sup className="ml-0.5 text-xs text-brass">*</sup>
                  </span>
                ) : (
                  <button type="button" onClick={() => ask(c)} className="text-sm font-semibold text-accent-ink hover:underline">
                    {c.availability === 'sold-out' ? 'Ask for resale' : 'Price on request'}
                  </button>
                )}
              </div>
              <div className="col-start-2 row-span-4 row-start-1 flex justify-end md:col-start-auto md:row-span-1 md:row-start-auto">
                {plan ? (
                  <button type="button" onClick={() => setViewer(planIndex)} className="group relative h-16 w-[88px] overflow-hidden rounded-lg border border-line bg-white" aria-label={`View the ${c.label} floor plan`}>
                    <Image src={plan.url} alt="" fill sizes="96px" className="object-contain" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                      <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                ) : (
                  <button type="button" onClick={() => ask(c)} className="inline-flex h-16 w-[88px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-[11px] font-medium text-ink-muted hover:border-accent hover:text-accent-ink">
                    <FileText className="h-4 w-4" aria-hidden="true" /> Get plan
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-2xs text-ink-muted">
        *Approximate developer guide prices{property.priceNote ? ` (${property.priceNote})` : ''}; final price depends on unit, floor and current offers. Areas as stated by the developer.
      </p>
      {viewer !== null && createPortal(<Lightbox images={plans} start={viewer} title={`${property.title} floor plans`} onClose={() => setViewer(null)} />, document.body)}
    </div>
  );
}
