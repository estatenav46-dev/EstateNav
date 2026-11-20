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

// Columns on large screens, by how many regions have projects (Tailwind needs whole class names).
const LG_COLS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

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
  const lgCols = LG_COLS[tiles.length] ?? 'lg:grid-cols-3 xl:grid-cols-5';

  return (
    <section id="regions" aria-labelledby="regions-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <SectionHeading
        index="01"
        kicker="Explore by region"
        id="regions-title"
        title={<>Where do you <span className="text-accent-ink">want to live?</span></>}
        action={
          <Link href="/properties" className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
            All of Bengaluru
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line transition-transform duration-base group-hover:translate-x-1 group-hover:border-accent">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        }
      />

      <ul className={`mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 ${lgCols}`}>
        {tiles.map(({ zone, list, from, areas }, i) => (
          <Reveal as="li" key={zone.id} index={i} variant="zoom">
            <Link
              href={`/properties?zone=${zone.id}`}
              data-track="region"
              data-track-zone={zone.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface outline-offset-4 transition-[transform,box-shadow,border-color] duration-base hover:border-line-strong [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_22px_44px_-30px_rgb(var(--shadow)/0.7)]"
            >
              <span className="relative block h-36 overflow-hidden bg-forest sm:h-40">
                {list[0]?.media.cover && (
                  <Image src={list[0].media.cover.url} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 100vw" quality={55} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/20">
                  {list.length} {list.length === 1 ? 'project' : 'projects'}
                </span>
                <span className="absolute right-3 top-3">
                  <Direction zone={zone} />
                </span>
                <span className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2 text-white">
                  <span className="font-serif text-xl leading-tight">{zone.short}</span>
                  {from && (
                    <span className="text-right text-[11px] leading-tight text-white/80">
                      from <span className="block font-serif text-base text-white">{formatINR(from)}</span>
                    </span>
                  )}
                </span>
              </span>
              <span className="flex flex-1 flex-col gap-2 p-3">
                <span className="line-clamp-1 text-xs text-ink-muted">{zone.areas}</span>
                <span className="flex flex-wrap gap-1">
                  {list.slice(0, 2).map((p) => (
                    <span key={p.id} className="max-w-full truncate rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium">
                      {p.title}
                    </span>
                  ))}
                  {list.length > 2 && <span className="rounded-md px-1 py-0.5 text-[11px] text-ink-muted">+{list.length - 2} more</span>}
                </span>
                <span className="mt-auto flex items-center justify-between pt-1 text-xs">
                  <span className="text-ink-muted">
                    {areas} {areas === 1 ? 'area' : 'areas'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-accent-ink">
                    Explore {zone.short} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <p className="mt-3 flex flex-wrap items-center justify-end gap-x-1.5 text-xs text-ink-muted">
        Not sure which side of the city suits you?
        <a
          href={whatsAppLink(`Hi ${advisorName}, I'm not sure which part of Bengaluru suits me. Can you help?`, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Ask {advisorName.split(' ')[0]} on WhatsApp
        </a>
      </p>
    </section>
  );
}
