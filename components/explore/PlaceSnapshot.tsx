import type { Property } from '@/lib/data/types';
import { formatINR } from '@/lib/price';

type Stat = { label: string; value: string; note?: string };

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Figures for the place on show, worked out from the listed projects only (no outside data). */
export function placeStats(projects: Property[]): { stats: Stat[]; rera: number } {
  const n = projects.length;
  const priced = projects.filter((p) => !p.priceOnRequest && p.priceMin > 1);
  const sale = priced.filter((p) => p.transaction !== 'rent');
  const rent = priced.filter((p) => p.transaction === 'rent');
  const stats: Stat[] = [];

  if (sale.length) {
    const low = Math.min(...sale.map((p) => p.priceMin));
    const high = Math.max(...sale.map((p) => p.priceMin));
    stats.push({ label: sale.length === 1 ? 'Starting price' : 'Starting prices', value: low === high ? formatINR(low) : `${formatINR(low)} – ${formatINR(high)}`, note: '*' });
  } else if (rent.length) {
    stats.push({ label: 'Rent from', value: `${formatINR(Math.min(...rent.map((p) => p.priceMin)))}/mo`, note: '*' });
  }

  const rates = (sale.length ? sale : rent).map((p) => p.pricePerSqft).filter((r): r is number => typeof r === 'number' && r > 0);
  if (rates.length) {
    stats.push({ label: rates.length === 1 ? 'Rate' : 'Typical rate', value: `₹${Math.round(median(rates)).toLocaleString('en-IN')}/sq.ft${sale.length ? '' : '/mo'}` });
  }

  const ready = projects.filter((p) => p.possession.status === 'ready').length;
  stats.push({ label: 'Ready to move', value: n === 1 ? (ready ? 'Yes' : 'Not yet') : `${ready} of ${n}` });

  const bhks = Array.from(new Set(projects.flatMap((p) => p.bhkOptions).filter((b) => b > 0))).sort((a, b) => a - b);
  const plots = projects.filter((p) => p.segment === 'plot' && p.sizeMin);
  if (bhks.length) {
    const lo = bhks[0];
    const hi = bhks[bhks.length - 1];
    stats.push({ label: 'Homes', value: lo === hi ? `${lo} BHK` : `${lo}–${hi} BHK` });
  } else if (plots.length) {
    stats.push({ label: 'Plot sizes', value: `from ${Math.min(...plots.map((p) => p.sizeMin!)).toLocaleString('en-IN')} sq.ft` });
  } else {
    const developers = new Set(projects.map((p) => p.developerName).filter(Boolean)).size;
    if (developers) stats.push({ label: 'Developers', value: String(developers) });
  }

  return { stats: stats.slice(0, 4), rera: projects.filter((p) => p.rera.number).length };
}

// "At a glance" panel beside the explore headline: price span, typical rate, how many are ready
// and the home sizes for the region, area or location on show (ignores the other filters).
export function PlaceSnapshot({ place, projects, className = '' }: { place: string; projects: Property[]; className?: string }) {
  if (!projects.length) return null;
  const { stats, rera } = placeStats(projects);
  const n = projects.length;
  return (
    <section aria-label={`${place} at a glance`} className={`rounded-card border border-line bg-surface px-5 py-4 ${className}`}>
      <p className="sheet-label">{place} at a glance</p>
      <dl className={`mt-3 grid grid-cols-2 gap-x-5 gap-y-3 ${stats.length >= 4 ? 'xl:grid-cols-[repeat(4,auto)] xl:justify-between' : stats.length === 3 ? 'xl:grid-cols-[repeat(3,auto)] xl:justify-between' : ''}`}>
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 xl:border-l xl:border-line xl:pl-4 xl:first:border-l-0 xl:first:pl-0">
            <dt className="whitespace-nowrap text-xs text-ink-muted">{s.label}</dt>
            <dd className="tabular mt-0.5 text-[0.95rem] font-semibold leading-snug xl:whitespace-nowrap">
              {s.value}
              {s.note && <sup className="ml-px text-[0.65em] text-brass">{s.note}</sup>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t border-line pt-2.5 text-2xs text-ink-muted">
        From {n} listed {n === 1 ? 'project' : 'projects'}
        {rera ? ` · ${rera === n ? (n === 1 ? 'K-RERA number shown' : 'all with K-RERA numbers') : `${rera} with K-RERA numbers`}` : ''} · *developer guide prices
      </p>
    </section>
  );
}
