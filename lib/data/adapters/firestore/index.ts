// Firestore adapter: NOT wired. It implements the same interfaces as the mock adapter so
// switching NEXT_PUBLIC_DATA_SOURCE to 'firestore' needs no page or component changes.
//
// TODO(firebase), in order:
// 1. npm install firebase firebase-admin
// 2. Server repos (this file) use the Admin SDK with FIREBASE_ADMIN_* env vars, so enquiries
//    and admin writes never come from the browser (see firestore.rules.draft).
// 3. Read with .withConverter(...) from ./converters and keep the in-memory filtering used by
//    lib/listingFilters.ts for BHK, amenities, approvals and lenses. With fewer than ~500
//    listings this avoids Firestore's single array-contains-any per query limit; the
//    composite indexes in firestore.indexes.json cover the ordered queries.
// 4. After admin writes, call revalidateTag('properties') (already done in app/actions/admin.ts).
import type { CorridorRepo, DeveloperRepo, LeadRepo, MediaRepo, PropertyRepo, Repos, SettingsRepo } from '../../repository';

const notConnected = (what: string) => async (): Promise<never> => {
  throw new Error(`Firestore adapter is not connected yet (${what}). Set NEXT_PUBLIC_DATA_SOURCE=mock or finish the TODOs in lib/data/adapters/firestore.`);
};

const properties: PropertyRepo = {
  list: notConnected('properties.list'), // where('status','==','published').where('segment','==',…).orderBy('featuredRank')
  getBySlug: notConnected('properties.getBySlug'), // where('slug','==',slug).limit(1)
  getById: notConnected('properties.getById'),
  isSlugAvailable: notConnected('properties.isSlugAvailable'),
  save: notConnected('properties.save'), // set(..., { merge: true }) + serverTimestamp() for updatedAt
  setStatus: notConnected('properties.setStatus'),
  setFeatured: notConnected('properties.setFeatured'),
  duplicate: notConnected('properties.duplicate'),
};

const leads: LeadRepo = {
  create: notConnected('leads.create'), // Admin SDK only; clients are denied by the rules
  list: notConnected('leads.list'),
  update: notConnected('leads.update'),
};

const developers: DeveloperRepo = {
  list: notConnected('developers.list'),
  get: notConnected('developers.get'),
  save: notConnected('developers.save'),
};

const corridors: CorridorRepo = {
  list: notConnected('corridors.list'),
  get: notConnected('corridors.get'),
  save: notConnected('corridors.save'),
  listOfficeHubs: notConnected('officeHubs.list'),
  listMarketSnapshots: notConnected('marketSnapshots.list'),
};

const settings: SettingsRepo = {
  get: notConnected('settings.get'), // doc('settings/site')
  save: notConnected('settings.save'),
};

export const firestoreRepos: Repos = { properties, leads, developers, corridors, settings };

// Browser uploads: uploadBytesResumable(ref(storage, `${path}/${id}.${ext}`)) reporting
// snapshot.bytesTransferred / totalBytes to onProgress, then getDownloadURL().
export const firestoreMediaRepo: MediaRepo = {
  upload: notConnected('media.upload'),
  remove: notConnected('media.remove'),
};
