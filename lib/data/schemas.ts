import { z } from 'zod';

// Zod schemas are the single source of truth for the data model. They mirror the
// planned Firestore collections; dates are ISO strings here and become Timestamps
// in the Firestore converters (lib/data/adapters/firestore/converters.ts).

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Use an ISO date');
const slug = z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only');

export const imageRefSchema = z.object({
  id: z.string().min(1),
  storagePath: z.string(),
  url: z.string().url(),
  alt: z.string().min(1, 'Alt text is required'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string(),
  order: z.number().int().nonnegative(),
  credit: z.string().optional(),
});

export const fileRefSchema = z.object({
  id: z.string().min(1),
  storagePath: z.string(),
  url: z.string().url(),
  name: z.string(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

export const segmentSchema = z.enum(['residential', 'plot', 'commercial']);
export const transactionSchema = z.enum(['sale', 'rent']);
export const propertyTypeSchema = z.enum(['apartment', 'villa', 'row-house', 'plot', 'office', 'retail']);
export const publishStatusSchema = z.enum(['draft', 'published', 'archived']);
export const possessionStatusSchema = z.enum(['ready', 'under-construction', 'pre-launch']);
export const lensSchema = z.enum(['first-home', 'upgrading', 'nri', 'senior', 'investor']);

// For plotted listings the carpet fields hold the plot area; the UI labels them as plot sizes.
export const configurationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  bhk: z.number().positive().nullable(),
  carpetSqftMin: z.number().int().positive().nullable(),
  carpetSqftMax: z.number().int().positive().nullable(),
  superSqftMin: z.number().int().positive().nullable(),
  superSqftMax: z.number().int().positive().nullable(),
  priceMin: z.number().int().positive().nullable(),
  priceMax: z.number().int().positive().nullable(),
  floorPlanImageId: z.string().nullable(),
});

export const sourcedSchema = z.object({ source: z.string().min(1), asOf: isoDate });

export const propertySchema = z.object({
  id: z.string().min(1),
  slug,
  status: publishStatusSchema,
  featured: z.boolean(),
  featuredRank: z.number().int().nonnegative(),

  segment: segmentSchema,
  transaction: transactionSchema,
  isNewLaunch: z.boolean(),
  propertyType: propertyTypeSchema,

  title: z.string().min(2),
  tagline: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),

  developerId: z.string().min(1),
  developerName: z.string().min(1),
  corridorId: z.string().min(1),
  corridorName: z.string().min(1),
  locality: z.string().min(1),
  address: z.string(),
  geo: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  geohash: z.string().nullable(),

  configurations: z.array(configurationSchema),
  bhkOptions: z.array(z.number().positive()),
  priceMin: z.number().int().positive(),
  priceMax: z.number().int().positive().nullable(),
  sizeMin: z.number().int().positive().nullable(),
  sizeMax: z.number().int().positive().nullable(),
  pricePerSqft: z.number().positive().nullable(),
  rentPerMonth: z.number().int().positive().nullable(),

  possession: z.object({ status: possessionStatusSchema, date: isoDate.nullable(), label: z.string().min(1) }),

  rera: z.object({ number: z.string().nullable(), verifyUrl: z.string().url().nullable(), registered: z.boolean() }),
  approvals: z.object({
    khata: z.enum(['A', 'B', 'E']).nullable(),
    planAuthority: z.enum(['BBMP', 'BDA', 'BMRDA', 'BIAAPA']).nullable(),
    titleCheck: z.enum(['clear', 'pending']).nullable(),
    notes: z.string(),
  }),
  bankApprovals: z.array(z.string()),

  amenities: z.array(z.string()),
  lenses: z.array(lensSchema),

  media: z.object({
    cover: imageRefSchema,
    gallery: z.array(imageRefSchema),
    floorPlans: z.array(imageRefSchema),
    brochure: fileRefSchema.nullable(),
  }),

  metrics: z.object({ grossYield: z.number().positive() }).merge(sourcedSchema).nullable(),
  commute: z.array(z.object({ hubId: z.string(), peakMins: z.number().int().positive(), offPeakMins: z.number().int().positive() }).merge(sourcedSchema)),

  seo: z.object({ title: z.string(), description: z.string(), ogImageId: z.string().nullable() }),

  createdAt: isoDate,
  updatedAt: isoDate,
  publishedAt: isoDate.nullable(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

const developerFactField = z.enum(['yearsActive', 'sqftDelivered', 'constructionTech']);

export const developerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  legalName: z.string().min(1),
  about: z.string(),
  yearsActive: z.number().int().positive().nullable(),
  sqftDelivered: z.number().int().positive().nullable(),
  constructionTech: z.string().nullable(),
  // A fact is shown only when a source entry exists for its field.
  sources: z.array(z.object({ field: developerFactField, label: z.string().min(1), url: z.string().url().nullable(), asOf: isoDate })),
  website: z.string().url().nullable(),
  logo: imageRefSchema.nullable(),
});

export const corridorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug,
  description: z.string(),
  svgPathId: z.string().min(1),
  heroImage: imageRefSchema.nullable(),
  order: z.number().int().nonnegative(),
});

