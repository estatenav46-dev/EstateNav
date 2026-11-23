import type { Property } from '@/lib/data/types';
import type { EnquiryProject } from '@/lib/contact';
import { configLabels, priceLabel } from '@/lib/property';
import { absoluteUrl } from '@/lib/site';

/** The facts a WhatsApp enquiry carries for one listing (see projectEnquiryText in lib/contact). */
export function enquiryFromProperty(p: Property): EnquiryProject {
  // Unit variants share labels (two "2 BHK" rows); list each option once.
  const options = Array.from(new Set(configLabels(p).map((l) => l.trim()).filter(Boolean)));
  // Skip the area when the locality already names it ("Greater Whitefield, Old Madras Road" in
  // "Greater Whitefield (Old Madras Road / …)").
  const head = (text: string) => text.split(/[,(]/)[0].trim().toLowerCase();
  const sameArea = Boolean(p.locality && p.corridorName && head(p.corridorName) === head(p.locality));
  // Phased projects carry several registrations: name the first and count the rest.
  const reras = (p.rera.number || '').split(/\s*[|,;]\s*/).filter(Boolean);
  const rera = reras.length > 1 ? `${reras[0]} (and ${reras.length - 1} more)` : reras[0] || null;
  return {
    title: p.title,
    developerName: p.developerName,
    locality: p.locality,
    corridorName: sameArea ? null : p.corridorName,
    configurations: options.length ? options : undefined,
    price: p.priceOnRequest ? 'On request' : `${priceLabel(p)} (approx. developer guide price)`,
    possession: p.possession.status === 'ready' ? 'Ready to move in' : p.possession.label || null,
    reraNumber: rera,
    url: absoluteUrl(`/properties/${p.slug}`),
  };
}
