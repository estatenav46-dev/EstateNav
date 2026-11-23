import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgePercent, Check, Clock, MapPin } from 'lucide-react';
import type { Corridor, Developer, NearbyPlace, OfficeHub, Property, SiteSettings } from '@/lib/data/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Markdown } from '@/components/ui/Markdown';
import { GalleryMosaic } from '@/components/property/GalleryMosaic';
import { PropertyActions } from '@/components/property/PropertyActions';
import { ReraRow, StatusChip } from '@/components/property/PropertyCard';
import { zoneById, zoneOfCorridor } from '@/lib/regions';
import { propertyBreadcrumbs } from '@/lib/seo';
import { activeOffer, priceLabel, rateLabel, sizeLabel } from '@/lib/property';
import { NEARBY_CATEGORY_LABEL, NEARBY_GROUPS, PROPERTY_TYPE_LABEL, groupAmenities } from '@/lib/listingMeta';
import type { SimilarMatch } from '@/lib/similar';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { AutoCompare } from '@/components/property/AutoCompare';
import { TrackView } from '@/components/property/TrackView';
import { WhatsAppTopic } from '@/components/contact/WhatsAppTopic';
import { projectEnquiryLink, projectEnquiryText } from '@/lib/contact';
import { WhatsAppGlyph } from '@/components/contact/WhatsAppGlyph';
import { enquiryFromProperty } from '@/lib/enquiry';
import { DetailsOnRequest } from '@/components/property/DetailsOnRequest';
import { SectionNav } from '@/components/property/SectionNav';
import { ConfigExplorer } from '@/components/property/ConfigExplorer';
import { PlanGallery } from '@/components/property/PlanGallery';
import { DocumentList } from '@/components/property/DocumentList';
import { VerificationLedger } from '@/components/property/VerificationLedger';
import { CommuteRadar } from '@/components/property/CommuteRadar';
import { ChargesTable, PaymentPlan } from '@/components/property/CostBreakdown';
import { Reveal, Words } from '@/components/Reveal';

