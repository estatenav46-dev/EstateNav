import Link from 'next/link';
import { ArrowRight, Compass, Handshake, TrendingUp } from 'lucide-react';
import type { Developer } from '@/lib/data/types';

const monthYear = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Inline partnership banner (no logo: the partner is named in text only). Developer facts
// appear only when the developer record carries a source for them (Admin → Developers).
export function PartnerShowcase({ developer, legalName, projectCount }: { developer: Developer; legalName: string; projectCount: number }) {
  const source = (field: 'yearsActive' | 'sqftDelivered' | 'constructionTech') => developer.sources.find((s) => s.field === field);
  const years = developer.yearsActive && source('yearsActive');
  const sqft = developer.sqftDelivered && source('sqftDelivered');
  const tech = developer.constructionTech && source('constructionTech');
  const cite = (s?: { label: string; asOf: string; url: string | null }) =>
    s ? (
      <span className="mt-3 block text-[11px] text-ink-muted">
        Source:{' '}
        {s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{s.label}</a>
        ) : (
          s.label
        )}
        , {monthYear(s.asOf)}
      </span>
    ) : null;

  const cards = [
    {
      icon: TrendingUp,
      title: 'Track record',
      body:
        years || sqft
          ? [years && `${developer.yearsActive}+ years building in Bengaluru`, sqft && `${(developer.sqftDelivered! / 1_000_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}M+ sq.ft delivered`].filter(Boolean).join(' · ')
          : 'Delivered projects and occupancy certificates are shared on request, before you commit.',
      note: cite(years || sqft || undefined),
    },
    {
      icon: Compass,
      title: 'Construction',
      body: tech ? `${developer.constructionTech}.` : 'Ask the advisor for the construction method and specification sheet of each project.',
      note: cite(tech || undefined),
    },
    {
      icon: Handshake,
      title: 'Direct terms',
      body: 'The developer’s own price list, zero buyer brokerage, and your booking coordinated by a K-RERA registered agent.',
      note: null,
    },
  ];

  return (
    <section id="partner" aria-labelledby="partner-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="rounded-3xl border border-line bg-surface-2/60 p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-ink">Developer partnership</p>
            <h2 id="partner-title" className="mt-1 font-serif text-2xl sm:text-3xl">Partner Developer: {legalName}</h2>
            {developer.about && <p className="mt-2 text-sm text-ink-muted">{developer.about}</p>}
          </div>
          {projectCount > 0 && (
            <Link href={`/properties?q=${encodeURIComponent(developer.name)}`} className="inline-flex min-h-[48px] items-center gap-1 text-sm font-semibold text-accent-ink hover:underline">
              View {projectCount} {developer.name} {projectCount === 1 ? 'project' : 'projects'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, body, note }) => (
            <li key={title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{body}</p>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
