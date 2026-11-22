import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Developer } from '@/lib/data/types';
import { Reveal, Words } from '@/components/Reveal';

const monthYear = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Inline partnership section (text only, no logo). Developer facts appear only when the
// developer record carries a source for them (Admin → Developers).
export function PartnerShowcase({ developer, legalName, projectCount }: { developer: Developer; legalName: string; projectCount: number }) {
  const source = (field: 'yearsActive' | 'sqftDelivered' | 'constructionTech') => developer.sources.find((s) => s.field === field);
  const years = developer.yearsActive ? source('yearsActive') : undefined;
  const sqft = developer.sqftDelivered ? source('sqftDelivered') : undefined;
  const tech = developer.constructionTech ? source('constructionTech') : undefined;

  const rows = [
    {
      title: 'Track record',
      body:
        years || sqft
          ? [years && `${developer.yearsActive}+ years building in Bengaluru`, sqft && `${(developer.sqftDelivered! / 1_000_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}M+ sq.ft delivered`].filter(Boolean).join(' · ')
          : 'Delivered projects and occupancy certificates are shared with you before you commit.',
      cite: years ?? sqft ?? null,
    },
    {
      title: 'Construction',
      body: tech ? `${developer.constructionTech}.` : 'The construction method and specification sheet of every project, on request.',
      cite: tech ?? null,
    },
    {
      title: 'Direct terms',
      body: 'The developer’s own price list, zero buyer brokerage, and your booking coordinated by a K-RERA registered agent.',
      cite: null,
    },
  ];

  return (
    <section id="partner" aria-labelledby="partner-title" data-scrub="enter" data-scrub-span="0.85" className="mt-8 scroll-mt-24 px-2 sm:mt-10 sm:px-4">
      <div className="sc-inset overflow-hidden rounded-slide bg-sand sm:rounded-slide">
      <div className="mx-auto grid max-w-container gap-6 px-4 py-9 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:px-8 lg:py-11">
        <Reveal variant="words">
          <p className="rw-fade flex items-center gap-3 text-sm font-medium text-ink-muted">
            <span className="font-mono text-xs text-brass">04</span>
            <span aria-hidden="true" className="rw-line h-px w-10 bg-brass/70" />
            Developer partnership
          </p>
          <h2 id="partner-title" className="mt-2 font-serif text-[1.8rem] leading-[1.06] tracking-[-0.03em] sm:text-[2.3rem]">
            <Words>
              <>Partner Developer: <span className="text-accent-ink">{legalName}</span></>
            </Words>
          </h2>
          {developer.about && <p className="mt-4 max-w-lg text-ink-muted">{developer.about}</p>}
          {projectCount > 0 && (
            <Link href={`/properties?q=${encodeURIComponent(developer.name)}`} className="group mt-4 inline-flex min-h-[40px] items-center gap-2 font-semibold text-ink hover:text-accent-ink">
              View {projectCount} {developer.name} {projectCount === 1 ? 'project' : 'projects'}
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest text-forest-on transition-transform duration-base group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          )}
        </Reveal>
        <ol className="divide-y divide-line border-y border-line">
          {rows.map((row, i) => (
            <Reveal as="li" key={row.title} index={i} variant="right" className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-4">
              <span className="font-serif text-[1.6rem] leading-none text-brass">0{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold">{row.title}</h3>
                <p className="mt-1 text-ink-muted">{row.body}</p>
                {row.cite && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Source:{' '}
                    {row.cite.url ? (
                      <a href={row.cite.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{row.cite.label}</a>
                    ) : (
                      row.cite.label
                    )}
                    , {monthYear(row.cite.asOf)}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
      </div>
    </section>
  );
}