export const marketSnapshotSchema = z
  .object({ id: z.string(), corridorId: z.string(), avgPricePerSqft: z.number().positive(), yoyChangePct: z.number() })
  .merge(sourcedSchema);

export const officeHubSchema = z.object({
  id: z.string(),
  name: z.string(),
  corridorId: z.string(),
  geo: z.object({ lat: z.number(), lng: z.number() }),
});

export const enquiryIntentSchema = z.enum(['site-visit', 'price-sheet', 'loan-help', 'general', 'callback']);
export const enquirySourceSchema = z.enum(['card', 'quick-view', 'detail', 'contact', 'shortlist', 'home', 'dock']);
export const enquiryStatusSchema = z.enum(['new', 'contacted', 'visit-scheduled', 'closed', 'spam']);

export const enquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().nullable(),
  intent: enquiryIntentSchema,
  preferredDate: isoDate.nullable(),
  message: z.string(),
  propertyId: z.string().nullable(),
  propertySlug: z.string().nullable(),
  propertyTitle: z.string().nullable(),
  source: enquirySourceSchema,
  consentText: z.string(),
  consentVersion: z.string(),
  consentAt: z.string(),
  utm: z.object({ source: z.string().nullable(), medium: z.string().nullable(), campaign: z.string().nullable() }),
  status: enquiryStatusSchema,
  assignedTo: z.string().nullable(),
  notes: z.string(),
  createdAt: z.string(),
});

// What a visitor submits. Server Actions validate this before anything is stored.
export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, '').replace(/^\+?91/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number')),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null))
    .pipe(z.string().email('Enter a valid email').nullable()),
  intent: enquiryIntentSchema,
  preferredDate: z
    .string()
    .optional()
    .transform((value) => (value ? value : null))
    .pipe(isoDate.nullable()),
  message: z.string().trim().max(1000).default(''),
  propertySlug: z.string().optional().nullable(),
  source: enquirySourceSchema,
  consentVersion: z.string().min(1),
  utm: z
    .object({ source: z.string().nullable(), medium: z.string().nullable(), campaign: z.string().nullable() })
    .default({ source: null, medium: null, campaign: null }),
  // Hidden honeypot field; real visitors leave it empty.
  website: z.string().max(0).optional(),
});

/** The visitor-editable part of an enquiry, shared by every lead form (react-hook-form + zod). */
export const leadFieldsSchema = enquiryInputSchema.pick({ name: true, phone: true, email: true, intent: true, preferredDate: true, message: true, website: true });

export const siteSettingsSchema = z.object({
  contact: z.object({ phone: z.string(), phoneDisplay: z.string(), whatsapp: z.string(), email: z.string().email() }),
  agent: z.object({
    name: z.string(),
    title: z.string(),
    reraNumber: z.string(),
    validFrom: z.string(),
    validTo: z.string(),
    verifyUrl: z.string().url(),
  }),
  partnerDeveloper: z.string(),
  costs: z.object({
    stampDutyPct: z.number().nonnegative(),
    registrationPct: z.number().nonnegative(),
    source: z.string(),
    asOf: isoDate,
    note: z.string(),
  }),
  disclaimers: z.object({ portal: z.string(), listing: z.string(), costs: z.string(), commute: z.string() }),
  consentVersion: z.string(),
  consentText: z.string(),
  privacyNote: z.string(),
});

export const userSchema = z.object({
  uid: z.string(),
  role: z.enum(['admin', 'editor', 'viewer']),
  displayName: z.string(),
  email: z.string().email(),
  shortlist: z.array(z.string()),
});
