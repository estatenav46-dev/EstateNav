'use client';

import { formatINR } from '@/lib/price';

const SALE_STEPS = [2_500_000, 5_000_000, 7_500_000, 10_000_000, 12_500_000, 15_000_000, 20_000_000, 25_000_000, 30_000_000, 40_000_000, 50_000_000];
const RENT_STEPS = [250_000, 500_000, 1_000_000, 1_500_000, 2_500_000, 4_000_000, 6_000_000, 8_000_000, 10_000_000];

export const budgetSteps = (rent: boolean) => (rent ? RENT_STEPS : SALE_STEPS);

export function budgetSummary(min: number | null, max: number | null, rent: boolean) {
  const suffix = rent ? '/mo' : '';
  if (min == null && max == null) return 'Any budget';
  if (min == null) return `Under ${formatINR(max!)}${suffix}`;
  if (max == null) return `${formatINR(min)}+${suffix}`;
  return `${formatINR(min)} – ${formatINR(max)}${suffix}`;
}

export function budgetPresetsFor(rent: boolean): { label: string; min: number | null; max: number | null }[] {
  return rent
    ? [
        { label: 'Under ₹15 L/mo', min: null, max: 1_500_000 },
        { label: '₹15–40 L/mo', min: 1_500_000, max: 4_000_000 },
        { label: '₹40 L/mo +', min: 4_000_000, max: null },
      ]
    : [
        { label: 'Under ₹1 Cr', min: null, max: 10_000_000 },
        { label: '₹1–1.5 Cr', min: 10_000_000, max: 15_000_000 },
        { label: '₹1.5–2 Cr', min: 15_000_000, max: 20_000_000 },
        { label: '₹2 Cr +', min: 20_000_000, max: null },
      ];
}

// Dual-thumb budget slider over friendly ₹ L / Cr steps. The ends mean "no limit".
export function BudgetRange({ min, max, rent, onChange, idPrefix }: { min: number | null; max: number | null; rent: boolean; onChange: (min: number | null, max: number | null) => void; idPrefix: string }) {
  const steps = budgetSteps(rent);
  const last = steps.length - 1;
  const lo = min == null ? 0 : Math.max(0, steps.findIndex((s) => s >= min));
  const hiIndex = max == null ? last : steps.findIndex((s) => s >= max);
  const hi = hiIndex === -1 ? last : hiIndex;
  const pct = (i: number) => (i / last) * 100;

  return (
    <div>
      <p className="tabular mb-1 text-sm text-ink" aria-live="polite">{budgetSummary(min, max, rent)}</p>
      <div className="dual-range">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} aria-hidden="true" />
        <input
          id={`${idPrefix}-min`}
          type="range"
          min={0}
          max={last}
          step={1}
          value={lo}
          aria-label="Minimum budget"
          aria-valuetext={lo === 0 ? 'No minimum' : formatINR(steps[lo])}
          onChange={(e) => {
            const i = Math.min(Number(e.target.value), hi - 1);
            onChange(i <= 0 ? null : steps[i], max);
          }}
        />
        <input
          id={`${idPrefix}-max`}
          type="range"
          min={0}
          max={last}
          step={1}
          value={hi}
          aria-label="Maximum budget"
          aria-valuetext={hi === last ? 'No maximum' : formatINR(steps[hi])}
          onChange={(e) => {
            const i = Math.max(Number(e.target.value), lo + 1);
            onChange(min, i >= last ? null : steps[i]);
          }}
        />
      </div>
      <div className="flex justify-between font-mono text-2xs text-ink-muted" aria-hidden="true">
        <span>{formatINR(steps[0])}</span>
        <span>{formatINR(steps[last])}+</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {budgetPresetsFor(rent).map((preset) => (
          <button key={preset.label} type="button" className="chip text-2xs" aria-pressed={preset.min === min && preset.max === max} onClick={() => onChange(preset.min, preset.max)}>
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
