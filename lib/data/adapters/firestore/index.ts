import { getAdminFirestore } from './admin';
import {
  corridorConverter,
  developerConverter,
  enquiryConverter,
  marketSnapshotConverter,
  officeHubConverter,
  propertyConverter,
  settingsConverter,
} from './converters';
import {
  corridorSchema,
  developerSchema,
  enquirySchema,
  marketSnapshotSchema,
  propertySchema,
  siteSettingsSchema,
} from '../../schemas';
import type {
  CorridorRepo,
  DeveloperRepo,
  LeadRepo,
  MediaRepo,
  PropertyDraft,
  PropertyQuery,
  PropertyRepo,
  Repos,
  SettingsRepo,
} from '../../repository';
import type { Corridor, Developer, Enquiry, MarketSnapshot, OfficeHub, Property, PublishStatus, SiteSettings } from '../../types';
import { seedSettings } from '../mock/seed';

const today = () => new Date().toISOString().slice(0, 10);

const properties: PropertyRepo = {
  async list(query: PropertyQuery = {}): Promise<Property[]> {
    const db = getAdminFirestore();
    const status = query.status ?? 'published';
    
    // Fetch from Firestore
    let q: FirebaseFirestore.Query<Property> = db.collection('properties').withConverter(propertyConverter);
    if (status !== 'any') {
      q = q.where('status', '==', status);
    }
    if (query.segment) {
      q = q.where('segment', '==', query.segment);
    }
    if (query.transaction) {
      q = q.where('transaction', '==', query.transaction);
    }
    if (query.corridorId) {
      q = q.where('corridorId', '==', query.corridorId);
    }

    const snapshot = await q.get();
    let results: Property[] = snapshot.docs.map((doc) => doc.data());

    if (query.featuredOnly) {
      results = results.filter((p) => p.featured);
    }

    results.sort((a, b) => a.featuredRank - b.featuredRank);
    return results;
  },

  async getBySlug(slug: string): Promise<Property | null> {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('properties')
      .withConverter(propertyConverter)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  },

  async getById(id: string): Promise<Property | null> {
    const db = getAdminFirestore();
    const doc = await db.collection('properties').doc(id).withConverter(propertyConverter).get();
    if (!doc.exists) return null;
    return doc.data() ?? null;
  },

  async isSlugAvailable(slug: string, exceptId?: string): Promise<boolean> {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('properties')
      .where('slug', '==', slug)
      .limit(2)
      .get();

    if (snapshot.empty) return true;
    return snapshot.docs.every((d) => d.id === exceptId);
  },

  async save(draft: PropertyDraft, actor: string): Promise<Property> {
    const db = getAdminFirestore();
    const docRef = db.collection('properties').doc(draft.id).withConverter(propertyConverter);
    const existingSnap = await docRef.get();
    const existing = existingSnap.exists ? existingSnap.data() : null;

    const now = today();
    const record = propertySchema.parse({
      ...draft,
      createdAt: existing?.createdAt ?? now,
      createdBy: existing?.createdBy ?? actor,
      updatedAt: now,
      updatedBy: actor,
      publishedAt: draft.status === 'published' ? existing?.publishedAt ?? now : existing?.publishedAt ?? null,
    });

    await docRef.set(record);
    return record;
  },

  async setStatus(id: string, status: PublishStatus, actor: string): Promise<Property> {
    const current = await properties.getById(id);
    if (!current) throw new Error(`Property ${id} not found`);
    return properties.save({ ...current, status }, actor);
  },

  async setFeatured(id: string, featured: boolean, actor: string): Promise<Property> {
    const current = await properties.getById(id);
    if (!current) throw new Error(`Property ${id} not found`);
    return properties.save({ ...current, featured }, actor);
  },

  async duplicate(id: string, actor: string): Promise<Property> {
    const current = await properties.getById(id);
    if (!current) throw new Error(`Property ${id} not found`);

    let n = 2;
    while (!(await properties.isSlugAvailable(`${current.slug}-copy-${n}`))) {
      n += 1;
    }
    const slug = `${current.slug}-copy-${n}`;
    const newId = `${current.id}-copy-${Date.now().toString(36)}`;

    return properties.save(
      {
        ...current,
        id: newId,
        slug,
        title: `${current.title} (copy)`,
        status: 'draft',
        featured: false,
        publishedAt: null,
      },
      actor,
    );
  },
};

