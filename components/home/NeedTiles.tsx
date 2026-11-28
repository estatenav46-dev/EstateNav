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
    return { ...t, count: list.length, cover: list[0]?.media.cover, href: t.href ?? `/properties?${new URLSearchParams(t.query).toString()}` };
  }).filter((t) => t.count > 0);
  const types = tiles.filter((t) => TYPE_IDS.includes(t.id));
  const needs = tiles.filter((t) => !TYPE_IDS.includes(t.id));
  if (!tiles.length) return null;

  return (
    <section aria-labelledby="needs-title" className="mx-auto max-w-container px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading kicker="Browse by need" id="needs-title" title={<>What are you <span className="text-accent-ink">looking for?</span></>} />

      <ul className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-[repeat(auto-fit,minmax(17rem,1fr))]">
        {types.map((t, i) => (
          <Reveal as="li" key={t.id} index={i} variant="zoom">
            <Link href={t.href} data-ripple className="lift group flex h-full items-center gap-4 rounded-card border border-line bg-surface p-2.5 pr-5">
              <span className="relative h-[5.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-[12px] bg-forest">
                {t.cover && <Image src={t.cover.url} alt="" fill sizes="120px" quality={60} className="lift-photo object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-[1.3rem] leading-tight">{t.label}</span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-muted">{TYPE_COPY[t.id]}</span>
                <span className="mt-1.5 block text-xs font-semibold text-accent-ink">
                  {t.count} {t.count === 1 ? 'project' : 'projects'}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-muted transition-[transform,color] duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
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
