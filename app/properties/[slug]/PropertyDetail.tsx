import Link from 'next/link';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import type { Corridor, Developer, OfficeHub, Property, SiteSettings } from '@/lib/data/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Markdown } from '@/components/ui/Markdown';
import { GalleryMosaic } from '@/components/property/GalleryMosaic';
import { PropertyActions } from '@/components/property/PropertyActions';
import { ReraRow, StatusChip } from '@/components/property/PropertyCard';
import { AdvisorTitleBlock } from '@/components/home/AdvisorBlock';
import { zoneById, zoneOfCorridor } from '@/lib/regions';
import { propertyBreadcrumbs } from '@/lib/seo';
import { priceLabel, rateLabel, sizeLabel } from '@/lib/property';
import type { SimilarMatch } from '@/lib/similar';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { AutoCompare } from '@/components/property/AutoCompare';
import { TrackView } from '@/components/property/TrackView';
import { DetailsOnRequest } from '@/components/property/DetailsOnRequest';
import { Reveal, Words } from '@/components/Reveal';

function Section({ id, title, sheet, children }: { id: string; title: string; sheet: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[96px] border-t border-line py-10 first:border-t-0">
      <p className="sheet-label">{sheet}</p>
      <h2 id={`${id}-title`} className="mt-1 font-serif text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

type Props = {
  property: Property;
  developer: Developer | null;
  corridors: Corridor[];
  hubs: OfficeHub[];
  related: Property[];
  similar: SimilarMatch[];
  allProperties: Property[];
  settings: SiteSettings;
};

export default function PropertyDetail({ property, similar, allProperties, settings }: Props) {
  const crumbs = propertyBreadcrumbs(property);
  const facts = [
    ['Configurations', property.configurations.map((c) => c.label).join(', ')],
    ['Size', sizeLabel(property)],
    ['Rate', rateLabel(property)],
    ['Possession', property.possession.label],
    ['Corridor', property.corridorName],
    ['Developer', property.developerName],
  ].filter((f): f is [string, string] => Boolean(f[1]));
  const zone = zoneById(zoneOfCorridor(property.corridorId));

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-16">
      <TrackView property={property} />
      <Breadcrumbs items={crumbs} />

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <StatusChip property={property} className="border border-line" />
          <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            {property.locality} · {property.corridorName} · by {property.developerName}
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
            <span className="tabular font-serif text-2xl sm:text-3xl">
              {priceLabel(property)}
              <sup className="ml-0.5 text-base text-brass">*</sup>
            </span>
            {rateLabel(property) && <span className="text-sm text-ink-muted">{rateLabel(property)}</span>}
          </p>
          <p className="mt-1 max-w-xl text-xs text-ink-muted">
            *Approximate developer guide price; terms and conditions apply. The final price varies by unit, floor and current offers.{' '}
            <Link href={`/contact?intent=price-sheet&property=${property.slug}`} className="font-semibold text-accent-ink hover:underline">
              Contact us for the latest price sheet
            </Link>
            .
          </p>
        </div>
        <ReraRow property={property} className="max-w-full rounded-full border border-line bg-surface px-3 py-1.5" />
      </header>

      <div className="mt-5">
        <GalleryMosaic images={property.media.gallery} title={property.title} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <Section id="overview" title="Overview" sheet="D-01">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-0 border-t border-line pt-2">
                  <dt className="text-2xs text-ink-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <Markdown source={property.description} className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted" />
            {property.highlights.length > 0 && (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {property.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-2xs text-ink-muted">Highlights are as stated by the developer.</p>
            {property.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium">Amenities</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {property.amenities.map((a) => (
                    <li key={a} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <DetailsOnRequest property={property} settings={settings} />
        </div>

        <PropertyActions property={property} settings={settings} advisorCard={<AdvisorTitleBlock settings={settings} compact />} />
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-14 border-t border-line pt-10">
          <Reveal variant="words" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="rw-fade flex items-center gap-3 text-sm font-medium text-ink-muted">
                <span aria-hidden="true" className="rw-line h-px w-8 bg-brass/60" /> Similar homes
              </p>
              <h2 id="similar-title" className="mt-2 font-serif text-[1.85rem] leading-tight tracking-[-0.025em] sm:text-[2.4rem]">
                <Words>
                  <>Also worth a look near <span className="text-accent-ink">{property.corridorName}</span></>
                </Words>
              </h2>
            </div>
            <Link href={`/properties?zone=${zoneOfCorridor(property.corridorId)}`} className="arrow-host group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
              More in {zone?.short ?? 'this region'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
          {/* Phones swipe sideways (no vertical play); larger screens get a fixed grid, no scrolling. */}
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-4 pb-3 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-0 lg:grid-cols-4">
            {similar.slice(0, 4).map(({ property: p, reasons }, i) => (
              <Reveal as="li" key={p.id} index={i} variant="zoom" className="w-[80%] shrink-0 snap-start sm:w-auto">
                <ExploreCard property={p} reasons={reasons} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 80vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <AutoCompare
        base={property}
        suggested={similar.map((m) => m.property)}
        pool={allProperties.filter((p) => p.segment === property.segment && p.transaction === property.transaction)}
      />
    </main>
  );
}
