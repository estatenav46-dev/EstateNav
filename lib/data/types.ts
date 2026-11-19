import type { z } from 'zod';
import type {
  visitorEventSchema,
  visitorLeadSchema,
  configurationSchema,
  corridorSchema,
  developerSchema,
  enquiryInputSchema,
  enquiryIntentSchema,
  enquirySchema,
  enquirySourceSchema,
  enquiryStatusSchema,
  fileRefSchema,
  imageRefSchema,
  lensSchema,
  marketSnapshotSchema,
  officeHubSchema,
  propertySchema,
  publishStatusSchema,
  segmentSchema,
  siteSettingsSchema,
  userSchema,
  projectFactsSchema,
  specificationSchema,
  nearbyCategorySchema,
  nearbyPlaceSchema,
  documentKindSchema,
  propertyDocumentSchema,
  extraDetailSchema,
} from './schemas';

export type ImageRef = z.infer<typeof imageRefSchema>;
export type FileRef = z.infer<typeof fileRefSchema>;
export type Segment = z.infer<typeof segmentSchema>;
export type Lens = z.infer<typeof lensSchema>;
export type PublishStatus = z.infer<typeof publishStatusSchema>;
export type Configuration = z.infer<typeof configurationSchema>;
export type Property = z.infer<typeof propertySchema>;
export type Developer = z.infer<typeof developerSchema>;
export type Corridor = z.infer<typeof corridorSchema>;
export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>;
export type OfficeHub = z.infer<typeof officeHubSchema>;
export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryInput = z.input<typeof enquiryInputSchema>;
export type EnquiryIntent = z.infer<typeof enquiryIntentSchema>;
export type EnquirySource = z.infer<typeof enquirySourceSchema>;
export type EnquiryStatus = z.infer<typeof enquiryStatusSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type AppUser = z.infer<typeof userSchema>;
export type ProjectFacts = z.infer<typeof projectFactsSchema>;
export type Specification = z.infer<typeof specificationSchema>;
export type NearbyCategory = z.infer<typeof nearbyCategorySchema>;
export type NearbyPlace = z.infer<typeof nearbyPlaceSchema>;
export type DocumentKind = z.infer<typeof documentKindSchema>;
export type PropertyDocument = z.infer<typeof propertyDocumentSchema>;
export type ExtraDetail = z.infer<typeof extraDetailSchema>;

/** The home and listing pages switch between these four views of the catalogue. */
export type SearchSegment = Segment | 'rent';
export type VisitorLead = z.output<typeof visitorLeadSchema>;
export type VisitorLeadInput = z.input<typeof visitorLeadSchema>;
export type VisitorEvent = z.infer<typeof visitorEventSchema>;
export type BlogPost = import('zod').infer<typeof import('./schemas').blogPostSchema>;
