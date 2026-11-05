export type PropertyCategory = 'residential' | 'commercial' | 'plotted';
// Kept for the untouched legacy Firebase adapter.
export type Segment = PropertyCategory;
export type MilestoneLens = 'all' | 'first' | 'upgrade' | 'nri' | 'senior';
export type TechCampus = 'all' | 'wipro' | 'ecospace' | 'manyata';

export interface Property {
  // Identity
  id: string;
  title: string;
  projectName: string;
  developer: string;
  listingFor: 'buy' | 'rent';
  propertyType: 'apartment' | 'villa' | 'plot' | 'floor' | 'office';
  category: PropertyCategory;
  status: 'new-launch' | 'under-construction' | 'ready' | 'pre-launch';
  featured: boolean;
  availability: 'available' | 'sold-out';

  // Location
  city: 'Bengaluru';
  locality: string;
  corridor: 'Sarjapur Road' | 'Whitefield' | 'Electronic City' | 'North Bengaluru' | 'Other';
  address: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;

  // Specifications
  bhkLabel: string;
  bhkOptions?: number[];
  bathrooms?: number | null;
  furnishing?: 'unfurnished' | 'semi-furnished' | 'furnished' | null;
  facing?: string | null;
  floor?: number | null;
  totalFloors?: number | null;
  carpetAreaMin?: number | null;
  carpetAreaMax?: number | null;
  builtUpAreaMin?: number | null;
  builtUpAreaMax?: number | null;
  superAreaMin?: number | null;
  superAreaMax?: number | null;
  plotAreaMin?: number | null;
  plotAreaMax?: number | null;
  areaUnit: 'sqft';

  // Pricing
  priceMin: number;
  priceLabel: string;
  priceType: 'onwards' | 'fixed' | 'per-sqft-month';
  pricePerSqft?: number;
  maintenancePerMonth?: number | null;
  isGuidePrice: true;

  // Possession
  possessionLabel: string;
  possessionStatus: 'ready' | 'under-construction' | 'new-launch';

  // Media
  images: string[];
  coverImage: string;
  videoUrl?: string | null;
  brochureUrl?: string | null;

  // Amenities
  amenities: string[];

  // Compliance and trust
  reraNumber?: string;
  reraUrl?: string;
  agentName: 'SV Praveen';
  agentRera: 'PRM/KA/RERA/1251/310/AG/260916/007810';
  verified: boolean;
  titleStatus?: string;
  approvals?: string[];

  // Investment
  grossYieldPercent?: number;
  capRatePercent?: number;

  // Presentation and SEO
  shortDescription: string;
  highlights: string[];
  postedOn: string | null;
  updatedAt: string | null;
  metaTitle: string;
  metaDescription: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  preferredCorridor?: string;
  budget?: string;
  propertyId?: string;
  propertyName?: string;
  actionContext: string;
  channelPartnerDisclosureAccepted: boolean;
  createdAt: string;
}

