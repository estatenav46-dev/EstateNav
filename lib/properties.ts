import { PROPERTIES } from './mockData';
import { Property } from './types';

export interface PropertyFilters {
  listingFor?: Property['listingFor'];
  category?: Property['category'];
  corridor?: Property['corridor'];
  bhk?: number;
  budgetMin?: number;
  budgetMax?: number;
  possessionStatus?: Property['possessionStatus'];
  verifiedOrReraOnly?: boolean;
}

/** Local data access seam for the later storage implementation. */
export function getProperties(): Property[] {
  return PROPERTIES;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  return properties.filter((property) => {
    if (filters.listingFor && property.listingFor !== filters.listingFor) return false;
    if (filters.category && property.category !== filters.category) return false;
    if (filters.corridor && property.corridor !== filters.corridor) return false;
    if (filters.bhk !== undefined && !property.bhkOptions?.includes(filters.bhk)) return false;
    if (filters.budgetMin !== undefined && property.priceMin < filters.budgetMin) return false;
    if (filters.budgetMax !== undefined && property.priceMin > filters.budgetMax) return false;
    if (filters.possessionStatus && property.possessionStatus !== filters.possessionStatus) return false;
    if (filters.verifiedOrReraOnly && !(property.verified && property.reraNumber)) return false;
    return true;
  });
}
