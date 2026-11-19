'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import type { Property } from '@/lib/data/types';
import { formatINR } from '@/lib/price';
import { possessionMonths } from '@/lib/property';
import { compareRows } from '@/components/listings/CompareTable';

// Automatic side-by-side: this project against its closest matches. Visitors can swap any
// compared column for another similar listing.
export function AutoCompare({ base, suggested, pool }: { base: Property; suggested: Property[]; pool: Property[] }) {
  const [ids, setIds] = useState(() => suggested.slice(0, 2).map((p) => p.id));
  const others = ids.map((id) => pool.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  const columns = [base, ...others];
  const rows = compareRows(columns);

  const insights = useMemo(() => {
    const out: { label: string; value: string }[] = [];
    const priced = columns.filter((p) => !p.priceOnRequest);
    const cheapest = [...priced].sort((a, b) => a.priceMin - b.priceMin)[0];
    if (cheapest && priced.length > 1) out.push({ label: 'Lowest entry price', value: `${cheapest.title} · ${formatINR(cheapest.priceMin)}*` });
    const rated = columns.filter((p) => p.pricePerSqft != null && !p.priceOnRequest);
    if (rated.length > 1) {
      const best = [...rated].sort((a, b) => a.pricePerSqft! - b.pricePerSqft!)[0];
      out.push({ label: 'Best rate per sq.ft', value: `${best.title} · ₹${Math.round(best.pricePerSqft!).toLocaleString('en-IN')}` });
    }
    const soonest = [...columns].sort((a, b) => possessionMonths(a) - possessionMonths(b))[0];
    out.push({ label: 'Soonest possession', value: `${soonest.title} · ${soonest.possession.label}` });
    return out;
  }, [columns]);

  if (!others.length) return null;

  return (
    <section aria-labelledby="auto-compare-title" className="mt-12">
      <p className="flex items-center gap-3 text-sm font-medium text-ink-muted">
        <span aria-hidden="true" className="h-px w-8 bg-brass/60" /> Compared for you
      </p>
      <h2 id="auto-compare-title" className="mt-2 font-serif text-[1.75rem] leading-tight tracking-[-0.02em] sm:text-3xl">
        {base.title} <span className="text-ink-muted">vs</span> {others.length === 1 ? 'a close match' : 'two close matches'}
      </h2>

      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {insights.map((i) => (
          <li key={i.label} className="rounded-2xl border border-line bg-sand/60 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-brass">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {i.label}
            </p>
            <p className="mt-1 text-sm font-medium">{i.value}</p>
          </li>
        ))}
      </ul>

      <div className="no-scrollbar relative -mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[620px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-line bg-surface text-sm">
          <caption className="sr-only">Comparison of {columns.map((p) => p.title).join(', ')}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 border-b border-line bg-surface-2 p-4 text-left text-xs font-medium text-ink-muted">Differences highlighted</th>
              {columns.map((p, col) => (
                <th key={p.id} scope="col" className={`border-b border-l border-line p-4 text-left align-top ${col === 0 ? 'bg-accent-soft/50' : 'bg-surface-2'}`}>
                  {col === 0 ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-on">This project</span>
                  ) : (
                    <Select
                      label="Swap compared project"
                      value={p.id}
                      options={pool
                        .filter((o) => o.id !== base.id && (o.id === p.id || !ids.includes(o.id)))
                        .map((o) => ({ value: o.id, label: o.title, hint: `${o.locality} · ${o.priceOnRequest ? 'Price on request' : formatINR(o.priceMin)}` }))}
                      onChange={(v) => setIds((current) => current.map((id, i) => (i === col - 1 ? v : id)))}
                      menuWidth={300}
                      display={
                        <span className="flex items-center gap-1.5">
                          <ArrowLeftRight className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" /> Swap project
                        </span>
                      }
                      className="h-9 rounded-full border border-line bg-surface pl-3 pr-1 text-xs font-semibold hover:border-line-strong data-[open=true]:border-ink"
                    />
                  )}
                  <a href={`/properties/${p.slug}`} target="_blank" rel="noopener noreferrer" className="group mt-2 flex items-start gap-1 font-serif text-lg font-semibold leading-tight hover:text-accent-ink">
                    {p.title}
                    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
                  </a>
                  <p className="mt-0.5 text-xs font-normal text-ink-muted">{p.locality}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((row) => row.label !== 'K-RERA')
              .map((row) => {
                const differs = new Set(row.values).size > 1;
                return (
                  <tr key={row.label}>
                    <th scope="row" className="border-b border-line p-4 text-left align-top text-xs font-medium text-ink-muted">
                      {row.label === 'Price' ? 'Price*' : row.label}
                      {differs && <span className="sr-only"> (differs)</span>}
                    </th>
                    {row.values.map((value, i) => (
                      <td key={i} className={`border-b border-l border-line p-4 align-top ${differs ? 'bg-accent-soft/30' : ''} ${i === 0 ? 'font-medium' : ''}`}>
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">*Approximate developer guide prices. Terms and conditions apply; contact the advisor for the current price sheet.</p>
    </section>
  );
}
