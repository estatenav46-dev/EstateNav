import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { DEFAULT_RADIUS, parkLabel, parkMatch, parksWithHomes } from '@/lib/techParks';
import { whatsAppLink } from '@/lib/contact';
import { NeedIcon } from '@/components/icons/NeedIcons';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

// Search by office: each tech park with the number of homes within 10 km, the closest one and a
// link to the explore page filtered to that park (nearest first).
export function TechParkTiles({ properties, whatsapp }: { properties: Property[]; whatsapp: string }) {
  const homes = properties.filter((p) => p.segment !== 'commercial' && p.transaction === 'sale');
  const parks = parksWithHomes(homes).slice(0, 8);
  if (!parks.length) return null;

  return (
    <section id="tech-parks" aria-labelledby="tech-parks-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading kicker="Search by tech park" id="tech-parks-title" title={<>Live close to <span className="text-accent-ink">where you work</span></>} />

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {parks.map(({ park, count, near }, i) => {
          // The closest home with a measured distance, else the first match.
          const ranked = near
            .map((p) => ({ p, m: parkMatch(p, park)! }))
            .sort((a, b) => a.m.sortKm - b.m.sortKm);
          const closest = ranked[0];
          return (
            <Reveal as="li" key={park.id} index={i} className="min-w-0">
              <Link
                href={`/properties?park=${park.id}`}
                data-track="techpark"
                data-track-park={park.id}
                className="lift group flex h-full flex-col rounded-card border border-line bg-surface p-2.5 sm:p-3"
              >
                <span className="relative block aspect-[16/9] overflow-hidden rounded-[12px] bg-forest">
                  {closest?.p.media.cover && (
                    <Image src={closest.p.media.cover.url} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" quality={55} className="lift-photo object-cover" />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm sm:text-[11px]">
                    {count} {count === 1 ? 'home' : 'homes'} within {DEFAULT_RADIUS} km
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col px-1 pt-2.5 sm:pt-3">
                  <span className="flex items-start gap-2">
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent-ink sm:inline-flex">
                      <NeedIcon name="techpark" className="h-[17px] w-[17px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight transition-colors group-hover:text-accent-ink sm:text-[0.95rem]">{park.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-muted">{park.area}</span>
                    </span>
                  </span>
                  {closest && (
                    <span className="mt-2 hidden truncate border-t border-line pt-2 text-xs text-ink-muted sm:block">
                      Closest: <span className="font-medium text-ink">{closest.p.title}</span>
                      {(closest.m.km != null || closest.m.mins != null) && ` · ${parkLabel(closest.m, park).replace(/ to .*$/, '')}`}
                    </span>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-accent-ink sm:text-sm">
                    See homes <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      <p className="mt-5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
        Office somewhere else?
        <a
          href={whatsAppLink(`Hi EstateNav, I'd like a home with an easy commute to my office. Can you suggest some?`, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-accent-ink"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> <span className="link-draw">Tell an advisor where you work</span>
        </a>
      </p>
    </section>
  );
}
