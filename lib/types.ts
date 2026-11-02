export type Segment = 'residential' | 'commercial' | 'plotted';

export type MilestoneLens = 'all' | 'first' | 'upgrade' | 'nri' | 'senior';

export type TechCampus = 'all' | 'wipro' | 'ecospace' | 'manyata';

export interface CommuteInfo {
  campus: TechCampus;
  driveMinutes: number;
  distanceKm: number;
  routeHighlight: string;
}

export interface InvestmentMetrics {
  expectedYield: string;
  historicalAppreciation: string;
  kaveriGuidelineRate: string;
  absorptionVelocity: string;
}

export interface Property {
  id: string;
  name: string;
  developer: string;
  segment: Segment;
  microMarket: string;
  address: string;
  configurations: string;
  carpetArea?: string;
  startingPrice: number; // in Lakhs for unified filtering
  priceDisplay: string;
  possession: string;
  status: 'Pre-Launch' | 'Under Construction' | 'Ready to Move In' | 'Ready to Register';
  isAnchorSpotlight?: boolean;
  reraNumber: string;
  reraValidationUrl: string;
  heroImage: string;
  keyFeatures: string[];
  commute: CommuteInfo;
  lenses: MilestoneLens[];
  metrics: InvestmentMetrics;
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

export interface TelemetryTickerItem {
  id: string;
  corridor: string;
  subRegistrarBenchmark: string;
  yoyDelta: string;
  isPositive: boolean;
  grossYield: string;
  absorptionTime: string;
}

