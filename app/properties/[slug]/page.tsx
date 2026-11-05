import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from './PropertyDetail';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getDevelopers, getOfficeHubs, getPublishedProperties, getPublishedProperty, getSettings } from '@/lib/data/cached';
import { breadcrumbJsonLd, propertyBreadcrumbs, propertyJsonLd } from '@/lib/seo';

export const revalidate = 300;

export async function generateStaticParams() {
  const properties = await getPublishedProperties();
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPublishedProperty(params.slug);
  if (!property) return { title: 'Property not found' };
  const title = property.seo.title || property.title;
  return {
    title: { absolute: `${title} | EstateNav` },
    description: property.seo.description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: { title, description: property.seo.description, images: [{ url: property.media.cover.url, alt: property.media.cover.alt }] },
  };
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const property = await getPublishedProperty(params.slug);
  if (!property) notFound();
  const [all, corridors, developers, hubs, settings] = await Promise.all([getPublishedProperties(), getCorridors(), getDevelopers(), getOfficeHubs(), getSettings()]);
  const related = all.filter((p) => p.corridorId === property.corridorId && p.id !== property.id).slice(0, 6);

  return (
    <>
      <JsonLd data={propertyJsonLd(property)} />
      <JsonLd data={breadcrumbJsonLd(propertyBreadcrumbs(property))} />
      <PropertyDetail
        property={property}
        developer={developers.find((d) => d.id === property.developerId) ?? null}
        corridors={corridors}
        hubs={hubs}
        related={related}
        allProperties={all}
        settings={settings}
      />
    </>
  );
}
