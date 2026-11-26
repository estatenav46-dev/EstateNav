import type { Corridor, Property, SiteSettings } from './data/types';
import { priceLabel } from './property';
import { absoluteUrl, SITE_URL } from './site';

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

/** Home → Bangalore → area page → project; the area page exists whenever the area has a listing. */
export function propertyBreadcrumbs(property: Property, corridors: Pick<Corridor, 'id' | 'slug'>[] = []) {
  const corridor = corridors.find((c) => c.id === property.corridorId);
  return [
    { name: 'Home', path: '/' },
    { name: 'Bangalore', path: '/bangalore' },
    { name: property.corridorName, path: corridor ? `/bangalore/${corridor.slug}` : `/properties?corridor=${property.corridorId}` },
    { name: property.title, path: `/properties/${property.slug}` },
  ];
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Title and description, falling back to a searchable pattern when the admin left them blank. */
export function propertySeo(property: Property) {
  const place = [property.locality, property.corridorName].filter(Boolean).join(', ');
  const builder = property.developerName && !property.title.toLowerCase().includes(property.developerName.toLowerCase().split(' ')[0]) ? ` by ${property.developerName}` : '';
  // Longest useful title that fits Google's ~65 characters: drop the builder, then the locality,
  // before ever cutting the project name or "Bangalore".
  const candidates = [
    `${property.title}${builder} | ${place}, Bangalore`,
    `${property.title}${builder} | ${property.corridorName}, Bangalore`,
    `${property.title} | ${property.locality}, Bangalore`,
    `${property.title} | ${property.corridorName}, Bangalore`,
    `${property.title}, Bangalore`,
  ];
  // The admin importer saves titles cut at 70 characters with "…"; those read badly, so use ours.
  const own = property.seo.title?.trim();
  const title = (own && !own.endsWith('…') ? own : '') || candidates.find((t) => t.length <= 65) || clip(property.title, 65);
  const configs = Array.from(new Set(property.configurations.map((c) => c.label))).slice(0, 3).join(', ');
  const description =
    property.seo.description?.trim() ||
    clip(
      `${property.title}${builder} in ${place}, Bengaluru${configs ? `: ${configs}` : ''}. ${property.priceOnRequest ? 'Price on request' : `Guide price ${priceLabel(property)}`}, ${property.possession.label.toLowerCase()}. Floor plans and K-RERA details on EstateNav.`,
      160,
    );
  return { title, description };
}

/** Plain answers to what buyers search about a project ("X price", "X location", "X possession"). */
export function propertyFaqs(property: Property): { q: string; a: string }[] {
  const place = `${property.locality}, ${property.corridorName}, Bengaluru`;
  const configs = Array.from(new Set(property.configurations.map((c) => c.label)));
  const faqs = [
    { q: `Where is ${property.title} located?`, a: `${property.title} is in ${place}${property.address ? ` (${property.address})` : ''}.` },
    {
      q: `What is the price of ${property.title}?`,
      a: property.priceOnRequest
        ? `The price of ${property.title} is shared on request. Ask your EstateNav advisor for the developer's latest price sheet.`
        : `The developer's guide price for ${property.title} is ${priceLabel(property)}. This is an approximate starting price; ask your EstateNav advisor for the latest price sheet at direct-developer pricing.`,
    },
    { q: `Who is the developer of ${property.title}?`, a: `${property.title} is developed by ${property.developerName}. EstateNav is an authorised channel partner, so buyers pay no brokerage.` },
  ];
  if (configs.length) faqs.push({ q: `What configurations are available in ${property.title}?`, a: `${property.title} offers ${configs.join(', ')}. Sizes, floor plans and prices for each unit type are listed on this page.` });
  faqs.push({ q: `What is the possession date of ${property.title}?`, a: `Possession status: ${property.possession.label}.` });
  faqs.push({
    q: `Is ${property.title} RERA registered?`,
    a: property.rera.number ? `Yes. ${property.title} is registered with Karnataka RERA under ${property.rera.number}.` : `RERA details for ${property.title} are shared on request by your EstateNav advisor.`,
  });
  return faqs;
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
    ...(property.priceOnRequest ? {} : { offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: property.priceMin,
      ...(property.priceMax ? { highPrice: property.priceMax } : {}),
      availability: 'https://schema.org/InStock',
      url,
      ...(property.transaction === 'rent' ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: property.priceMin, priceCurrency: 'INR', unitText: 'MONTH' } } : {}),
      seller: { '@type': 'RealEstateAgent', name: 'EstateNav', url: SITE_URL },
    } }),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Locality', value: `${property.locality}, ${property.corridorName}, Bengaluru` },
      { '@type': 'PropertyValue', name: 'Possession', value: property.possession.label },
    ],
  };
}

/** The project as a place (address and map pin), so local and AI search can tie it to the area. */
export function propertyPlaceJsonLd(property: Property) {
  const type = property.segment === 'commercial' ? 'Place' : property.segment === 'plot' ? 'Landform' : 'ApartmentComplex';
  return {
    '@context': 'https://schema.org',
    '@type': type === 'Landform' ? 'Place' : type,
    name: property.title,
    url: absoluteUrl(`/properties/${property.slug}`),
    address: {
      '@type': 'PostalAddress',
      ...(property.address ? { streetAddress: property.address } : {}),
      addressLocality: `${property.locality}, Bengaluru`,
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    ...(property.geo ? { geo: { '@type': 'GeoCoordinates', latitude: property.geo.lat, longitude: property.geo.lng } } : {}),
    containedInPlace: { '@type': 'Place', name: `${property.corridorName}, Bengaluru` },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

/** Site name and organisation for the knowledge panel and AI engines (on every page). */
export function siteJsonLd(settings: SiteSettings) {
  return [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'EstateNav', alternateName: 'EstateNav Bengaluru', url: SITE_URL, inLanguage: 'en-IN' },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EstateNav',
      url: SITE_URL,
      logo: absoluteUrl('/logo.png'),
      email: settings.contact.email,
      telephone: settings.contact.phoneDisplay,
      areaServed: { '@type': 'City', name: 'Bengaluru', alternateName: 'Bangalore' },
    },
  ];
}