const leads: LeadRepo = {
  async create(input: Omit<Enquiry, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'notes'>): Promise<Enquiry> {
    const db = getAdminFirestore();
    const id = `enq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const enquiry = enquirySchema.parse({
      ...input,
      id,
      status: 'new',
      assignedTo: null,
      notes: '',
      createdAt: new Date().toISOString(),
    });

    await db.collection('enquiries').doc(id).withConverter(enquiryConverter).set(enquiry);
    return enquiry;
  },

  async list(filter = {}): Promise<Enquiry[]> {
    const db = getAdminFirestore();
    const snapshot = await db.collection('enquiries').withConverter(enquiryConverter).get();
    let results = snapshot.docs.map((d) => d.data());

    if (filter.status) {
      results = results.filter((e) => e.status === filter.status);
    }
    if (filter.since) {
      results = results.filter((e) => e.createdAt >= filter.since!);
    }

    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return results;
  },

  async update(id: string, patch: Partial<Pick<Enquiry, 'status' | 'notes' | 'assignedTo'>>): Promise<Enquiry> {
    const db = getAdminFirestore();
    const docRef = db.collection('enquiries').doc(id).withConverter(enquiryConverter);
    const snap = await docRef.get();
    if (!snap.exists) throw new Error(`Enquiry ${id} not found`);

    const updated = enquirySchema.parse({ ...snap.data()!, ...patch });
    await docRef.set(updated);
    return updated;
  },
};

const developers: DeveloperRepo = {
  async list(): Promise<Developer[]> {
    const db = getAdminFirestore();
    const snapshot = await db.collection('developers').withConverter(developerConverter).get();
    return snapshot.docs.map((d) => d.data());
  },

  async get(id: string): Promise<Developer | null> {
    const db = getAdminFirestore();
    const doc = await db.collection('developers').doc(id).withConverter(developerConverter).get();
    return doc.exists ? doc.data()! : null;
  },

  async save(developer: Developer): Promise<Developer> {
    const db = getAdminFirestore();
    const record = developerSchema.parse(developer);
    await db.collection('developers').doc(record.id).withConverter(developerConverter).set(record);

    // Update denormalized developerName in properties
    const props = await db.collection('properties').where('developerId', '==', record.id).get();
    const batch = db.batch();
    props.docs.forEach((doc) => {
      batch.update(doc.ref, { developerName: record.name });
    });
    if (!props.empty) {
      await batch.commit();
    }

    return record;
  },
};

const corridors: CorridorRepo = {
  async list(): Promise<Corridor[]> {
    const db = getAdminFirestore();
    const snapshot = await db.collection('corridors').withConverter(corridorConverter).get();
    const results = snapshot.docs.map((d) => d.data());
    results.sort((a, b) => a.order - b.order);
    return results;
  },

  async get(id: string): Promise<Corridor | null> {
    const db = getAdminFirestore();
    const doc = await db.collection('corridors').doc(id).withConverter(corridorConverter).get();
    return doc.exists ? doc.data()! : null;
  },

  async save(corridor: Corridor): Promise<Corridor> {
    const db = getAdminFirestore();
    const record = corridorSchema.parse(corridor);
    await db.collection('corridors').doc(record.id).withConverter(corridorConverter).set(record);

    // Update denormalized corridorName in properties
    const props = await db.collection('properties').where('corridorId', '==', record.id).get();
    const batch = db.batch();
    props.docs.forEach((doc) => {
      batch.update(doc.ref, { corridorName: record.name });
    });
    if (!props.empty) {
      await batch.commit();
    }

    return record;
  },

  async listOfficeHubs(): Promise<OfficeHub[]> {
    const db = getAdminFirestore();
    const snapshot = await db.collection('officeHubs').withConverter(officeHubConverter).get();
    return snapshot.docs.map((d) => d.data());
  },

  async listMarketSnapshots(corridorId?: string): Promise<MarketSnapshot[]> {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query<MarketSnapshot> = db.collection('marketSnapshots').withConverter(marketSnapshotConverter);
    if (corridorId) {
      q = q.where('corridorId', '==', corridorId);
    }
    const snapshot = await q.get();
    return snapshot.docs.map((d) => d.data());
  },

  async saveMarketSnapshot(snapshot: MarketSnapshot): Promise<MarketSnapshot> {
    const db = getAdminFirestore();
    const record = marketSnapshotSchema.parse(snapshot);
    await db.collection('marketSnapshots').doc(record.id).withConverter(marketSnapshotConverter).set(record);
    return record;
  },

  async deleteMarketSnapshot(id: string): Promise<void> {
    await getAdminFirestore().collection('marketSnapshots').doc(id).delete();
  },
};

const settings: SettingsRepo = {
  async get(): Promise<SiteSettings> {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('site').withConverter(settingsConverter).get();
    if (doc.exists) {
      const { id: _id, ...rest } = doc.data()!;
      return rest;
    }
    return seedSettings;
  },

  async save(next: SiteSettings): Promise<SiteSettings> {
    const db = getAdminFirestore();
    const record = siteSettingsSchema.parse(next);
    await db.collection('settings').doc('site').withConverter(settingsConverter).set({ ...record, id: 'site' });
    return record;
  },
};

export const firestoreRepos: Repos = { properties, leads, developers, corridors, settings };

// Fallback media repo if invoked on server; client uploads use Cloudinary or browser repo
export const firestoreMediaRepo: MediaRepo = {
  async upload() {
    throw new Error('Direct Firestore media upload is not used; Cloudinary handles media uploads.');
  },
  async remove() {
    // Handled via Cloudinary
  },
};
