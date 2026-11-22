import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { NEED_TILES } from '@/lib/categories';
import { sortListings } from '@/lib/listingFilters';
import { NeedIcon } from '@/components/icons/NeedIcons';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

const TYPE_IDS = ['apartments', 'plots', 'offices'];
// Columns for however many property types have projects, so no row is left half empty.
const TYPE_COLS: Record<number, string> = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };
const TYPE_COPY: Record<string, string> = {
  apartments: 'Ready and upcoming homes in gated communities',
  plots: 'Approved layouts to build your own',
  offices: 'Grade-A floors on the tech corridors',
};

// Shop by need: property types as compact photo cards, everyday needs as icon pills.
export function NeedTiles({ properties }: { properties: Property[] }) {
  const ranked = sortListings(properties, 'relevance');
  const tiles = NEED_TILES.map((t) => {
    const list = ranked.filter(t.matches);
    return { ...t, count: list.length, cover: list[0]?.media.cover, href: `/properties?${new URLSearchParams(t.query).toString()}` };
  }).filter((t) => t.count > 0);
  const types = tiles.filter((t) => TYPE_IDS.includes(t.id));
  const needs = tiles.filter((t) => !TYPE_IDS.includes(t.id));
  if (!tiles.length) return null;

  return (
    <section aria-labelledby="needs-title" className="mx-auto max-w-container px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading index="02" kicker="Browse by need" id="needs-title" title={<>What are you <span className="text-accent-ink">looking for?</span></>} />

      <ul className={`no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-7 sm:grid ${TYPE_COLS[types.length] ?? 'sm:grid-cols-3'} sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0`}>
        {types.map((t, i) => (
          <Reveal as="li" key={t.id} index={i} variant="zoom" className={`${types.length === 1 ? 'w-full' : 'w-[82%]'} shrink-0 snap-start sm:w-auto`}>
            <Link
              href={t.href}
              data-ripple
              className={`group relative isolate flex aspect-[4/3] h-full flex-col justify-end overflow-hidden rounded-card bg-forest p-5 text-white ${types.length <= 2 ? 'sm:aspect-auto sm:h-64' : 'sm:aspect-[3/4] lg:aspect-[4/3.4]'}`}
            >
              {t.cover && <Image src={t.cover.url} alt="" fill sizes="(min-width: 640px) 31vw, 100vw" quality={60} className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />}
              <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <span className="flex items-end justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-serif text-[1.75rem] leading-tight">{t.label}</span>
                  <span className="mt-1 block text-sm text-white/80">{TYPE_COPY[t.id]}</span>
                  <span className="mt-3 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur-sm">
                    {t.count} {t.count === 1 ? 'project' : 'projects'}
                  </span>
                </span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
        {needs.map((t, i) => (
          <Reveal as="li" key={t.id} index={i}>
            <Link
              href={t.href}
              data-ripple
              className="lift group flex h-full items-center gap-3 rounded-[14px] border border-line bg-surface p-3 active:scale-[0.98]"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink transition-colors duration-base group-hover:bg-accent group-hover:text-accent-on">
                <NeedIcon name={t.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{t.label}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{t.count} {t.count === 1 ? 'project' : 'projects'}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
