'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '@/lib/data/types';
import { formatINR } from '@/lib/price';

type Props = {
  costs: SiteSettings['costs'];
  disclaimer: string;
  initialValue: number;
  min?: number;
  max?: number;
  idPrefix?: string;
  /** Single column, for narrow sheets. */
  stacked?: boolean;
};

function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 400);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = origin + (target - origin) * eased;
      setValue(next);
      from.current = next;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

function Output({ label, value, note }: { label: string; value: number; note?: string }) {
  const shown = useAnimatedNumber(value);
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="tabular mt-1 font-serif text-2xl">{formatINR(Math.round(shown))}</p>
      {note && <p className="mt-1 text-2xs text-ink-muted">{note}</p>}
    </div>
  );
}

function Toggle<T extends number>({ label, value, options, onChange, format }: { label: string; value: T; options: T[]; onChange: (v: T) => void; format: (v: T) => string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-2 p-1" role="radiogroup">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={`min-h-[44px] rounded-lg text-sm transition-colors duration-fast ${value === option ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(var(--shadow)/0.12)]' : 'text-ink-muted hover:text-ink'}`}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// EMI, interest and purchase costs. Stamp duty and registration come from settings/site
// (with their as-of date), never from numbers typed into this component.
// Section 24(b): interest on a self-occupied home is deductible up to ₹2,00,000 a year (old tax regime).
const SEC_24B_CAP = 200_000;

export default function CostStudio({ costs, disclaimer, initialValue, min = 6_000_000, max = 35_000_000, idPrefix = 'cost', stacked = false }: Props) {
  const lower = Math.min(min, initialValue);
  const upper = Math.max(max, initialValue);
  const [value, setValue] = useState(initialValue);
  const [down, setDown] = useState<10 | 20 | 30>(20);
  const [tenure, setTenure] = useState<15 | 20 | 25>(20);
  const [rate, setRate] = useState(8.5);

  const loan = Math.max(0, value * (1 - down / 100));
  const r = rate / 1200;
  const n = tenure * 12;
  const emi = r === 0 ? loan / n : (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const totalInterest = Math.max(0, emi * n - loan);
  const stamp = (value * costs.stampDutyPct) / 100;
  const registration = (value * costs.registrationPct) / 100;
  const share = loan + totalInterest > 0 ? loan / (loan + totalInterest) : 1;
  // First-year interest: 12 EMIs minus the principal repaid in those 12 months.
  const balance12 = r === 0 ? loan - emi * 12 : loan * (1 + r) ** 12 - (emi * ((1 + r) ** 12 - 1)) / r;
  const yearOneInterest = Math.max(0, emi * Math.min(12, n) - (loan - Math.max(0, balance12)));
  const sec24b = Math.min(yearOneInterest, SEC_24B_CAP);
  const circumference = 2 * Math.PI * 42;
  const asOf = new Date(`${costs.asOf.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className={`grid gap-6 ${stacked ? '' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}`}>
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor={`${idPrefix}-value`} className="text-sm font-medium">Property value</label>
            <span className="tabular font-serif text-xl">{formatINR(value)}</span>
          </div>
          <input
            id={`${idPrefix}-value`}
            type="range"
            min={lower}
            max={upper}
            step={100000}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-12 w-full accent-[rgb(var(--accent))]"
          />
          <div className="flex justify-between font-mono text-2xs text-ink-muted">
            <span>{formatINR(lower)}</span>
            <span>{formatINR(upper)}</span>
          </div>
        </div>
        <Toggle label="Down payment" value={down} options={[10, 20, 30]} onChange={setDown} format={(v) => `${v}%`} />
        <Toggle label="Tenure" value={tenure} options={[15, 20, 25]} onChange={setTenure} format={(v) => `${v} yrs`} />
        <div>
          <label htmlFor={`${idPrefix}-rate`} className="mb-2 block text-sm font-medium">
            Interest rate <span className="font-normal text-ink-muted">(% a year, from your lender)</span>
          </label>
          <input
            id={`${idPrefix}-rate`}
            type="number"
            inputMode="decimal"
            min={0}
            max={20}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(Math.min(20, Math.max(0, Number(e.target.value) || 0)))}
            className="field max-w-[160px] font-mono"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-5 rounded-xl border border-line bg-surface-2 p-4">
          <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`Principal ${Math.round(share * 100)}%, interest ${100 - Math.round(share * 100)}%`}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--line-strong))" strokeWidth="12" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--accent))" strokeWidth="12" strokeDasharray={`${share * circumference} ${circumference}`} />
          </svg>
          <div className="min-w-0">
            <p className="text-sm text-ink-muted">Monthly EMI</p>
            <EmiNumber value={emi} />
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />Principal</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-line-strong" />Interest</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Output label="Loan amount" value={loan} />
          <Output label="Total interest" value={totalInterest} />
          <Output label={`Stamp duty (${costs.stampDutyPct}%)`} value={stamp} />
          <Output label={`Registration (${costs.registrationPct}%)`} value={registration} />
        </div>
        <Output label="Section 24(b) deduction, year 1" value={sec24b} note={`Home-loan interest on a self-occupied home, capped at ₹2,00,000 a year under the old tax regime. Your year-1 interest: ${formatINR(Math.round(yearOneInterest))}. The tax saved depends on your slab; confirm with a tax adviser.`} />
        <p className="text-2xs leading-relaxed text-ink-muted">
          Karnataka rates as of {asOf} · Source: {costs.source}. {costs.note} {disclaimer}
        </p>
      </div>
    </div>
  );
}

function EmiNumber({ value }: { value: number }) {
  const shown = useAnimatedNumber(value);
  return <p className="tabular font-serif text-3xl leading-tight">{formatINR(Math.round(shown))}</p>;
}
