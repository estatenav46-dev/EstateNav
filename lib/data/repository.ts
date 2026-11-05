import type {
  Corridor,
  Developer,
  Enquiry,
  EnquiryStatus,
  ImageRef,
  MarketSnapshot,
  OfficeHub,
  Property,
  PublishStatus,
  Segment,
  SiteSettings,
} from './types';

// Storage-agnostic contracts. The mock adapter implements them in memory today; the
// Firestore adapter will implement the same interfaces, so pages and Server Actions
// never change when the data source does.

export interface PropertyQuery {
  status?: PublishStatus | 'any';
  segment?: Segment;
  transaction?: Property['transaction'];
  corridorId?: string;
  featuredOnly?: boolean;
}

export type PropertyDraft = Omit<Property, 'createdAt' | 'updatedAt' | 'publishedAt' | 'createdBy' | 'updatedBy'> & {
  publishedAt?: string | null;
};

export interface PropertyRepo {
  list(query?: PropertyQuery): Promise<Property[]>;
  getBySlug(slug: string): Promise<Property | null>;
  getById(id: string): Promise<Property | null>;
  isSlugAvailable(slug: string, exceptId?: string): Promise<boolean>;
  save(draft: PropertyDraft, actor: string): Promise<Property>;
  setStatus(id: string, status: PublishStatus, actor: string): Promise<Property>;
  setFeatured(id: string, featured: boolean, actor: string): Promise<Property>;
  duplicate(id: string, actor: string): Promise<Property>;
}

export interface LeadRepo {
  create(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'notes'>): Promise<Enquiry>;
  list(filter?: { status?: EnquiryStatus; since?: string }): Promise<Enquiry[]>;
  update(id: string, patch: Partial<Pick<Enquiry, 'status' | 'notes' | 'assignedTo'>>): Promise<Enquiry>;
}

export interface DeveloperRepo {
  list(): Promise<Developer[]>;
  get(id: string): Promise<Developer | null>;
  save(developer: Developer): Promise<Developer>;
}

export interface CorridorRepo {
  list(): Promise<Corridor[]>;
  get(id: string): Promise<Corridor | null>;
  save(corridor: Corridor): Promise<Corridor>;
  listOfficeHubs(): Promise<OfficeHub[]>;
  listMarketSnapshots(corridorId?: string): Promise<MarketSnapshot[]>;
}

export interface SettingsRepo {
  get(): Promise<SiteSettings>;
  save(settings: SiteSettings): Promise<SiteSettings>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

/** Runs in the browser: the admin uploads straight to storage, then saves the ImageRef. */
export interface MediaRepo {
  upload(
    file: File,
    path: string,
    meta: { alt: string; order: number; width: number; height: number; blurDataURL: string },
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<ImageRef>;
  remove(image: ImageRef): Promise<void>;
}

export interface Repos {
  properties: PropertyRepo;
  leads: LeadRepo;
  developers: DeveloperRepo;
  corridors: CorridorRepo;
  settings: SettingsRepo;
}
