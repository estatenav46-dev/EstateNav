import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from './PropertyDetail';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getDevelopers, getListingCards, getOfficeHubs, getPublishedProperties, getPublishedProperty, getSettings } from '@/lib/data/cached';
import { breadcrumbJsonLd, faqJsonLd, propertyBreadcrumbs, propertyFaqs, propertyJsonLd, propertyPlaceJsonLd, propertySeo } from '@/lib/seo';
import { similarProperties } from '@/lib/similar';

export const revalidate = 60;

export async function generateStaticParams() {
  const properties = await getPublishedProperties();
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPublishedProperty(params.slug);
  // Not found here, before the page streams, so the response is a real 404 (not a soft 404).
  if (!property) notFound();
  const { title, description } = propertySeo(property);
  return {
    title: { absolute: `${title} | EstateNav` },
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: { title, description, type: 'website', url: `/properties/${property.slug}`, images: [{ url: property.media.cover.url, alt: property.media.cover.alt }] },
  };
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const property = await getPublishedProperty(params.slug);
  if (!property) notFound();
  const [all, corridors, developers, hubs, settings] = await Promise.all([getListingCards(), getCorridors(), getDevelopers(), getOfficeHubs(), getSettings()]);
  // Similar homes (area, BHK, price) for the rail and the automatic comparison.
  const similar = similarProperties(property, all, 6);
  const related = similar.map((m) => m.property);

  return (
    <>
      <JsonLd data={[propertyJsonLd(property), propertyPlaceJsonLd(property), faqJsonLd(propertyFaqs(property)), breadcrumbJsonLd(propertyBreadcrumbs(property, corridors))]} />
      <PropertyDetail
        property={property}
        developer={developers.find((d) => d.id === property.developerId) ?? null}
        corridors={corridors}
        hubs={hubs}
        related={related}
        similar={similar}
        allProperties={all}
        settings={settings}
      />
    </>
  );
}
