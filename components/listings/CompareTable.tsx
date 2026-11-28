import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { priceLabel, rateLabel, sizeLabel } from '@/lib/property';

type Row = { label: string; values: string[] };

// Main home types only: "Studio, 1, 2, 3 BHK" rather than every unit variant and size
// (2.5 BHK counts as 2 BHK, 4.5 as 4).
function homeTypes(p: Property): string {
  const studio = p.configurations.some((c) => c.unitKind === 'studio');
  const bhks = Array.from(new Set(p.bhkOptions.filter((b) => b >= 1).map((b) => Math.min(5, Math.floor(b))))).sort((a, b) => a - b);
  const parts = [...(studio ? ['Studio'] : []), ...bhks.map((b) => (b >= 5 ? '5+' : String(b)))];
  if (!bhks.length) return parts.join(', ') || 'Ask advisor';
  return `${parts.join(', ')} BHK`;
}

const NEARBY_ROWS = [
  { label: 'Transit', categories: ['metro', 'railway', 'bus'] },
  { label: 'Education', categories: ['school', 'college'] },
  { label: 'Healthcare', categories: ['hospital'] },
] as const;

// The closest listed place of these kinds, e.g. "Whitefield Metro · 1.2 km".
function nearest(p: Property, categories: readonly string[]): string {
  const places = p.nearby.filter((n) => categories.includes(n.category));
  if (!places.length) return 'Ask advisor';
  const far = (n: (typeof places)[number]) => n.distanceKm ?? (n.travelMins != null ? n.travelMins / 2 : Infinity);
  const best = [...places].sort((a, b) => far(a) - far(b))[0];
  const how = best.distanceKm != null ? `${Number(best.distanceKm.toFixed(1))} km` : best.travelMins != null ? `${best.travelMins} min` : null;
  return how ? `${best.name} · ${how}` : best.name;
}

// Seven rows, the ones buyers weigh first: price, rate, home types, possession and what is close by.
// Full specifications, approvals and amenities stay on each project's own page.
export function compareRows(properties: Property[]): Row[] {
  const homes = properties.every((p) => p.segment === 'residential');
  return [
    { label: 'Price', values: properties.map(priceLabel) },
    { label: '₹ / sq.ft', values: properties.map((p) => rateLabel(p) ?? '—') },
    homes
      ? { label: 'Home types', values: properties.map(homeTypes) }
      : { label: 'Sizes', values: properties.map((p) => sizeLabel(p) ?? 'Ask advisor') },
    { label: 'Possession', values: properties.map((p) => p.possession.label) },
    ...NEARBY_ROWS.map((r) => ({ label: r.label, values: properties.map((p) => nearest(p, r.categories)) })),
  ];
}

// Side-by-side table; rows where the projects differ are marked so the eye goes there first.
export function CompareTable({ properties }: { properties: Property[] }) {
  const rows = compareRows(properties);
  return (
    <div className="relative -mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Comparison of {properties.map((p) => p.title).join(', ')}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-36 border-b border-line pb-3 text-left font-normal text-ink-muted">
              <span className="sheet-label">Differences marked</span>
            </th>
            {properties.map((p) => (
              <th key={p.id} scope="col" className="border-b border-line px-3 pb-3 text-left align-bottom">
                <Link href={`/properties/${p.slug}`} className="group inline-flex items-start gap-1 font-serif text-lg font-normal leading-tight hover:text-accent-ink">
                  {p.title}
                  <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const differs = new Set(row.values).size > 1;
            return (
              <tr key={row.label}>
                <th scope="row" className="border-b border-line py-3 pr-3 text-left align-top font-normal text-ink-muted">
                  <span className="inline-flex items-center gap-2">
                    {differs && <i className="h-1.5 w-1.5 rounded-full bg-accent-ink" aria-hidden="true" />}
                    {row.label}
                    {differs && <span className="sr-only">(differs)</span>}
                  </span>
                </th>
                {row.values.map((value, i) => (
                  <td key={i} className={`border-b border-line px-3 py-3 align-top ${differs ? 'bg-accent-soft/40' : ''}`}>
                    {value}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
