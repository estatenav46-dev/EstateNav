import Link from 'next/link';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { sortListings } from '@/lib/listingFilters';
import { priceLabel } from '@/lib/property';
import { GUIDE_LABEL, placeGuide } from '@/lib/placeGuides';
import { absoluteUrl } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/seo';
import {
  CITY,
  CITY_PLACE,
  FILTERS,
  LANDING_ROOT,
  exploreHref,
  landingFacts,
  landingFaqs,
  landingHeading,
  landingPath,
  landingSummary,
  placeLabel,
  type LandingPage,
} from '@/lib/landing';

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function landingCrumbs(page: LandingPage) {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: CITY, path: LANDING_ROOT },
  ];
  if (page.place.kind !== 'city') crumbs.push({ name: page.place.name, path: landingPath(page.place, null) });
  if (page.filter) crumbs.push({ name: page.filter.short, path: page.path });
  return crumbs;
}

/** Links to the other pages that exist, for the "related searches" blocks. */
export function relatedLinks(page: LandingPage, existing: Set<string>, all: LandingPage[]) {
  const sameplace = FILTERS.map((f) => ({ label: f.short, path: landingPath(page.place, f) })).filter((l) => l.path !== page.path && existing.has(l.path));
  const city = page.filter ? { label: `${page.filter.short} across ${CITY}`, path: landingPath(CITY_PLACE, page.filter) } : null;
  const places = all
    .filter((p) => p.filter?.slug === page.filter?.slug && p.place.kind !== 'city' && p.path !== page.path)
    .filter((p) => (page.place.kind === 'area' ? p.place.kind === 'area' && p.place.zone === page.place.zone : true))
    .slice(0, 12)
    .map((p) => ({ label: page.filter ? `${page.filter.short} in ${p.place.name}` : p.place.name, path: p.path }));
  return { sameplace, city: city && existing.has(city.path) && city.path !== page.path ? city : null, places };
}

