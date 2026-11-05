import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { priceLabel, rateLabel, sizeLabel, statusChip } from '@/lib/property';

type Row = { label: string; values: string[] };

const approvals = (p: Property) =>
  [p.approvals.khata && `${p.approvals.khata}-Khata`, p.approvals.planAuthority && `${p.approvals.planAuthority} plan`, p.approvals.titleCheck === 'clear' && 'Title clear'].filter(Boolean).join(', ') || 'Ask advisor';

export function compareRows(properties: Property[]): Row[] {
  return [
    { label: 'Price', values: properties.map(priceLabel) },
    { label: '₹ / sq.ft', values: properties.map((p) => rateLabel(p) ?? '—') },
    { label: 'Sizes', values: properties.map((p) => sizeLabel(p) ?? 'Ask advisor') },
    { label: 'Configurations', values: properties.map((p) => p.configurations.map((c) => c.label).join(', ')) },
    { label: 'Possession', values: properties.map((p) => p.possession.label) },
    { label: 'Status', values: properties.map(statusChip) },
    { label: 'Approvals', values: properties.map(approvals) },
    { label: 'Bank approvals', values: properties.map((p) => p.bankApprovals.join(', ') || 'Ask advisor') },
    { label: 'K-RERA', values: properties.map((p) => p.rera.number ?? 'RERA details on request') },
    { label: 'Amenities', values: properties.map((p) => p.amenities.join(', ') || 'Ask advisor') },
    { label: 'Corridor', values: properties.map((p) => `${p.locality} · ${p.corridorName}`) },
  ];
}

// Side-by-side table; rows where the projects differ are marked so the eye goes there first.
export function CompareTable({ properties }: { properties: Property[] }) {
  const rows = compareRows(properties);
  return (
    <div className="-mx-5 overflow-x-auto px-5">
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
                  <td key={i} className={`border-b border-line px-3 py-3 align-top ${differs ? 'bg-accent-soft/40' : ''} ${row.label === 'K-RERA' ? 'break-all font-mono text-2xs' : ''}`}>
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
