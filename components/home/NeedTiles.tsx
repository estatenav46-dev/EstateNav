import Link from 'next/link';
import { BadgeIndianRupee, BedDouble, Briefcase, Building2, Globe2, HeartHandshake, KeyRound, LandPlot, Sparkles, type LucideIcon } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { NEED_TILES, type NeedIcon } from '@/lib/categories';

const ICONS: Record<NeedIcon, { icon: LucideIcon; tint: string }> = {
  apartment: { icon: Building2, tint: 'zone-north' },
  plot: { icon: LandPlot, tint: 'zone-south-east' },
  ready: { icon: KeyRound, tint: 'zone-east' },
  launch: { icon: Sparkles, tint: 'zone-south' },
  budget: { icon: BadgeIndianRupee, tint: 'zone-south-east' },
  family: { icon: BedDouble, tint: 'zone-west' },
  'first-home': { icon: HeartHandshake, tint: 'zone-east' },
  nri: { icon: Globe2, tint: 'zone-north' },
  office: { icon: Briefcase, tint: 'zone-central' },
};

// Shortcuts by need: each tile opens the explore page with one filter applied.
export function NeedTiles({ properties }: { properties: Property[] }) {
  const tiles = NEED_TILES.map((t) => ({ ...t, count: properties.filter(t.matches).length })).filter((t) => t.count > 0);
  if (!tiles.length) return null;

  return (
    <section aria-labelledby="needs-title" className="mx-auto max-w-container px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-ink">Or start with what you need</p>
      <h2 id="needs-title" className="mt-1 font-serif text-2xl sm:text-3xl">What are you looking for?</h2>
      <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3 lg:grid-cols-9">
        {tiles.map((t) => {
          const { icon: Icon, tint } = ICONS[t.icon];
          return (
            <li key={t.id}>
              <Link
                href={`/properties?${new URLSearchParams(t.query).toString()}`}
                className={`${tint} group flex h-full flex-col items-center rounded-2xl border border-line bg-surface px-2 pb-3 pt-3.5 text-center transition-[transform,border-color] duration-base ease-out hover:-translate-y-0.5 hover:border-[rgb(var(--tint)/0.45)] active:scale-95`}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--tint)/0.12)] text-[rgb(var(--tint))] transition-transform duration-base group-hover:scale-105">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="mt-2 text-xs font-semibold leading-tight text-ink sm:text-sm">{t.label}</span>
                <span className="mt-0.5 text-[11px] text-ink-muted">
                  {t.count} {t.count === 1 ? 'project' : 'projects'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
