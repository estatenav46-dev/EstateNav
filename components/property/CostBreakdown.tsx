import type { Charge, Property } from '@/lib/data/types';
import { formatINR } from '@/lib/price';

/** "₹240 / sq.ft", "₹1.5 L", "5%", "At actuals". */
export function chargeAmount(c: Charge): string {
  if (c.basis === 'actuals') return 'At actuals';
  if (c.basis === 'included') return 'Included';
  if (c.amount == null) return 'As applicable';
  const rupees = c.amount >= 100_000 ? formatINR(c.amount) : `₹${c.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  switch (c.basis) {
    case 'per-sqft':
      return `${rupees} / sq.ft`;
    case 'percent':
      return `${Number(c.amount.toFixed(2))}%`;
    case 'per-month':
      return `${rupees} / month`;
    case 'per-sqft-month':
      return `${rupees} / sq.ft / month`;
    default:
      return rupees;
  }
}

/** The developer's cost sheet: charges beyond the basic price. */
export function ChargesTable({ property }: { property: Property }) {
  const charges = property.charges;
  if (!charges.length) return null;
  return (
    <div>
      <dl className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {charges.map((c) => (
          <div key={c.id} className="grid gap-0.5 px-4 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-4 sm:px-5">
            <dt className="text-sm font-medium">
              {c.label}
              {(c.payable || c.note) && <span className="block text-xs font-normal text-ink-muted">{[c.payable, c.note].filter(Boolean).join(' · ')}</span>}
            </dt>
            <dd className="tabular text-sm font-semibold sm:text-right">{chargeAmount(c)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-2xs text-ink-muted">As per the developer&apos;s cost sheet; charges and taxes change. Stamp duty and registration are extra unless stated. Confirm with the latest price sheet.</p>
    </div>
  );
}

/** Payment schedule with a bar per stage. */
export function PaymentPlan({ property }: { property: Property }) {
  const { type, bookingPct, stages } = property.paymentPlan;
  if (!stages.length && !type && bookingPct == null) return null;
  return (
    <div>
      {(type || bookingPct != null) && (
        <p className="mb-3 flex flex-wrap gap-2 text-sm">
          {type && <span className="rounded-full bg-ink px-3 py-1 font-semibold text-bg">{type}</span>}
          {bookingPct != null && <span className="rounded-full border border-line bg-surface px-3 py-1">Booking {Number(bookingPct.toFixed(2))}%</span>}
        </p>
      )}
      {stages.length > 0 && (
        <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {stages.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[1.75rem_minmax(0,1fr)_4rem] items-center gap-3 px-4 py-3 sm:px-5">
              <span className="tabular inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-2xs font-semibold text-ink-muted">{i + 1}</span>
              <span className="min-w-0 text-sm">
                {s.stage}
                {s.note && <span className="block text-xs text-ink-muted">{s.note}</span>}
                {s.percent != null && (
                  <span aria-hidden="true" className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, s.percent)}%` }} />
                  </span>
                )}
              </span>
              <span className="tabular text-right text-sm font-semibold">{s.percent != null ? `${Number(s.percent.toFixed(2))}%` : '—'}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
