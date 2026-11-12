import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin } from 'lucide-react';
import type { Corridor, Developer, OfficeHub, Property, SiteSettings } from '@/lib/data/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Markdown } from '@/components/ui/Markdown';
import { GalleryMosaic } from '@/components/property/GalleryMosaic';
import { SectionNav } from '@/components/property/SectionNav';
import { ConfigTabs } from '@/components/property/ConfigTabs';
import { VerificationLedger } from '@/components/property/VerificationLedger';
import { CommuteRadar } from '@/components/property/CommuteRadar';
import { PropertyActions } from '@/components/property/PropertyActions';
import { RequestButton } from '@/components/property/RequestButton';
import { PropertyCard, ReraRow, StatusChip } from '@/components/property/PropertyCard';
import { AdvisorTitleBlock } from '@/components/home/AdvisorBlock';
import { ZoneDial } from '@/components/explore/ZoneDial';
import { zoneById, zoneOfCorridor } from '@/lib/regions';
import { propertyBreadcrumbs } from '@/lib/seo';
import { rateLabel, sizeLabel } from '@/lib/property';

const CostStudio = dynamic(() => import('@/components/property/CostStudio'), { loading: () => <div className="skeleton h-96 rounded-card" /> });

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'configurations', label: 'Configurations' },
  { id: 'floor-plans', label: 'Floor plans' },
  { id: 'verification', label: 'Verification' },
  { id: 'location', label: 'Location' },
  { id: 'costs', label: 'Costs' },
  { id: 'developer', label: 'Developer' },
];

