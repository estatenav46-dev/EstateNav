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
            <a href={rera.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-0.5 text-sm text-accent-ink hover:underline">
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
            <span key={bank} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-2xs">{bank}</span>
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

  return (
    <div ref={ref} className="relative border-2 border-ink/80 bg-surface">
      <div className="flex items-center justify-between border-b-2 border-ink/80 px-4 py-2">
        <p className="font-mono text-2xs uppercase tracking-[0.14em]">Verification ledger</p>
        <p className="font-mono text-2xs text-ink-muted">Sheet V-01</p>
      </div>
      <ol>
        {rows.map((row, i) => (
          <li key={row.label} className={`grid items-start gap-x-3 gap-y-0.5 border-b border-dashed border-line px-4 py-3 last:border-b-0 ${summary ? 'grid-cols-[28px_minmax(0,1fr)]' : 'grid-cols-[28px_minmax(0,1fr)] sm:grid-cols-[28px_11rem_minmax(0,1fr)]'}`}>
            <span aria-hidden="true" className={`row-span-2 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${row.ok ? 'border-accent-ink text-accent-ink' : 'border-dashed border-line-strong text-ink-muted'}`}>
              {row.ok && (
                <Check
                  className="h-3.5 w-3.5"
                  style={{ transform: seen ? 'scale(1)' : 'scale(0)', opacity: seen ? 1 : 0, transition: `transform 240ms var(--ease) ${i * 140}ms, opacity 240ms var(--ease) ${i * 140}ms` }}
                />
              )}
            </span>
            <span className="text-sm text-ink-muted">
              {row.label}
              <span className="sr-only">{row.ok ? ': on record' : ': not on record'}</span>
            </span>
            <span className={`min-w-0 text-sm text-ink ${summary ? 'col-start-2' : 'col-start-2 sm:col-start-3 sm:row-start-1'}`}>{row.value}</span>
          </li>
        ))}
      </ol>
      {notes && property.approvals.notes && <p className="border-t border-line px-4 py-3 text-sm text-ink-muted">Developer note: {property.approvals.notes}</p>}
      <p className="border-t-2 border-ink/80 px-4 py-2 text-2xs text-ink-muted">Ticks reflect documents on record. Check originals with your own lawyer before booking.</p>
    </div>
  );
}
