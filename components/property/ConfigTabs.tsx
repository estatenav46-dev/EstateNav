'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import type { Property } from '@/lib/data/types';
import { formatINRRange, formatSqftRange } from '@/lib/price';
import { openLeadSheet } from '@/lib/ui/stores';

// One tab per configuration: carpet / super built-up, price and the floor plan.
export function ConfigTabs({ property }: { property: Property }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const configs = property.configurations;
  const config = configs[active];
  const plan = property.media.floorPlans.find((f) => f.id === config?.floorPlanImageId);
  const [zoomed, setZoomed] = useState(false);
  if (!config) return null;
  const plot = property.segment === 'plot';
  const rows = [
    [plot ? 'Plot area' : 'Carpet area', formatSqftRange(config.carpetSqftMin, config.carpetSqftMax)],
    ...(plot ? [] : [['Super built-up', formatSqftRange(config.superSqftMin, config.superSqftMax)]]),
    ['Price', config.priceMin ? formatINRRange(config.priceMin, config.priceMax, property.transaction === 'rent' ? ' /month' : '') : null],
  ] as const;

  return (
    <div>
      <div role="tablist" aria-label="Configurations" className="no-scrollbar flex gap-1.5 overflow-x-auto"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setActive((i) => (i + 1) % configs.length);
          if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + configs.length) % configs.length);
        }}
      >
        {configs.map((c, i) => (
          <button key={c.id} id={`${id}-tab-${i}`} type="button" role="tab" aria-selected={i === active} aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} className="chip shrink-0" data-active={i === active}>
            {c.label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <dl className="self-start divide-y divide-line rounded-card border border-line bg-surface">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className={`text-right ${value ? 'tabular font-serif text-lg' : 'text-sm text-ink-muted'}`}>{value ?? 'Ask advisor'}</dd>
            </div>
          ))}
        </dl>
        {plan ? (
          <button type="button" onClick={() => setZoomed((z) => !z)} className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface" aria-label={zoomed ? 'Zoom out of floor plan' : 'Zoom into floor plan'}>
            <Image src={plan.url} alt={plan.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain transition-transform duration-slow ease-out" style={{ transform: zoomed ? 'scale(1.8)' : 'none' }} />
          </button>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong bg-surface-2/60 p-6 text-center">
            <svg viewBox="0 0 120 80" className="h-16 w-24 text-ink-muted" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M6 6h108v68H6zM6 40h46M52 6v68M80 40h34M80 40v34M52 56h28" />
              <path d="M60 40a8 8 0 0 1 8-8" strokeDasharray="2 2" />
            </svg>
            <p className="text-sm text-ink-muted">The {config.label} floor plan is shared on request.</p>
            <button type="button" onClick={() => openLeadSheet('price-sheet', `Please send the ${config.label} floor plan and price sheet for ${property.title}.`)} className="btn-secondary min-h-[44px]">
              Get floor plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
