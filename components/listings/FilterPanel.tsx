'use client';

import type { Corridor, Lens, Property, SearchSegment } from '@/lib/data/types';
import { APPROVAL_OPTIONS, BHK_CHOICES, POSSESSION_OPTIONS, STATUS_OPTIONS, type ListingState } from '@/lib/listingFilters';
import { bhkLabel, LENS_LABEL, SEGMENT_LABEL } from '@/lib/property';
import { BudgetRange } from '@/components/search/BudgetRange';

type Props = {
  state: ListingState;
  update: (patch: Partial<ListingState>) => void;
  corridors: Corridor[];
  properties: Property[];
  idPrefix: string;
};

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
const LENS_CHOICES: Lens[] = ['first-home', 'upgrading', 'nri', 'senior'];
const SEGMENTS: (SearchSegment | '')[] = ['', 'residential', 'plot', 'commercial', 'rent'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <legend className="sheet-label mb-3 float-left w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string | number }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 shrink-0 accent-[rgb(var(--accent))]" />
      <span className="flex-1">{label}</span>
      {hint !== undefined && <span className="font-mono text-2xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function FilterPanel({ state, update, corridors, properties, idPrefix }: Props) {
  const amenities = Array.from(new Set(properties.flatMap((p) => p.amenities))).sort();
  const rent = state.seg === 'rent' || state.seg === 'commercial';
  const showBhk = state.seg === '' || state.seg === 'residential';

  return (
    <div>
      <Section title="Segment">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Segment">
          {SEGMENTS.map((seg) => (
            <button key={seg || 'all'} type="button" role="radio" aria-checked={state.seg === seg} className="chip" onClick={() => update({ seg, bhk: seg === 'residential' || seg === '' ? state.bhk : [] })}>
              {seg ? SEGMENT_LABEL[seg] : 'All'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Corridor or locality">
        <label htmlFor={`${idPrefix}-q`} className="sr-only">Locality, project or developer</label>
        <input id={`${idPrefix}-q`} value={state.q} onChange={(e) => update({ q: e.target.value })} placeholder="Locality, project or developer" className="field mb-2" />
        {corridors.map((c) => (
          <Check key={c.id} checked={state.corridors.includes(c.id)} onChange={() => update({ corridors: toggle(state.corridors, c.id) })} label={c.name} hint={properties.filter((p) => p.corridorId === c.id).length} />
        ))}
      </Section>

      {showBhk && (
        <Section title="BHK">
          <div className="grid grid-cols-4 gap-1.5">
            {BHK_CHOICES.map((b) => (
              <button key={b} type="button" className="chip justify-center" aria-pressed={state.bhk.includes(b)} onClick={() => update({ bhk: toggle(state.bhk, b).sort((x, y) => x - y) })}>
                {bhkLabel(b).replace(' BHK', '')}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title={rent ? 'Monthly budget' : 'Budget'}>
        <BudgetRange idPrefix={`${idPrefix}-budget`} rent={rent} min={state.min} max={state.max} onChange={(min, max) => update({ min, max })} />
      </Section>

      <Section title="Size (sq.ft)">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-2xs text-ink-muted">
            From
            <input type="number" inputMode="numeric" min={0} step={100} value={state.sizeMin ?? ''} onChange={(e) => update({ sizeMin: e.target.value ? Number(e.target.value) : null })} placeholder="Any" className="field mt-1 font-mono" />
          </label>
          <label className="text-2xs text-ink-muted">
            To
            <input type="number" inputMode="numeric" min={0} step={100} value={state.sizeMax ?? ''} onChange={(e) => update({ sizeMax: e.target.value ? Number(e.target.value) : null })} placeholder="Any" className="field mt-1 font-mono" />
          </label>
        </div>
      </Section>

      <Section title="Possession">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Possession">
          <button type="button" role="radio" aria-checked={!state.possession} className="chip" onClick={() => update({ possession: '' })}>Any</button>
          {POSSESSION_OPTIONS.map((o) => (
            <button key={o.value} type="button" role="radio" aria-checked={state.possession === o.value} className="chip" onClick={() => update({ possession: o.value })}>
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Project status">
        {STATUS_OPTIONS.map((o) => (
          <Check key={o.value} checked={state.status.includes(o.value)} onChange={() => update({ status: toggle(state.status, o.value) })} label={o.label} />
        ))}
      </Section>

      {amenities.length > 0 && (
        <Section title="Amenities">
          {amenities.map((a) => (
            <Check key={a} checked={state.amenities.includes(a)} onChange={() => update({ amenities: toggle(state.amenities, a) })} label={a} />
          ))}
        </Section>
      )}

      <Section title="RERA audit checklist">
        {APPROVAL_OPTIONS.map((o) => (
          <Check key={o.value} checked={state.approvals.includes(o.value)} onChange={() => update({ approvals: toggle(state.approvals, o.value) })} label={o.label} />
        ))}
        <label className="mt-2 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 text-sm">
          <span>Verified (K-RERA) only</span>
          <input type="checkbox" role="switch" checked={state.verified} onChange={() => update({ verified: !state.verified })} className="peer sr-only" />
          <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition-colors duration-fast peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--accent-ink))]">
            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-surface shadow transition-transform duration-fast ${state.verified ? 'translate-x-5' : ''}`} />
          </span>
        </label>
      </Section>

      <Section title="Buyer lens">
        <div className="flex flex-wrap gap-1.5">
          {LENS_CHOICES.map((l) => (
            <button key={l} type="button" className="chip" aria-pressed={state.lens.includes(l)} onClick={() => update({ lens: toggle(state.lens, l) })}>
              {LENS_LABEL[l]}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
