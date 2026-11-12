import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bell } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { comingSoonZones, liveZones, zoneOfCorridor } from '@/lib/regions';
import { whatsAppLink } from '@/lib/contact';
import { ZoneDial } from '@/components/explore/ZoneDial';

// Step 1 of browsing: pick a part of the city. No map; each region carries a direction badge.
export function RegionTiles({ properties, advisorName, whatsapp }: { properties: Property[]; advisorName: string; whatsapp: string }) {
  const zones = liveZones(properties).map((zone) => {
    const list = properties.filter((p) => zoneOfCorridor(p.corridorId) === zone.id);
    return { zone, count: list.length, thumbs: list.slice(0, 3).map((p) => p.media.cover) };
  });
  const soon = comingSoonZones();

  return (
    <section id="regions" aria-labelledby="regions-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-ink">Step 1 · Choose a region</p>
          <h2 id="regions-title" className="mt-1 font-serif text-2xl sm:text-3xl">Where do you want to live?</h2>
        </div>
        <Link href="/properties" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent-ink hover:underline sm:inline-flex">
          All of Bengaluru <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {zones.map(({ zone, count, thumbs }) => (
          <li key={zone.id}>
            <Link
              href={`/properties?zone=${zone.id}`}
              className={`zone-${zone.id} group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition-[transform,border-color,box-shadow] duration-base ease-out hover:-translate-y-0.5 hover:border-[rgb(var(--tint)/0.45)] hover:shadow-[0_16px_36px_-24px_rgb(var(--shadow)/0.5)] active:scale-[0.98] sm:p-5`}
            >
              <span className="flex items-start justify-between gap-2">
                <ZoneDial zone={zone} size={48} />
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink">
                  {count} {count === 1 ? 'project' : 'projects'}
                </span>
              </span>
              <span className="mt-4 block font-serif text-xl leading-tight sm:text-2xl">
                {zone.short} <span className="text-base font-medium text-ink-muted">Bengaluru</span>
              </span>
              <span className="mt-1 line-clamp-2 text-xs text-ink-muted sm:text-sm">{zone.areas}</span>
              <span className="mt-auto flex items-center justify-between pt-4">
                <span className="flex -space-x-2" aria-hidden="true">
                  {thumbs.map((img, i) => (
                    <span key={i} className="relative h-7 w-7 overflow-hidden rounded-full bg-surface-2 ring-2 ring-surface">
                      <Image src={img.url} alt="" fill sizes="28px" quality={40} className="object-cover" />
                    </span>
                  ))}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--tint)/0.12)] text-[rgb(var(--tint))] transition-transform duration-base group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Explore {zone.name}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {soon.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          <span>Coming soon: {soon.map((z) => z.name).join(' and ')}.</span>
          <a
            href={whatsAppLink(`Hi ${advisorName}, please tell me when you list projects in ${soon.map((z) => z.name).join(' or ')}.`, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-1 font-semibold text-accent-ink hover:underline"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden="true" /> Get notified
          </a>
        </p>
      )}
    </section>
  );
}
