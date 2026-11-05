import type { z } from 'zod';
import type {
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

/** The home and listing pages switch between these four views of the catalogue. */
export type SearchSegment = Segment | 'rent';
