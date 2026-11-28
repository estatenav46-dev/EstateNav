import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUp, MessageCircle } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { liveZones, zoneOfCorridor, type Zone } from '@/lib/regions';
import { sortListings } from '@/lib/listingFilters';
import { formatINR } from '@/lib/price';
import { whatsAppLink } from '@/lib/contact';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

// Columns on large screens, chosen so the rows come out even (6 regions are 2 rows of 3, never
// 5 + 1). Tailwind needs whole class names.
const LG_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-3 xl:grid-cols-5',
  6: 'lg:grid-cols-3',
  7: 'lg:grid-cols-4',
  8: 'lg:grid-cols-4',
  9: 'lg:grid-cols-3',
};

function Direction({ zone }: { zone: Zone }) {
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-forest" aria-hidden="true">
      {zone.heading == null ? <span className="h-2 w-2 rounded-full bg-current" /> : <ArrowUp className="h-3.5 w-3.5" style={{ transform: `rotate(${zone.heading}deg)` }} />}
    </span>
  );
}

// Step 1: pick a part of the city. Only regions with live projects are shown, each with its
// best project's photo, the entry price and the projects to look at first.
export function RegionTiles({ properties, advisorName, whatsapp }: { properties: Property[]; advisorName: string; whatsapp: string }) {
  const ranked = sortListings(properties, 'relevance');
  const tiles = liveZones(properties)
    .map((zone) => {
      const list = ranked.filter((p) => zoneOfCorridor(p.corridorId) === zone.id);
      const prices = list.filter((p) => !p.priceOnRequest && p.transaction !== 'rent' && p.priceMin > 0).map((p) => p.priceMin);
      return { zone, list, from: prices.length ? Math.min(...prices) : null, areas: new Set(list.map((p) => p.corridorName)).size };
    })
    .filter((t) => t.list.length > 0)
    .sort((a, b) => b.list.length - a.list.length);
  if (!tiles.length) return null;
  const lgCols = LG_COLS[tiles.length] ?? 'lg:grid-cols-4';
  // One or two regions: a compact card with a modest photo beside the details, so a lone
  // region never turns into a full-width poster.
  const compact = tiles.length <= 2;

  return (
    <section id="regions" aria-labelledby="regions-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading
        kicker="Explore by region"
        id="regions-title"
        title={<>Where do you <span className="text-accent-ink">want to live?</span></>}
        action={
          <Link href="/properties" className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
            All of Bengaluru
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong transition-[transform,border-color] duration-base group-hover:translate-x-1 group-hover:border-ink">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        }
      />

      {/* Phones: every region at once in two columns (no sideways scrolling); larger screens: even rows. */}
      <ul className={`mt-6 grid gap-x-3 gap-y-5 sm:mt-7 sm:gap-x-5 sm:gap-y-6 ${tiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${lgCols}`}>
        {tiles.map(({ zone, list, from, areas }, i) => (
          <Reveal as="li" key={zone.id} index={i} variant="zoom" className="min-w-0">
            <Link
              href={`/properties?zone=${zone.id}`}
              data-track="region"
              data-track-zone={zone.id}
              className={`group flex h-full flex-col rounded-card outline-offset-4 ${compact ? 'sm:flex-row sm:items-stretch sm:gap-6 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:p-3 sm:pr-6' : ''}`}
            >
              <span className={`relative block overflow-hidden rounded-card bg-forest ${compact ? 'aspect-[16/10] sm:aspect-auto sm:h-44 sm:w-[min(40%,17rem)] sm:shrink-0 sm:rounded-[12px]' : 'aspect-[4/3] sm:aspect-[3/2]'}`}>
                {list[0]?.media.cover && (
                  <Image src={list[0].media.cover.url} alt="" fill sizes={compact ? '(min-width: 640px) 320px, 100vw' : '(min-width: 1024px) 32vw, 48vw'} quality={60} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold sm:left-3.5 sm:top-3.5 sm:px-2.5 sm:py-1 sm:text-[11px] text-white ring-1 ring-white/20 backdrop-blur-sm">
                  {list.length} {list.length === 1 ? 'project' : 'projects'}
                </span>
                <span className="absolute right-2.5 top-2.5 sm:right-3.5 sm:top-3.5">
                  <Direction zone={zone} />
                </span>
              </span>
              <span className={`flex min-w-0 flex-1 flex-col pt-2.5 sm:pt-4 ${compact ? 'sm:justify-center sm:py-2' : ''}`}>
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span className="font-serif text-[1.15rem] leading-tight transition-colors group-hover:text-accent-ink sm:text-[1.35rem]">{zone.short}</span>
                  {from && (
                    <span className="shrink-0 text-xs text-ink-muted sm:text-sm">
                      from <span className="tabular font-semibold text-ink">{formatINR(from)}</span>
                    </span>
                  )}
                </span>
                <span className="mt-1 line-clamp-1 text-xs text-ink-muted sm:text-sm">{zone.areas}</span>
                <span className="mt-2.5 hidden border-t border-line pt-2.5 text-sm text-ink sm:line-clamp-2">
                  {list.slice(0, 2).map((p) => p.title).join(' · ')}
                  {list.length > 2 && <span className="text-ink-muted"> · +{list.length - 2} more</span>}
                </span>
                <span className="mt-auto hidden items-center justify-between pt-3 text-sm sm:flex">
                  <span className="text-ink-muted">
                    {areas} {areas === 1 ? 'area' : 'areas'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-accent-ink">
                    Explore {zone.short} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <p className="mt-5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
        Not sure which side of the city suits you?
        <a
          href={whatsAppLink(`Hi EstateNav, I'm not sure which part of Bengaluru suits me. Can you help?`, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-accent-ink"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> <span className="link-draw">Ask an advisor on WhatsApp</span>
        </a>
      </p>
    </section>
  );
}
