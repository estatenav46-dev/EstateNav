import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bell } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { comingSoonZones, liveZones, zoneOfCorridor } from '@/lib/regions';
import { sortListings } from '@/lib/listingFilters';
import { whatsAppLink } from '@/lib/contact';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

// Step 1: pick a part of the city. Each region is a photo card from its own projects.
export function RegionTiles({ properties, advisorName, whatsapp }: { properties: Property[]; advisorName: string; whatsapp: string }) {
  const ranked = sortListings(properties, 'relevance');
  const zones = liveZones(properties).map((zone) => {
    const list = ranked.filter((p) => zoneOfCorridor(p.corridorId) === zone.id);
    return { zone, count: list.length, cover: list[0]?.media.cover };
  });
  const soon = comingSoonZones(properties);

  return (
    <section id="regions" aria-labelledby="regions-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <SectionHeading
        index="01"
        kicker="Explore by region"
        id="regions-title"
        title={<>Where do you <span className="text-accent-ink">want to live?</span></>}
        action={
          <Link href="/properties" className="group inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
            All of Bengaluru
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line transition-transform duration-base group-hover:translate-x-1 group-hover:border-accent">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        }
      />

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-4">
        {zones.map(({ zone, count, cover }, i) => (
          <Reveal as="li" key={zone.id} index={i} variant="clip">
            <Link
              href={`/properties?zone=${zone.id}`}
              data-track="region"
              data-track-zone={zone.id}
              className="group relative isolate block aspect-[4/5] overflow-hidden rounded-[20px] bg-forest shadow-[0_24px_50px_-30px_rgb(var(--shadow)/0.6)] outline-offset-4 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:hover:-translate-y-2 [@media(hover:hover)]:hover:shadow-[0_40px_70px_-34px_rgb(var(--shadow)/0.75)] sm:rounded-[28px]"
            >
              {cover && (
                <div data-parallax="0.07" className="absolute inset-0" style={{ transform: 'scale(1.14)' }}>
                  <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" quality={60} className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]" />
                </div>
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-opacity duration-slow group-hover:opacity-90" />
              <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/20 sm:left-5 sm:top-5">
                {count} {count === 1 ? 'project' : 'projects'}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                <p className="text-xs text-white/70">Bengaluru</p>
                <h3 className="mt-0.5 font-serif text-[1.5rem] leading-none tracking-[-0.02em] text-white sm:text-[1.9rem]">{zone.short}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-white/80 sm:text-sm">{zone.areas}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="hidden sm:inline">Explore {zone.short}</span>
                  <span className="sm:hidden">Explore</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-forest transition-transform duration-base group-hover:translate-x-1">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>

      {soon.length > 0 && (
        <Reveal variant="zoom" className="mt-3 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5">
          {soon.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-dashed border-line-strong bg-sand/60 px-5 py-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {zone.name} <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted">Coming soon</span>
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">{zone.areas}</p>
              </div>
              <a
                href={whatsAppLink(`Hi ${advisorName}, please tell me when you list projects in ${zone.name}.`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[44px] shrink-0 rounded-full px-4"
              >
                <Bell className="h-4 w-4 text-brass" aria-hidden="true" /> Notify me
              </a>
            </div>
          ))}
        </Reveal>
      )}
    </section>
  );
}
