import type { ProjectFacts, Property } from './types';

export type ListingDetailKey = 'priceOnRequest' | 'priceNote' | 'facts' | 'specifications' | 'nearby' | 'documents' | 'extraDetails' | 'offer';

export const EMPTY_FACTS: ProjectFacts = {
  landAcres: null,
  totalUnits: null,
  towers: null,
  floors: null,
  openSpacePct: null,
  clubhouseSqft: null,
  launchDate: null,
};

/** The listing-detail fields with nothing filled in (same shape as the schema defaults). */
export function emptyListingDetails(): Pick<Property, ListingDetailKey> {
  return {
    priceOnRequest: false,
    priceNote: '',
    facts: { ...EMPTY_FACTS },
    specifications: [],
    nearby: [],
    documents: [],
    extraDetails: [],
    offer: null,
  };
}
