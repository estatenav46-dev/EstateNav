'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import type { Property } from '@/lib/data/types';

type Row = { label: string; value: React.ReactNode; ok: boolean };

export function ledgerRows(property: Property, summary = false): Row[] {
  const { rera, approvals, bankApprovals, possession } = property;
  const ask = <span className="text-ink-muted">Ask advisor</span>;
  const rows: Row[] = [
    {
      label: 'RERA registered',
      ok: Boolean(rera.registered && rera.number),
      value: rera.number ? (
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="break-all font-mono text-2xs">{rera.number}</span>
          {rera.verifyUrl && (
            <a href={rera.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-accent-ink hover:underline">
              Verify <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </span>
      ) : (
        <span className="text-ink-muted">RERA details on request</span>
      ),
    },
    { label: 'Title / Kaveri check', ok: approvals.titleCheck === 'clear', value: approvals.titleCheck === 'clear' ? 'Clear' : approvals.titleCheck === 'pending' ? <span className="text-ink-muted">In progress</span> : ask },
    { label: 'Khata type', ok: Boolean(approvals.khata), value: approvals.khata ? `${approvals.khata}-Khata` : ask },
    { label: 'Plan sanction', ok: Boolean(approvals.planAuthority), value: approvals.planAuthority ? `${approvals.planAuthority} sanctioned plan` : ask },
    {
      label: 'Bank approvals',
      ok: bankApprovals.length > 0,
      value: bankApprovals.length ? (
        <span className="flex flex-wrap gap-1">
          {bankApprovals.map((bank) => (
            <span key={bank} className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-xs">{bank}</span>
          ))}
        </span>
      ) : (
        ask
      ),
    },
    { label: 'Possession', ok: possession.status === 'ready' || Boolean(possession.date), value: possession.label },
  ];
  return summary ? [rows[0], rows[3], rows[4]] : rows;
}

// Drawing-set stamp: each row ticks in turn when the ledger scrolls into view. Missing data
// says "Ask advisor" — a tick only ever reflects something on record.
export function VerificationLedger({ property, summary = false, notes = true }: { property: Property; summary?: boolean; notes?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const rows = ledgerRows(property, summary);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tick = (row: Row, i: number) => (
    <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${row.ok ? 'border-accent-ink bg-accent-soft text-accent-ink' : 'border-dashed border-line-strong text-ink-muted'}`}>
      {row.ok && (
        <Check
          className="h-3 w-3"
          style={{ transform: seen ? 'scale(1)' : 'scale(0)', opacity: seen ? 1 : 0, transition: `transform 240ms var(--ease) ${i * 120}ms, opacity 240ms var(--ease) ${i * 120}ms` }}
        />
      )}
    </span>
  );
  const label = (row: Row) => (
    <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-muted">
      {row.label}
      <span className="sr-only">{row.ok ? ': on record' : ': not on record'}</span>
    </span>
  );

  // The RERA row runs full width (projects often carry several phase numbers, shown as chips);
  // the other checks sit in a tight grid so the card stays short.
  const [first, ...rest] = rows;
  const reraFirst = first.label === 'RERA registered';
  const { rera } = property;
  const numbers = rera.number ? rera.number.split(/\s*[|,;\r\n]+\s*/).map((n) => n.trim()).filter(Boolean) : [];
  const span = (row: Row) => (summary ? '' : row.label === 'Bank approvals' ? 'lg:col-span-2' : row.label === 'Possession' ? 'sm:col-span-2 lg:col-span-1' : '');
  const cells = reraFirst ? rest : rows;

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line bg-surface">
      {reraFirst && (
        <div className="flex gap-2.5 border-b border-line px-3.5 py-2.5">
          {tick(first, 0)}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3">
              {label(first)}
              {rera.verifyUrl && (
                <a href={rera.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent-ink hover:underline">
                  Verify on K-RERA <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
            {numbers.length ? (
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {numbers.map((n) => (
                  <li key={n} className="break-all rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-tight text-ink">
                    {n}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-0.5 text-sm text-ink-muted">RERA details on request</p>
            )}
          </div>
        </div>
      )}
      <dl className={`grid grid-cols-1 gap-px bg-line ${summary ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {cells.map((row, i) => (
          <div key={row.label} className={`flex min-w-0 gap-2.5 bg-surface px-3.5 py-2.5 ${span(row)}`}>
            {tick(row, i + 1)}
            <div className="min-w-0">
              <dt>{label(row)}</dt>
              <dd className="mt-0.5 text-sm leading-snug text-ink">{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="border-t border-line bg-surface-2/60 px-3.5 py-2 text-2xs leading-relaxed text-ink-muted">
        {notes && property.approvals.notes && <span className="text-ink">Developer note: {property.approvals.notes}. </span>}
        Ticks reflect documents on record; check originals with your own lawyer before booking.
      </p>
    </div>
  );
}
