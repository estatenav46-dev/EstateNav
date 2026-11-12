import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { Corridor, MarketSnapshot } from '@/lib/data/types';

const monthYear = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Latest figure per corridor. */
export function latestSnapshots(snapshots: MarketSnapshot[]): MarketSnapshot[] {
  const byCorridor = new Map<string, MarketSnapshot>();
  for (const s of snapshots) {
    const current = byCorridor.get(s.corridorId);
    if (!current || s.asOf > current.asOf) byCorridor.set(s.corridorId, s);
  }
  return Array.from(byCorridor.values());
}

function Figure({ s, name }: { s: MarketSnapshot; name: string }) {
  const up = s.yoyChangePct >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="font-semibold text-ink">{name}</span>
      <span className="tabular font-mono">₹{Math.round(s.avgPricePerSqft).toLocaleString('en-IN')}/sq.ft</span>
      <span className={`tabular inline-flex items-center font-mono ${up ? 'text-accent-ink' : 'text-danger'}`}>
        <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
        {Math.abs(s.yoyChangePct).toFixed(1)}% YoY
      </span>
    </span>
  );
}

// Corridor price benchmarks. Renders only figures saved with a source and date (Admin →
// Market data); with none saved, nothing is shown at all.
export function MarketTicker({ snapshots, corridors }: { snapshots: MarketSnapshot[]; corridors: Corridor[] }) {
  const latest = latestSnapshots(snapshots)
    .map((s) => ({ s, name: corridors.find((c) => c.id === s.corridorId)?.name ?? s.corridorId }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!latest.length) return null;
  const sources = Array.from(new Set(latest.map(({ s }) => `${s.source}, ${monthYear(s.asOf)}`)));

  return (
    <section aria-label="Corridor price benchmarks" className="mx-auto max-w-container px-4 pt-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="ticker-mask overflow-hidden py-3">
          <ul className="ticker-track flex w-max gap-10 px-5 text-sm text-ink-muted">
            {[0, 1].map((copy) =>
              latest.map(({ s, name }) => (
                <li key={`${copy}-${s.id}`} aria-hidden={copy === 1 ? true : undefined} className={copy === 1 ? 'ticker-dup' : undefined}>
                  <Figure s={s} name={name} />
                </li>
              )),
            )}
          </ul>
        </div>
        <p className="border-t border-line px-5 py-2 text-[11px] text-ink-muted">
          Benchmark rates, not listing prices. Source: {sources.join(' · ')}.
        </p>
      </div>
    </section>
  );
}
