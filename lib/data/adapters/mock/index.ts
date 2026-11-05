import { corridorSchema, developerSchema, enquirySchema, propertySchema, siteSettingsSchema } from '../../schemas';
import type { CorridorRepo, DeveloperRepo, LeadRepo, PropertyRepo, Repos, SettingsRepo } from '../../repository';
import type { Corridor, Developer, Enquiry, Property, SiteSettings } from '../../types';
import { seedCorridors, seedDevelopers, seedEnquiries, seedOfficeHubs, seedProperties, seedSettings } from './seed';

// In-memory store. It lives on globalThis so dev hot reloads keep edits made in /admin.
// On Vercel each serverless instance has its own copy, which is fine for previews only.
type Store = { properties: Property[]; developers: Developer[]; corridors: Corridor[]; enquiries: Enquiry[]; settings: SiteSettings };

const globalStore = globalThis as typeof globalThis & { __estatenavMockStore?: Store };

function createStore(): Store {
  // Validate the seed against the schemas once, so a bad record fails loudly at build time.
  seedProperties.forEach((p) => propertySchema.parse(p));
  seedDevelopers.forEach((d) => developerSchema.parse(d));
  seedCorridors.forEach((c) => corridorSchema.parse(c));
  seedEnquiries.forEach((e) => enquirySchema.parse(e));
  siteSettingsSchema.parse(seedSettings);
  return structuredClone({
    properties: seedProperties,
    developers: seedDevelopers,
    corridors: seedCorridors,
    enquiries: seedEnquiries,
    settings: seedSettings,
  });
}

const store = (globalStore.__estatenavMockStore ??= createStore());
const today = () => new Date().toISOString().slice(0, 10);
const copy = <T,>(value: T): T => structuredClone(value);

const properties: PropertyRepo = {
  async list(query = {}) {
    const status = query.status ?? 'published';
    return copy(
      store.properties
        .filter((p) => status === 'any' || p.status === status)
        .filter((p) => !query.segment || p.segment === query.segment)
        .filter((p) => !query.transaction || p.transaction === query.transaction)
        .filter((p) => !query.corridorId || p.corridorId === query.corridorId)
        .filter((p) => !query.featuredOnly || p.featured)
        .sort((a, b) => a.featuredRank - b.featuredRank),
    );
  },
  async getBySlug(slug) {
    const found = store.properties.find((p) => p.slug === slug);
    return found ? copy(found) : null;
  },
  async getById(id) {
    const found = store.properties.find((p) => p.id === id);
    return found ? copy(found) : null;
  },
  async isSlugAvailable(slug, exceptId) {
    return !store.properties.some((p) => p.slug === slug && p.id !== exceptId);
  },
  async save(draft, actor) {
    const existing = store.properties.find((p) => p.id === draft.id);
    const now = today();
    const record = propertySchema.parse({
      ...draft,
      createdAt: existing?.createdAt ?? now,
      createdBy: existing?.createdBy ?? actor,
      updatedAt: now,
      updatedBy: actor,
      publishedAt: draft.status === 'published' ? existing?.publishedAt ?? now : existing?.publishedAt ?? null,
    });
    store.properties = existing ? store.properties.map((p) => (p.id === record.id ? record : p)) : [...store.properties, record];
    return copy(record);
  },
  async setStatus(id, status, actor) {
    const current = store.properties.find((p) => p.id === id);
    if (!current) throw new Error(`Property ${id} not found`);
    return properties.save({ ...current, status }, actor);
  },
  async setFeatured(id, featured, actor) {
    const current = store.properties.find((p) => p.id === id);
    if (!current) throw new Error(`Property ${id} not found`);
    return properties.save({ ...current, featured }, actor);
  },
  async duplicate(id, actor) {
    const current = store.properties.find((p) => p.id === id);
    if (!current) throw new Error(`Property ${id} not found`);
    let n = 2;
    while (store.properties.some((p) => p.slug === `${current.slug}-copy-${n}`)) n += 1;
    const slug = `${current.slug}-copy-${n}`;
    return properties.save({ ...copy(current), id: slug, slug, title: `${current.title} (copy)`, status: 'draft', featured: false, publishedAt: null }, actor);
  },
};

const leads: LeadRepo = {
  async create(input) {
    const enquiry = enquirySchema.parse({
      ...input,
      id: `enq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'new',
      assignedTo: null,
      notes: '',
      createdAt: new Date().toISOString(),
    });
    store.enquiries = [enquiry, ...store.enquiries];
    return copy(enquiry);
  },
  async list(filter = {}) {
    return copy(
      store.enquiries
        .filter((e) => !filter.status || e.status === filter.status)
        .filter((e) => !filter.since || e.createdAt >= filter.since)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
  async update(id, patch) {
    const current = store.enquiries.find((e) => e.id === id);
    if (!current) throw new Error(`Enquiry ${id} not found`);
    const next = enquirySchema.parse({ ...current, ...patch });
    store.enquiries = store.enquiries.map((e) => (e.id === id ? next : e));
    return copy(next);
  },
};

const developers: DeveloperRepo = {
  async list() {
    return copy(store.developers);
  },
  async get(id) {
    const found = store.developers.find((d) => d.id === id);
    return found ? copy(found) : null;
  },
  async save(developer) {
    const record = developerSchema.parse(developer);
    const exists = store.developers.some((d) => d.id === record.id);
    store.developers = exists ? store.developers.map((d) => (d.id === record.id ? record : d)) : [...store.developers, record];
    store.properties = store.properties.map((p) => (p.developerId === record.id ? { ...p, developerName: record.name } : p));
    return copy(record);
  },
};

const corridors: CorridorRepo = {
  async list() {
    return copy([...store.corridors].sort((a, b) => a.order - b.order));
  },
  async get(id) {
    const found = store.corridors.find((c) => c.id === id);
    return found ? copy(found) : null;
  },
  async save(corridor) {
    const record = corridorSchema.parse(corridor);
    const exists = store.corridors.some((c) => c.id === record.id);
    store.corridors = exists ? store.corridors.map((c) => (c.id === record.id ? record : c)) : [...store.corridors, record];
    store.properties = store.properties.map((p) => (p.corridorId === record.id ? { ...p, corridorName: record.name } : p));
    return copy(record);
  },
  async listOfficeHubs() {
    return copy(seedOfficeHubs);
  },
  // No sourced market data yet, so every consumer hides its stats strip.
  async listMarketSnapshots() {
    return [];
  },
};

const settings: SettingsRepo = {
  async get() {
    return copy(store.settings);
  },
  async save(next) {
    store.settings = siteSettingsSchema.parse(next);
    return copy(store.settings);
  },
};

export const mockRepos: Repos = { properties, leads, developers, corridors, settings };