function ProjectTable({ listings }: { listings: Property[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-card border border-line">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="sr-only">Projects compared: developer, location, configurations, price, possession and K-RERA</caption>
        <thead className="bg-surface-2 text-xs text-ink-muted">
          <tr>
            {['Project', 'Developer', 'Location', 'Configurations', 'Guide price', 'Possession', 'K-RERA'].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.map((p) => (
            <tr key={p.id} className="border-t border-line align-top">
              <th scope="row" className="px-4 py-3 font-semibold">
                <Link href={`/properties/${p.slug}`} className="text-accent-ink hover:underline">
                  {p.title}
                </Link>
              </th>
              <td className="px-4 py-3">{p.developerName}</td>
              <td className="px-4 py-3">
                {p.locality}, {p.corridorName}
              </td>
              <td className="px-4 py-3">{p.configurations.map((c) => c.label).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join(', ') || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3">{priceLabel(p)}</td>
              <td className="px-4 py-3">{p.possession.label}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.rera.number || 'On request'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The city hub before any listing is published: one clear message and two ways forward. */
function EmptyCatalogue() {
  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8" data-testid="landing-empty">
      <h1 className="font-serif text-[2rem] leading-tight sm:text-[2.4rem]">Property in Bangalore</h1>
      <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-muted">New projects are being verified and will appear here shortly. Your advisor can share current options and price sheets today.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/contact" className="btn-primary">
          Talk to an advisor <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/blogs" className="btn-secondary">
          Read the buying guides
        </Link>
      </div>
    </main>
  );
}

export function LandingView({ page, all }: { page: LandingPage; all: LandingPage[] }) {
  if (!page.listings.length) return <EmptyCatalogue />;
  const listings = sortListings(page.listings, 'relevance');
  const facts = landingFacts(listings);
  const faqs = landingFaqs(page);
  const heading = landingHeading(page);
  const crumbs = landingCrumbs(page);
  const existing = new Set(all.map((p) => p.path));
  const related = relatedLinks(page, existing, all);
  const guide = page.place.kind === 'area' ? placeGuide(page.place.zone, page.place.corridor.id) : page.place.kind === 'region' ? placeGuide(page.place.zone) : placeGuide();
  const about = page.place.kind === 'area' ? page.place.corridor.description : guide?.intro;
  const url = absoluteUrl(page.path);

  const jsonLd = [
    breadcrumbJsonLd(crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heading,
      description: landingSummary(page),
      url,
      ...(facts.updatedAt ? { dateModified: facts.updatedAt } : {}),
      about: { '@type': 'Place', name: placeLabel(page.place), address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' } },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: listings.length,
        itemListElement: listings.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/properties/${p.slug}`), name: p.title })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8" data-testid="landing">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs} />

      <header className="mt-6 max-w-3xl">
        <h1 className="font-serif text-[2rem] leading-[1.08] sm:text-[2.6rem]">{heading}</h1>
        <p className="mt-3 leading-relaxed text-ink-muted">{landingSummary(page)}</p>
        {facts.updatedAt && <p className="mt-2 text-xs text-ink-muted">Updated {dateFmt(facts.updatedAt)}</p>}
      </header>

      {related.sameplace.length > 0 && (
        <nav aria-label={`Refine ${placeLabel(page.place)}`} className="mt-6 flex flex-wrap gap-2">
          {related.sameplace.map((l) => (
            <Link key={l.path} href={l.path} className="chip min-h-[40px] px-3.5 text-[13px]">
              {l.label}
            </Link>
          ))}
          <Link href={exploreHref(page.place, page.filter)} className="chip min-h-[40px] gap-1.5 px-3.5 text-[13px]">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> More filters
          </Link>
        </nav>
      )}

      <section aria-labelledby="listings-title" className="mt-8">
        <h2 id="listings-title" className="sr-only">
          Projects
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="landing-results">
          {listings.map((p, i) => (
            <li key={p.id}>
              <ExploreCard property={p} priority={i < 3} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="compare-title" className="mt-14">
        <h2 id="compare-title" className="font-serif text-[1.6rem] leading-tight">
          {page.filter ? page.filter.noun : 'Projects'} in {placeLabel(page.place)} at a glance
        </h2>
        <ProjectTable listings={listings} />
        <p className="mt-2 text-xs text-ink-muted">Prices are approximate developer guide prices; terms and conditions apply. Ask your advisor for the latest price sheet.</p>
      </section>

      {(about || guide) && (
        <section aria-labelledby="about-title" className="mt-14 max-w-3xl">
          <h2 id="about-title" className="font-serif text-[1.6rem] leading-tight">
            About {placeLabel(page.place)}
          </h2>
          {about && <p className="mt-3 leading-relaxed text-ink-muted">{about}</p>}
          {guide && guide.groups.length > 0 && (
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {guide.groups.map((g) => (
                <div key={g.kind}>
                  <dt className="text-sm font-semibold">{GUIDE_LABEL[g.kind]}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{g.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <section aria-labelledby="faq-title" className="mt-14 max-w-3xl">
        <h2 id="faq-title" className="font-serif text-[1.6rem] leading-tight">
          Questions buyers ask
        </h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4" open>
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <h3 className="inline text-base">{f.q}</h3>
              </summary>
              <p className="mt-2 leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {(related.places.length > 0 || related.city) && (
        <nav aria-labelledby="related-title" className="mt-14">
          <h2 id="related-title" className="font-serif text-[1.4rem] leading-tight">
            Related searches
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.city && (
              <li>
                <Link href={related.city.path} className="chip min-h-[40px] px-3.5 text-[13px]">
                  {related.city.label}
                </Link>
              </li>
            )}
            {related.places.map((l) => (
              <li key={l.path}>
                <Link href={l.path} className="chip min-h-[40px] px-3.5 text-[13px]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-card bg-forest p-6 text-forest-on sm:p-8">
        <div>
          <p className="font-serif text-[1.4rem] leading-tight">Not sure which project fits?</p>
          <p className="mt-1 text-sm text-forest-on/75">Tell your advisor your budget and commute. You get a shortlist and the latest price sheets.</p>
        </div>
        <Link href="/contact?intent=site-visit" className="btn-primary">
          Book a site visit <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
