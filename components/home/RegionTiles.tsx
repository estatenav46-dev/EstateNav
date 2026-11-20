import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUp, Bell, MessageCircle } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { ZONES, comingSoonZones, liveZones, zoneOfCorridor, type Zone } from '@/lib/regions';
import { sortListings } from '@/lib/listingFilters';
import { whatsAppLink } from '@/lib/contact';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

// Where each region sits on the desktop compass (3 × 3 grid, north at the top).
const PLACE: Record<string, string> = {
  north: 'lg:col-start-2 lg:row-start-1',
  west: 'lg:col-start-1 lg:row-start-2',
  central: 'lg:col-start-2 lg:row-start-2',
  east: 'lg:col-start-3 lg:row-start-2',
  south: 'lg:col-start-2 lg:row-start-3',
  'south-east': 'lg:col-start-3 lg:row-start-3',
  other: 'lg:col-start-1 lg:row-start-3',
};

function Heading({ zone, light }: { zone: Zone; light: boolean }) {
  return (
    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${light ? 'bg-white/90 text-forest' : 'bg-surface text-ink-muted ring-1 ring-line'}`} aria-hidden="true">
      {zone.heading == null ? <span className="h-2 w-2 rounded-full bg-current" /> : <ArrowUp className="h-3.5 w-3.5" style={{ transform: `rotate(${zone.heading}deg)` }} />}
    </span>
  );
}

// Step 1: pick a part of the city. On desktop the regions sit where they are on a compass;
// open regions are photo tiles from their own projects, the rest are "coming soon".
export function RegionTiles({ properties, advisorName, whatsapp }: { properties: Property[]; advisorName: string; whatsapp: string }) {
  const ranked = sortListings(properties, 'relevance');
  const soonIds = new Set(comingSoonZones(properties).map((z) => z.id));
  const other = liveZones(properties).find((z) => z.id === 'other');
  const tiles = [...ZONES, ...(other ? [other] : [])].map((zone) => {
    const list = ranked.filter((p) => zoneOfCorridor(p.corridorId) === zone.id);
    return { zone, count: list.length, cover: list[0]?.media.cover, soon: soonIds.has(zone.id) };
  });
  const areas = new Set(properties.map((p) => p.corridorId)).size;

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

      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 lg:auto-rows-[8.25rem] lg:gap-3">
        {/* Compass legend (top-left corner on desktop). */}
        <li className="col-span-2 sm:col-span-3 lg:col-span-1 lg:col-start-1 lg:row-start-1">
          <div className="flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4">
            <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0 text-ink" aria-hidden="true">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeOpacity="0.2" />
              <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="2 3" />
              <path d="M32 8 L37 32 L32 28 L27 32 Z" fill="rgb(var(--accent))" />
              <path d="M32 56 L27 32 L32 36 L37 32 Z" fill="currentColor" fillOpacity="0.35" />
              <text x="32" y="6.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">N</text>
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Bengaluru by direction</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {properties.length} verified projects across {areas} areas. Pick a side of the city.
              </p>
            </div>
          </div>
        </li>

        {tiles.map(({ zone, count, cover, soon }, i) => (
          <Reveal as="li" key={zone.id} index={i} variant="zoom" className={PLACE[zone.id] ?? ''}>
            {soon ? (
              <div className="flex h-32 flex-col justify-between rounded-2xl border border-dashed border-line-strong bg-sand/50 p-3.5 lg:h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg leading-tight">{zone.short}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{zone.areas}</p>
                  </div>
                  <Heading zone={zone} light={false} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Coming soon</span>
                  <a
                    href={whatsAppLink(`Hi ${advisorName}, please tell me when you list projects in ${zone.name}.`, whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold ring-1 ring-line hover:ring-line-strong"
                  >
                    <Bell className="h-3 w-3 text-brass" aria-hidden="true" /> Notify me
                  </a>
                </div>
              </div>
            ) : (
              <Link
                href={`/properties?zone=${zone.id}`}
                data-track="region"
                data-track-zone={zone.id}
                className="group relative isolate flex h-32 flex-col justify-end overflow-hidden rounded-2xl bg-forest p-3.5 text-white outline-offset-4 transition-[transform,box-shadow] duration-base [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_20px_40px_-24px_rgb(var(--shadow)/0.7)] lg:h-full"
              >
                {cover && <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 26vw, 45vw" quality={55} className="-z-10 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]" />}
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/20">
                  {count} {count === 1 ? 'project' : 'projects'}
                </span>
                <span className="absolute right-3 top-3">
                  <Heading zone={zone} light />
                </span>
                <h3 className="font-serif text-lg leading-tight text-white sm:text-xl">{zone.short}</h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{zone.areas}</p>
              </Link>
            )}
          </Reveal>
        ))}

        {/* Advisor (top-right corner on desktop). */}
        <li className="hidden lg:col-start-3 lg:row-start-1 lg:block">
          <a
            href={whatsAppLink(`Hi ${advisorName}, I'm not sure which part of Bengaluru suits me. Can you help?`, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col justify-between rounded-2xl bg-forest p-4 text-forest-on"
          >
            <p className="text-sm font-semibold">Not sure which side of the city?</p>
            <p className="text-xs text-forest-on/75">Tell {advisorName.split(' ')[0]} your office, school and budget; get the right areas in one message.</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brass">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>
        </li>

        {/* All of Bengaluru (bottom-left corner when no "other" tile uses it). */}
        {!other && (
          <li className="hidden lg:col-start-1 lg:row-start-3 lg:block">
            <Link href="/properties" className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-4 hover:border-line-strong">
              <p className="text-sm font-semibold">See every project</p>
              <p className="text-xs text-ink-muted">Filter by area, budget, BHK, builder and possession.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
                Explore all {properties.length} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