function Section({ id, title, sheet, children }: { id: string; title: string; sheet: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[136px] border-t border-line py-10 first:border-t-0">
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
  allProperties: Property[];
  settings: SiteSettings;
};

export default function PropertyDetail({ property, developer, hubs, related, allProperties, settings }: Props) {
  const crumbs = propertyBreadcrumbs(property);
  const facts = [
    ['Configurations', property.configurations.map((c) => c.label).join(', ')],
    ['Size', sizeLabel(property)],
    ['Rate', rateLabel(property)],
    ['Possession', property.possession.label],
    ['Corridor', property.corridorName],
    ['Developer', property.developerName],
  ].filter((f): f is [string, string] => Boolean(f[1]));
  const nearby = property.highlights.filter((h) => /\b(near|opposite|link to|minutes? to)\b/i.test(h));
  const zone = zoneById(zoneOfCorridor(property.corridorId));
  const sameArea = allProperties.filter((p) => p.corridorId === property.corridorId && p.id !== property.id).length;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.geo ? `${property.geo.lat},${property.geo.lng}` : `${property.address}, Bengaluru`)}`;
  const developerFacts = developer
    ? [
        ['Years active', developer.yearsActive ? `${developer.yearsActive}+` : null, 'yearsActive'],
        ['Delivered', developer.sqftDelivered ? `${(developer.sqftDelivered / 1_000_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} million sq.ft` : null, 'sqftDelivered'],
        ['Construction', developer.constructionTech, 'constructionTech'],
      ]
        .map(([label, value, field]) => ({ label, value, source: developer.sources.find((s) => s.field === field) }))
        .filter((f) => f.value && f.source)
    : [];

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <StatusChip property={property} className="border border-line" />
          <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            {property.locality} · {property.corridorName} · by {property.developerName}
          </p>
        </div>
        <ReraRow property={property} className="max-w-full rounded-full border border-line bg-surface px-3 py-1.5" />
      </header>

      <div className="mt-5">
        <GalleryMosaic images={property.media.gallery} title={property.title} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <SectionNav sections={SECTIONS} />

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
                    <li key={a} className="rounded-md border border-line bg-surface px-2.5 py-1 text-sm">{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section id="configurations" title="Configurations" sheet="D-02">
            <ConfigTabs property={property} />
          </Section>

          <Section id="floor-plans" title="Floor plans" sheet="D-03">
            {property.media.floorPlans.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {property.media.floorPlans.map((plan) => (
                  <li key={plan.id} className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface">
                    <Image src={plan.url} alt={plan.alt} fill sizes="(min-width: 640px) 30vw, 100vw" className="object-contain" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
                <p className="max-w-md text-ink-muted">Floor plans for {property.title} are shared with the developer price sheet.</p>
                <RequestButton intent="price-sheet" message={`Please send the floor plans and price sheet for ${property.title}.`}>Get floor plans</RequestButton>
              </div>
            )}
          </Section>

          <Section id="verification" title="Verification" sheet="D-04">
            <VerificationLedger property={property} />
          </Section>

          <Section id="location" title="Location" sheet="D-05">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="panel flex gap-4 p-5">
                {zone && <ZoneDial zone={zone} size={52} />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{zone?.name ?? 'Bengaluru'}</p>
                  <p className="mt-1 text-lg font-semibold">{property.locality}</p>
                  <p className="text-sm text-ink-muted">{property.corridorName}</p>
                  <p className="mt-3 flex gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                    <span>{property.address}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[44px] px-4">
                      Open in Google Maps <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                    {sameArea > 0 && (
                      <Link href={`/properties?zone=${zoneOfCorridor(property.corridorId)}&corridor=${property.corridorId}`} className="btn-ghost min-h-[44px] px-4 text-accent-ink">
                        {sameArea} more in {property.corridorName} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {nearby.length > 0 ? (
                  <>
                    <h3 className="text-sm font-semibold">Nearby</h3>
                    <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                      {nearby.map((n) => (
                        <li key={n}>· {n}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">Ask the advisor for schools, hospitals and office commutes near {property.locality}.</p>
                )}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">Commute radar</h3>
              <div className="mt-4">
                <CommuteRadar property={property} hubs={hubs} disclaimer={settings.disclaimers.commute} />
              </div>
            </div>
          </Section>

          <Section id="costs" title="Cost studio" sheet="D-06">
            {property.transaction === 'sale' ? (
              <CostStudio costs={settings.costs} disclaimer={settings.disclaimers.costs} initialValue={property.priceMin} min={property.priceMin} max={Math.max(property.priceMax ?? 0, property.priceMin * 2.5)} idPrefix="detail-cost" />
            ) : (
              <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
                <p className="max-w-md text-ink-muted">This is a lease. Ask for the term sheet: rent escalation, deposit, lock-in and fit-out terms.</p>
                <RequestButton intent="price-sheet" message={`Please share the lease term sheet for ${property.title}.`}>Get term sheet</RequestButton>
              </div>
            )}
          </Section>

          <Section id="developer" title={property.developerName} sheet="D-07">
            {developer && <p className="max-w-2xl leading-relaxed text-ink-muted">{developer.about}</p>}
            {developerFacts.length > 0 && (
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                {developerFacts.map((f) => (
                  <div key={f.label as string} className="border-t border-line pt-2">
                    <dt className="text-2xs text-ink-muted">{f.label}</dt>
                    <dd className="font-serif text-xl">{f.value}</dd>
                    <dd className="text-2xs text-ink-muted">Source: {f.source!.label} · as of {f.source!.asOf}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href={`/properties?q=${encodeURIComponent(property.developerName)}`} className="mt-4 inline-flex min-h-[48px] items-center gap-1.5 text-sm text-accent-ink hover:underline">
              More from {property.developerName} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Section>
        </div>

        <PropertyActions property={property} settings={settings} advisorCard={<AdvisorTitleBlock settings={settings} compact />} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-10 border-t border-line pt-10">
          <p className="sheet-label">Same corridor</p>
          <h2 id="related-title" className="mt-1 font-serif text-2xl">More on {property.corridorName}</h2>
          <ul className="no-scrollbar -mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {related.map((p) => (
              <li key={p.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
                <PropertyCard property={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
