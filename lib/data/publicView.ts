import { absoluteUrl } from '@/lib/site';
import type { Property } from './types';

/**
 * What public pages may see. Listings reach client components (cards, compare, the detail
 * page), so the real links of "on request" documents are replaced before they leave the
 * server: visitors ask for those through the lead form instead.
 */
/**
 * The listing as list pages need it (cards, search, compare, shortlist): long text, plans,
 * documents, charges and the rest of the detail page are left out so pages load faster.
 */
export function toCardView(property: Property): Property {
  return {
    ...property,
    description: '',
    highlights: [],
    specifications: [],
    nearby: [],
    documents: [],
    extraDetails: [],
    charges: [],
    paymentPlan: { type: property.paymentPlan.type, bookingPct: property.paymentPlan.bookingPct, stages: [] },
    commute: [],
    configurations: property.configurations.map((c) => ({ ...c, floorPlanImageId: null })),
    media: { ...property.media, floorPlans: [], masterPlan: null, brochure: null, gallery: property.media.gallery.slice(0, 8) },
  };
}

export function toPublicProperty(property: Property): Property {
  const { gallery, cover, floorPlans } = property.media;
  // A cover that was removed from the gallery in the admin must not keep showing: fall back to
  // the first gallery photo. Floor-plan links to deleted plans are dropped too.
  const liveCover = gallery.length ? gallery.find((img) => img.id === cover.id) ?? gallery[0] : cover;
  const planIds = new Set(floorPlans.map((p) => p.id));
  const configurations = property.configurations.map((c) => (c.floorPlanImageId && !planIds.has(c.floorPlanImageId) ? { ...c, floorPlanImageId: null } : c));
  const placeholder = absoluteUrl(`/properties/${property.slug}#documents`);
  return {
    ...property,
    configurations,
    media: { ...property.media, cover: liveCover },
    documents: property.documents.map((d) => (d.access === 'on-request' ? { ...d, url: placeholder, storagePath: '' } : d)),
  };
}
