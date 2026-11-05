// Converter skeletons for Firestore's withConverter(). They are written against local
// minimal types so this file compiles before the `firebase` package is added.
//
// TODO(firebase): when integrating, import { FirestoreDataConverter, Timestamp } from
// 'firebase/firestore' (client) or 'firebase-admin/firestore' (server) and replace the
// local types below. Usage: db.collection('properties').withConverter(propertyConverter).
import { corridorSchema, developerSchema, enquirySchema, propertySchema, siteSettingsSchema } from '../../schemas';
import type { Corridor, Developer, Enquiry, Property, SiteSettings } from '../../types';

type DocumentData = Record<string, unknown>;
type TimestampLike = { toDate(): Date };
type Snapshot = { id: string; data(): DocumentData };

export interface Converter<T> {
  toFirestore(model: T): DocumentData;
  fromFirestore(snapshot: Snapshot): T;
}

const isTimestamp = (value: unknown): value is TimestampLike =>
  typeof value === 'object' && value !== null && typeof (value as TimestampLike).toDate === 'function';

/** Firestore Timestamps become ISO strings in the domain model (and back in toFirestore). */
function timestampsToIso(data: DocumentData): DocumentData {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (isTimestamp(value)) return [key, value.toDate().toISOString()];
      if (value && typeof value === 'object' && !Array.isArray(value)) return [key, timestampsToIso(value as DocumentData)];
      return [key, value];
    }),
  );
}

function makeConverter<T extends { id: string }>(parse: (input: unknown) => T): Converter<T> {
  return {
    toFirestore(model) {
      // TODO(firebase): convert createdAt/updatedAt/publishedAt/possession.date with Timestamp.fromDate().
      const { id: _id, ...rest } = model;
      return rest as DocumentData;
    },
    fromFirestore(snapshot) {
      return parse({ id: snapshot.id, ...timestampsToIso(snapshot.data()) });
    },
  };
}

export const propertyConverter = makeConverter<Property>((input) => propertySchema.parse(input));
export const developerConverter = makeConverter<Developer>((input) => developerSchema.parse(input));
export const corridorConverter = makeConverter<Corridor>((input) => corridorSchema.parse(input));
export const enquiryConverter = makeConverter<Enquiry>((input) => enquirySchema.parse(input));
export const settingsConverter: Converter<SiteSettings & { id: string }> = makeConverter((input) => ({
  ...siteSettingsSchema.parse(input),
  id: 'site',
}));