/** One chapter of the project page: a hairline above, a serif title, then its content. */
function Section({ id, title, children, aside }: { id: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 border-t border-line pt-6 first-of-type:border-t-0 first-of-type:pt-1 sm:pt-7 sm:first-of-type:pt-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id={`${id}-title`} className="font-serif text-[1.4rem] leading-tight sm:text-[1.6rem]">
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const monthYear = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.valueOf()) ? null : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const distance = (n: NearbyPlace) => [n.distanceKm != null ? `${Number(n.distanceKm.toFixed(1))} km` : null, n.travelMins ? `${n.travelMins} min` : null].filter(Boolean).join(' · ');

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

export default function PropertyDetail({ property, developer, hubs, similar, allProperties, settings }: Props) {
  const crumbs = propertyBreadcrumbs(property);
  const f = property.facts;
  const facts = [
    ['Property type', PROPERTY_TYPE_LABEL[property.propertyType]],
    ['Configurations', property.configurations.map((c) => c.label).join(', ')],
    ['Size', sizeLabel(property)],
    ['Rate', rateLabel(property)],
    ['Land area', f.landAcres ? `${Number(f.landAcres.toFixed(2))} acres` : null],
    ['Units', f.totalUnits ? f.totalUnits.toLocaleString('en-IN') : null],
    ['Towers', f.towers ? String(f.towers) : null],
    ['Floors', f.floors],
    ['Open space', f.openSpacePct != null ? `${f.openSpacePct}%` : null],
    ['Clubhouse', [f.clubhouseSqft ? `${f.clubhouseSqft.toLocaleString('en-IN')} sq.ft` : null, f.clubhouseDetails].filter(Boolean).join(' · ') || null],
    ['Facing', f.facing],
    ['Phase', property.phase || null],
    ['Launched', monthYear(f.launchDate)],
    ['Possession', property.possession.label],
    ['RERA completion', monthYear(property.possession.reraDate)],
    ['Area', property.corridorName],
    ['Developer', property.developerName],
  ].filter((x): x is [string, string] => Boolean(x[1]));
  const zone = zoneById(zoneOfCorridor(property.corridorId));
  const offer = activeOffer(property);
  const amenityGroups = groupAmenities(property.amenities);
  const plansCount = property.media.floorPlans.length + (property.media.masterPlan ? 1 : 0);
  const nearbyGroups = NEARBY_GROUPS.map((g) => ({ ...g, items: property.nearby.filter((n) => g.categories.includes(n.category)) })).filter((g) => g.items.length);
  const commuteHubs = hubs.filter((h) => property.commute.some((c) => c.hubId === h.id));
  const extraGroups = Array.from(new Set(property.extraDetails.map((x) => x.group || 'More details'))).map((group) => ({ group, items: property.extraDetails.filter((x) => (x.group || 'More details') === group) }));
  const hasVerification = Boolean(property.rera.number || property.approvals.khata || property.approvals.planAuthority || property.approvals.titleCheck || property.bankApprovals.length);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.geo ? `${property.geo.lat},${property.geo.lng}` : `${property.address || property.locality}, Bengaluru`)}`;
  const developerFacts = developer
    ? (
        [
          ['Years active', developer.yearsActive ? `${developer.yearsActive}+` : null, 'yearsActive'],
          ['Projects delivered', developer.projectsDelivered ? developer.projectsDelivered.toLocaleString('en-IN') : null, 'projectsDelivered'],
          ['Area delivered', developer.sqftDelivered ? `${(developer.sqftDelivered / 1_000_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} million sq.ft` : null, 'sqftDelivered'],
          ['Construction', developer.constructionTech, 'constructionTech'],
        ] as const
      )
        .map(([label, value, field]) => ({ label, value, source: developer.sources.find((s) => s.field === field) }))
        .filter((x) => x.value && x.source)
    : [];

  const sections = [
    { id: 'overview', label: 'Overview' },
    property.configurations.length > 0 && { id: 'units', label: property.segment === 'plot' ? 'Plots & prices' : 'Configurations' },
    property.charges.length > 0 && { id: 'charges', label: 'Price breakdown' },
    (property.paymentPlan.stages.length > 0 || Boolean(property.paymentPlan.type)) && { id: 'payment', label: 'Payment plan' },
    (property.description || property.highlights.length > 0) && { id: 'about', label: 'About' },
    plansCount > 0 && { id: 'plans', label: 'Floor plans' },
    amenityGroups.length > 0 && { id: 'amenities', label: 'Amenities' },
    property.specifications.length > 0 && { id: 'specifications', label: 'Specifications' },
    { id: 'location', label: 'Location' },
    hasVerification && { id: 'verification', label: 'RERA & approvals' },
    property.documents.length > 0 && { id: 'documents', label: 'Documents' },
    extraGroups.length > 0 && { id: 'more', label: 'More details' },
    developer && (developer.about || developerFacts.length > 0) && { id: 'developer', label: 'Developer' },
  ].filter((s): s is { id: string; label: string } => Boolean(s));
  const keyFacts = [
    ['Configurations', property.configurations.map((c) => c.label).join(', ') || null],
    ['Size', sizeLabel(property)],
    ['Rate', rateLabel(property)],
    ['Possession', property.possession.label],
    ['Land area', f.landAcres ? `${Number(f.landAcres.toFixed(2))} acres` : null],
    ['Units', f.totalUnits ? f.totalUnits.toLocaleString('en-IN') : null],
    ['Towers', f.towers ? String(f.towers) : null],
    ['Area', property.corridorName],
  ].filter((x): x is [string, string] => Boolean(x[1])).slice(0, 6);
  const inStrip = new Set(keyFacts.map(([label]) => label));
  const moreFacts = facts.filter(([label]) => !inStrip.has(label));
  const plans = [...(property.media.masterPlan ? [property.media.masterPlan] : []), ...property.media.floorPlans];
  const photos = property.media.gallery.length ? property.media.gallery : [property.media.cover];
  const rate = rateLabel(property);

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-16">
      <TrackView property={property} />
      <WhatsAppTopic text={projectEnquiryText(enquiryFromProperty(property), settings.agent.name)} />
      <div className="hidden sm:block">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Phones see the photos first, then the name, price and key facts; larger screens lead with the name. */}
      <div className="flex flex-col">
      <header className="mt-4 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip property={property} className="border border-line" />
            {offer && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/15 px-2.5 py-1 text-2xs font-semibold text-ink">
                <BadgePercent className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
                {offer.text}
                {offer.validUntil && <span className="font-normal text-ink-muted">· till {new Date(`${offer.validUntil}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
              </span>
            )}
          </div>
          <h1 className="mt-2.5 font-serif text-[1.85rem] leading-[1.08] sm:mt-3 sm:text-[2.4rem] lg:text-[2.6rem]">{property.title}</h1>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-muted sm:mt-2 sm:text-[0.95rem]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>
              {[property.locality, property.corridorName, property.developerName && `by ${property.developerName}`].filter(Boolean).join(' · ')}
            </span>
          </p>
        </div>
        <div className="shrink-0 md:text-right">
          <p className="tabular text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[1.9rem]">
            {priceLabel(property)}
            {!property.priceOnRequest && <sup className="ml-0.5 text-sm text-brass">*</sup>}
          </p>
          {(rate || (property.priceNote && !property.priceOnRequest)) && (
            <p className="mt-0.5 text-sm text-ink-muted">{[rate, property.priceOnRequest ? null : property.priceNote].filter(Boolean).join(' · ')}</p>
          )}
          <ReraRow property={property} className="mt-1.5 md:justify-end" />
          {/* The project's own enquiry, visible as soon as the page opens (phones have it in the bottom bar). */}
          <a
            href={projectEnquiryLink(enquiryFromProperty(property), settings.agent.name, settings.contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta"
            data-track-kind="whatsapp-project"
            className="btn-whatsapp mt-3 hidden md:inline-flex"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
              <WhatsAppGlyph size={18} />
            </span>
            Enquire now on WhatsApp
          </a>
        </div>
      </header>

      <div className="order-first mt-1 sm:order-none sm:mt-5">
        <GalleryMosaic images={photos} title={property.title} plans={plans} />
      </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-4 sm:grid-cols-3 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr">
        {keyFacts.map(([label, value]) => (
          <div key={label} className="min-w-0 lg:border-l lg:border-line lg:pl-5 lg:first:border-l-0 lg:first:pl-0">
            <dt className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
            <dd className="mt-1 truncate text-[0.95rem] font-semibold" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0 space-y-8 sm:space-y-10">
          {sections.length > 2 && <SectionNav sections={sections} />}

        <Section id="overview" title="Project facts">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]">
            {(moreFacts.length >= 2 ? moreFacts : facts).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
                <dd className="mt-1 text-[0.95rem] font-medium leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {property.configurations.length > 0 && (
          <Section id="units" title={property.segment === 'plot' ? 'Plot sizes & prices' : 'Configurations & prices'}>
            <ConfigExplorer property={property} />
          </Section>
        )}

        {property.charges.length > 0 && (
          <Section id="charges" title="Price breakdown & other charges">
            <ChargesTable property={property} />
          </Section>
        )}

        {(property.paymentPlan.stages.length > 0 || Boolean(property.paymentPlan.type)) && (
          <Section id="payment" title="Payment plan">
            <PaymentPlan property={property} />
          </Section>
        )}

        {(property.description || property.highlights.length > 0) && (
        <Section id="about" title="About the project">
          {property.description && <Markdown source={property.description} className="max-w-[68ch] text-[0.95rem] leading-relaxed text-ink-muted sm:text-base" />}
          {property.highlights.length > 0 && (
            <>
              <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {property.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[0.95rem]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink"><Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /></span>
                    {h}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-2xs text-ink-muted">Highlights are as stated by the developer.</p>
            </>
          )}
        </Section>
        )}

        {plansCount > 0 && (
          <Section id="plans" title={property.media.masterPlan ? 'Master plan & floor plans' : 'Floor plans'}>
            <PlanGallery property={property} />
          </Section>
        )}

        {amenityGroups.length > 0 && (
          <Section id="amenities" title="Amenities">
            <div className={`grid gap-x-8 gap-y-6 ${amenityGroups.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {amenityGroups.map((g) => (
                <div key={g.id}>
                  <h3 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{g.label}</h3>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {g.items.map((a) => (
                      <li key={a} className="rounded-full border border-line bg-surface px-3 py-1 text-[13px]">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {property.specifications.length > 0 && (
          <Section id="specifications" title="Specifications">
            <dl className="divide-y divide-line border-y border-line">
              {property.specifications.map((spec) => (
                <div key={spec.id} className="grid gap-0.5 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold">{spec.category}</dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">{spec.detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-2xs text-ink-muted">As per the developer&apos;s brochure; specifications can change. Confirm with the agreement of sale.</p>
          </Section>
        )}

        <Section id="location" title="Location & connectivity">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4">
            <div className="min-w-0">
              <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{zone?.name ?? 'Bengaluru'}</p>
              <p className="mt-1 font-serif text-xl">{property.locality}</p>
              <p className="text-sm text-ink-muted">{property.corridorName}, Bengaluru, Karnataka</p>
              {property.address && (
                <p className="mt-1.5 flex gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>{property.address}</span>
                </p>
              )}
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[44px] px-4">
              Open in Google Maps <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          {nearbyGroups.length > 0 ? (
            <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
              {nearbyGroups.map((g) => (
                <div key={g.id}>
                  <h3 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{g.label}</h3>
                  <ul className="mt-2 divide-y divide-line border-y border-line">
                    {g.items.map((n) => (
                      <li key={n.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate">{n.name}</span>
                          <span className="text-xs text-ink-muted">{NEARBY_CATEGORY_LABEL[n.category]}</span>
                        </span>
                        {distance(n) && (
                          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-ink-muted">
                            <Clock className="h-3 w-3" aria-hidden="true" /> {distance(n)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="col-span-full text-2xs text-ink-muted">Approximate distances and drive times by road; they vary with route and traffic.</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Ask the advisor for schools, hospitals, metro and office commutes near {property.locality}.</p>
          )}
          {commuteHubs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Commute radar</h3>
              <div className="mt-2.5">
                <CommuteRadar property={property} hubs={commuteHubs} disclaimer={settings.disclaimers.commute} />
              </div>
            </div>
          )}
          {zone && (
            <Link href={`/properties?zone=${zoneOfCorridor(property.corridorId)}&corridor=${property.corridorId}`} className="arrow-host mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-accent-ink">
              More homes in {property.corridorName} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </Section>

        {hasVerification && (
          <Section id="verification" title="RERA & approvals">
            <VerificationLedger property={property} />
          </Section>
        )}

        {property.documents.length > 0 && (
          <Section id="documents" title="Brochure & documents">
            <DocumentList property={property} />
          </Section>
        )}

        {extraGroups.length > 0 && (
          <Section id="more" title="More details">
            <div className="space-y-6">
              {extraGroups.map(({ group, items }) => (
                <div key={group}>
                  {extraGroups.length > 1 && <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{group}</h3>}
                  <dl className="divide-y divide-line border-y border-line">
                    {items.map((x) => (
                      <div key={x.id} className="grid gap-0.5 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
                        <dt className="text-sm font-semibold">{x.label}</dt>
                        <dd className="text-sm text-ink-muted">{x.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Section>
        )}

        {developer && (developer.about || developerFacts.length > 0) && (
          <Section id="developer" title={`About ${developer.name}`}>
            {developer.about && <p className="max-w-[68ch] text-[0.95rem] leading-relaxed text-ink-muted sm:text-base">{developer.about}</p>}
            {developerFacts.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
                {developerFacts.map((x) => (
                  <div key={x.label} className="border-t border-line pt-3">
                    <dt className="text-2xs text-ink-muted">{x.label}</dt>
                    <dd className="mt-1 font-serif text-2xl leading-tight">{x.value}</dd>
                    <dd className="text-2xs text-ink-muted">
                      Source: {x.source!.label} · as of {x.source!.asOf}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href={`/properties?q=${encodeURIComponent(property.developerName)}`} className="arrow-host mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-accent-ink">
              More from {property.developerName} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Section>
        )}


          <DetailsOnRequest property={property} settings={settings} />
        </div>

        <PropertyActions property={property} settings={settings} />
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-12 border-t border-line pt-10 sm:mt-14 sm:pt-12">
          <Reveal variant="words" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="rw-fade text-sm font-medium text-ink-muted">Similar homes</p>
              <h2 id="similar-title" className="mt-1 font-serif text-[1.65rem] leading-[1.1] sm:text-[2rem]">
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
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overflow-y-hidden px-4 pb-3 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-4">
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
