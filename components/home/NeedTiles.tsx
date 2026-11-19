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

// Shop by need: property types as photo cards, everyday needs as icon pills.
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
    <section aria-labelledby="needs-title" className="mx-auto max-w-container px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <SectionHeading index="02" kicker="Browse by need" id="needs-title" title={<>What are you <span className="text-accent-ink">looking for?</span></>} />

      <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:p-0">
        {types.map((t, i) => (
          <Reveal as="li" key={t.id} index={i} variant="clip" className="w-[80%] shrink-0 snap-start sm:w-auto">
            <Link href={t.href} className="group relative isolate block aspect-[16/10] overflow-hidden rounded-[18px] bg-forest sm:aspect-[16/9] sm:rounded-[22px] lg:aspect-[2/1]">
              {t.cover && (
                <div data-parallax="0.06" className="absolute inset-0" style={{ transform: 'scale(1.14)' }}>
                  <Image src={t.cover.url} alt="" fill sizes="(min-width: 640px) 33vw, 80vw" quality={60} className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]" />
                </div>
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white sm:p-6">
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl tracking-[-0.02em] text-white sm:text-3xl">{t.label}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-white/80">{TYPE_COPY[t.id]}</p>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-xs text-white/75">{t.count} {t.count === 1 ? 'project' : 'projects'}</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest transition-transform duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {needs.map((t, i) => (
          <Reveal as="li" key={t.id} index={i}>
            <Link
              href={t.href}
              data-ripple
              className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-[transform,border-color,box-shadow] duration-base ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_16px_34px_-24px_rgb(var(--shadow)/0.5)] active:scale-[0.98] sm:p-3.5"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand text-forest transition-colors duration-base group-hover:bg-accent group-hover:text-accent-on dark:text-brass">
                <NeedIcon name={t.icon} className="h-[22px] w-[22px] transition-transform duration-base group-hover:scale-110" />
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
