'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bath, CalendarDays, FileText, Maximize2, Ruler, Table2 } from 'lucide-react';
import type { Configuration, Property } from '@/lib/data/types';
import { formatINR, formatINRRange, formatSqftRange } from '@/lib/price';
import { bhkLabel } from '@/lib/property';
import { openLeadSheet } from '@/lib/ui/stores';
import { UnitTable } from './UnitTable';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

type Group = { key: string; label: string; items: Configuration[] };

const AVAILABILITY: Record<NonNullable<Configuration['availability']>, string | null> = { available: null, limited: 'Few units left', 'sold-out': 'Sold out' };

/** Configurations grouped by BHK (or by name for plots, villas and offices). */
function groupConfigs(configs: Configuration[]): Group[] {
  const groups = new Map<string, Group>();
  for (const c of configs) {
    const key = c.bhk != null ? `bhk-${c.bhk}` : `l-${c.label.trim().toLowerCase()}`;
    const label = c.bhk != null ? bhkLabel(c.bhk) : c.label;
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key)!.items.push(c);
  }
  return Array.from(groups.values()).sort((a, b) => (a.items[0].bhk ?? 99) - (b.items[0].bhk ?? 99));
}

// BHK buttons; picking one shows its sizes, price, floor plan and the next step.
export function ConfigExplorer({ property }: { property: Property }) {
  const groups = useMemo(() => groupConfigs(property.configurations), [property.configurations]);
  const [g, setG] = useState(0);
  const [v, setV] = useState(0);
  const [table, setTable] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const plot = property.segment === 'plot';
  const rent = property.transaction === 'rent';
  const hidePrice = property.priceOnRequest;
  const plans = property.media.floorPlans;
  const group = groups[Math.min(g, groups.length - 1)];
  if (!group) return null;
  const unit = group.items[Math.min(v, group.items.length - 1)];
  const planIndex = plans.findIndex((p) => p.id === unit.floorPlanImageId);
  const plan = planIndex >= 0 ? plans[planIndex] : null;

  const fromPrice = (items: Configuration[]) => {
    if (hidePrice) return null;
    const prices = items.map((c) => c.priceMin).filter((n): n is number => typeof n === 'number' && n > 0);
    return prices.length ? `from ${formatINR(Math.min(...prices))}` : null;
  };
  const price = !hidePrice && unit.priceMin ? formatINRRange(unit.priceMin, unit.priceMax, rent ? ' /month' : '') : null;
  const rows = [
    { icon: Ruler, label: plot ? 'Plot area' : 'Carpet area', value: formatSqftRange(unit.carpetSqftMin, unit.carpetSqftMax) },
    !plot ? { icon: Ruler, label: 'Super built-up', value: formatSqftRange(unit.superSqftMin, unit.superSqftMax) } : null,
    unit.dimensions ? { icon: Ruler, label: 'Dimensions', value: unit.dimensions } : null,
    unit.bathrooms ? { icon: Bath, label: 'Bathrooms', value: String(unit.bathrooms) } : null,
  ].filter((r): r is { icon: typeof Ruler; label: string; value: string | null } => Boolean(r));
  const status = unit.availability ? AVAILABILITY[unit.availability] : null;
  const ask = (intent: 'price-sheet' | 'site-visit') =>
    openLeadSheet(intent, intent === 'site-visit' ? `I'd like to visit ${property.title} to see the ${unit.label}.` : `Please share the price sheet and floor plan for the ${unit.label} at ${property.title}.`);

  return (
    <div>
      <div role="tablist" aria-label="Choose a configuration" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {groups.map((item, i) => {
          const active = i === g;
          const from = fromPrice(item.items);
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setG(i);
                setV(0);
              }}
              className={`min-w-[6.25rem] shrink-0 rounded-xl border px-3.5 py-2 text-left transition-[background-color,border-color,box-shadow] duration-base ${active ? 'border-accent bg-accent text-accent-on shadow-[0_10px_24px_-14px_rgb(var(--accent)/0.9)]' : 'border-line bg-surface hover:border-line-strong'}`}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className={`block text-xs ${active ? 'text-accent-on/80' : 'text-ink-muted'}`}>
                {from ?? `${item.items.length} ${item.items.length === 1 ? 'size' : 'sizes'}`}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={group.label} className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
        {group.items.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2/50 px-4 py-2.5">
            <span className="mr-1 text-xs text-ink-muted">{group.items.length} sizes:</span>
            {group.items.map((c, i) => (
              <button key={c.id} type="button" onClick={() => setV(i)} aria-pressed={i === v} className="chip min-h-[34px] px-3 text-xs">
                {formatSqftRange(c.carpetSqftMin, c.carpetSqftMax) ?? c.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{unit.label}</h3>
              {status && <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">{status}</span>}
            </div>
            {unit.notes && <p className="mt-0.5 text-sm text-ink-muted">{unit.notes}</p>}

            <p className="mt-3 text-xs text-ink-muted">{rent ? 'Monthly rent' : 'Price'}</p>
            {price ? (
              <p className="tabular font-serif text-[1.35rem] leading-tight">
                {price}
                <sup className="ml-0.5 text-sm text-brass">*</sup>
              </p>
            ) : (
              <p className="text-lg font-semibold">On request</p>
            )}

            <dl className="mt-3 grid grid-cols-2 gap-2">
              {rows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg bg-surface-2/70 px-3 py-2">
                  <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                  </dt>
                  <dd className="tabular mt-0.5 text-sm font-semibold">{value ?? 'Ask advisor'}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => ask('price-sheet')} className="btn-primary">
                <FileText className="h-4 w-4" aria-hidden="true" /> {price ? 'Get price sheet' : 'Get the price'}
              </button>
              <button type="button" onClick={() => ask('site-visit')} className="btn-secondary">
                <CalendarDays className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Book site visit
              </button>
            </div>
          </div>

          <div className="border-t border-line bg-white p-3 md:border-l md:border-t-0">
            {plan ? (
              <button type="button" onClick={() => setViewer(planIndex)} className="group relative block h-[170px] w-full overflow-hidden rounded-lg sm:h-[200px]" aria-label={`Open the ${unit.label} floor plan`}>
                <Image src={plan.url} alt={plan.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-contain" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Floor plan
                </span>
              </button>
            ) : (
              <div className="flex h-[170px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed sm:h-[240px] border-line-strong bg-surface-2/50 p-6 text-center">
                <svg viewBox="0 0 120 80" className="h-14 w-20 text-ink-muted" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M6 6h108v68H6zM6 40h46M52 6v68M80 40h34M80 40v34M52 56h28" />
                </svg>
                <p className="text-sm text-ink-muted">The {unit.label} floor plan is shared on request.</p>
                <button type="button" onClick={() => ask('price-sheet')} className="btn-secondary min-h-[40px]">
                  Get floor plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {property.configurations.length > 1 && (
        <div className="mt-4">
          <button type="button" onClick={() => setTable((t) => !t)} aria-expanded={table} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">
            <Table2 className="h-4 w-4" aria-hidden="true" /> {table ? 'Hide' : 'Compare'} all {property.configurations.length} sizes in a table
          </button>
          {table && (
            <div className="mt-3">
              <UnitTable property={property} />
            </div>
          )}
        </div>
      )}
      {!table && (
        <p className="mt-2 text-2xs text-ink-muted">
          *Approximate developer guide prices{property.priceNote ? ` (${property.priceNote})` : ''}; final price depends on unit, floor and current offers.
        </p>
      )}
      {viewer !== null && createPortal(<Lightbox images={plans} start={viewer} title={`${property.title} floor plans`} onClose={() => setViewer(null)} />, document.body)}
    </div>
  );
}
