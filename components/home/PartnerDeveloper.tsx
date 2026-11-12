import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import type { Developer } from '@/lib/data/types';

export function PartnerDeveloper({
  developer,
  legalName,
  projectCount,
}: {
  developer: Developer;
  legalName: string;
  projectCount: number;
}) {
  return (
    <section className="mx-auto max-w-container px-4 py-3" aria-label="Partner Developer">
      <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-line bg-surface-2/40 px-4 py-3 text-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
          <span className="text-ink">
            Authorised Channel Partner for <strong className="font-semibold text-ink">{legalName}</strong>
          </span>
          <span className="hidden text-ink-muted sm:inline">· Direct developer pricing</span>
        </div>
        <Link
          href={`/properties?q=${encodeURIComponent(developer.name)}`}
          className="inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline"
        >
          <span>View {projectCount} {developer.name} {projectCount === 1 ? 'project' : 'projects'}</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
