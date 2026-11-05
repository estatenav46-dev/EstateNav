import type { Property, SiteSettings } from './data/types';
import { absoluteUrl, SITE_URL } from './site';
import { SEGMENT_LABEL } from './property';

export function realEstateAgentJsonLd(settings: SiteSettings, corridors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'EstateNav',
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl('/logo-card.jpg'),
    description: 'Curated Bengaluru property discovery and advisory with direct-developer pricing and zero buyer brokerage.',
    telephone: settings.contact.phoneDisplay,
    email: settings.contact.email,
    areaServed: corridors.map((name) => ({ '@type': 'Place', name: `${name}, Bengaluru` })),
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
    employee: {
      '@type': 'Person',
      name: settings.agent.name,
      jobTitle: settings.agent.title,
      identifier: { '@type': 'PropertyValue', propertyID: 'K-RERA agent registration', value: settings.agent.reraNumber },
    },
    contactPoint: { '@type': 'ContactPoint', telephone: settings.contact.phoneDisplay, contactType: 'sales', areaServed: 'IN', availableLanguage: ['English', 'Kannada', 'Hindi'] },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function propertyBreadcrumbs(property: Property) {
  const segment = property.transaction === 'rent' ? 'rent' : property.segment;
  return [
    { name: 'Home', path: '/' },
    { name: SEGMENT_LABEL[segment], path: `/properties?seg=${segment}` },
    { name: property.corridorName, path: `/properties?seg=${segment}&corridor=${property.corridorId}` },
    { name: property.title, path: `/properties/${property.slug}` },
  ];
}

export function propertyJsonLd(property: Property) {
  const url = absoluteUrl(`/properties/${property.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.seo.description || property.tagline,
    url,
    image: property.media.gallery.map((img) => img.url),
    brand: { '@type': 'Brand', name: property.developerName },
    category: property.segment === 'plot' ? 'Residential plot' : property.segment === 'commercial' ? 'Commercial office space' : 'Residential apartment',
    ...(property.rera.number ? { identifier: { '@type': 'PropertyValue', propertyID: 'K-RERA project registration', value: property.rera.number } } : {}),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: property.priceMin,
      ...(property.priceMax ? { highPrice: property.priceMax } : {}),
      availability: 'https://schema.org/InStock',
      url,
      ...(property.transaction === 'rent' ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: property.priceMin, priceCurrency: 'INR', unitText: 'MONTH' } } : {}),
      seller: { '@type': 'RealEstateAgent', name: 'EstateNav', url: SITE_URL },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Locality', value: `${property.locality}, ${property.corridorName}, Bengaluru` },
      { '@type': 'PropertyValue', name: 'Possession', value: property.possession.label },
    ],
  };
}
