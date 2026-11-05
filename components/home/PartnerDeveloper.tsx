import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Developer } from '@/lib/data/types';

const FACTS: { field: 'yearsActive' | 'sqftDelivered' | 'constructionTech'; label: string; format: (d: Developer) => string | null }[] = [
  { field: 'yearsActive', label: 'Years building in Bengaluru', format: (d) => (d.yearsActive ? `${d.yearsActive}+ years` : null) },
  { field: 'sqftDelivered', label: 'Delivered', format: (d) => (d.sqftDelivered ? `${(d.sqftDelivered / 1_000_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} million sq.ft` : null) },
  { field: 'constructionTech', label: 'Construction method', format: (d) => d.constructionTech },
];

// Text-led partner section. A fact appears only when it has a source on record.
export function PartnerDeveloper({ developer, legalName, projectCount }: { developer: Developer; legalName: string; projectCount: number }) {
  const facts = FACTS.map((fact) => {
    const source = developer.sources.find((s) => s.field === fact.field);
    const value = fact.format(developer);
    return source && value ? { ...fact, value, source } : null;
  }).filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <section aria-labelledby="partner-title" className="mx-auto mt-24 max-w-container px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 border-y border-line py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="sheet-label">Sheet A-04 · Partner developer</p>
          <h2 id="partner-title" className="mt-3 font-serif text-2xl sm:text-3xl">
            Partner Developer: <span className="whitespace-nowrap">{legalName}</span>
          </h2>
        </div>
        <div>
          <p className="max-w-2xl text-lg leading-relaxed text-ink">{developer.about}</p>
          {facts.length > 0 && (
            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.field} className="border-t border-line pt-3">
                  <dt className="text-sm text-ink-muted">{fact.label}</dt>
                  <dd className="mt-1 font-serif text-2xl">{fact.value}</dd>
                  <dd className="mt-1 text-2xs text-ink-muted">
                    Source: {fact.source.url ? <a href={fact.source.url} className="underline" target="_blank" rel="noopener noreferrer">{fact.source.label}</a> : fact.source.label} · as of {fact.source.asOf}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <Link href={`/properties?q=${encodeURIComponent(developer.name)}`} className="mt-8 inline-flex min-h-[48px] items-center gap-1.5 text-sm text-accent-ink hover:underline">
            View {projectCount} {developer.name} {projectCount === 1 ? 'project' : 'projects'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
