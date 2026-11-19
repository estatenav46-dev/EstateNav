import { absoluteUrl } from '@/lib/site';
import type { Property } from './types';

/**
 * What public pages may see. Listings reach client components (cards, compare, the detail
 * page), so the real links of "on request" documents are replaced before they leave the
 * server: visitors ask for those through the lead form instead.
 */
export function toPublicProperty(property: Property): Property {
  if (!property.documents.some((d) => d.access === 'on-request')) return property;
  const placeholder = absoluteUrl(`/properties/${property.slug}#documents`);
  return {
    ...property,
    documents: property.documents.map((d) => (d.access === 'on-request' ? { ...d, url: placeholder, storagePath: '' } : d)),
  };
}
