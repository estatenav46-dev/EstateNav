import type { Property } from '@/lib/data/types';
import type { EnquiryProject } from '@/lib/contact';
import { configLabels, priceLabel } from '@/lib/property';
import { absoluteUrl } from '@/lib/site';

/** The facts a WhatsApp enquiry carries for one listing (see projectEnquiryText in lib/contact). */
export function enquiryFromProperty(p: Property): EnquiryProject {
  const options = configLabels(p);
  return {
    title: p.title,
    developerName: p.developerName,
    locality: p.locality,
    corridorName: p.corridorName,
    configurations: options.length ? options : undefined,
    price: p.priceOnRequest ? 'On request' : `${priceLabel(p)} (approx. developer guide price)`,
    possession: p.possession.status === 'ready' ? 'Ready to move in' : p.possession.label || null,
    reraNumber: p.rera.number || null,
    url: absoluteUrl(`/properties/${p.slug}`),
  };
}
