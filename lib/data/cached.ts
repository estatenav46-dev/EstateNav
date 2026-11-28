import { unstable_cache, unstable_noStore } from 'next/cache';
import { getRepos } from '.';
import { registerCorridorZones } from '@/lib/regions';
import { toCardView, toPublicProperty } from './publicView';

// Cached reads for public pages (ISR on Vercel). Admin publish actions call
// revalidateTag('properties' | 'catalogue' | 'settings') through /api/revalidate, so admin changes
// show at once; the timed refresh is only a safety net. It is kept long (1 hour) because every
// refresh re-reads whole Firestore collections, and a short timer used up the free plan's daily
// read quota. Development keeps data for 30s.
const REVALIDATE = process.env.NODE_ENV === 'development' ? 30 : 3600;

// During `next build` many pages render in parallel and each would read the same collections.
// Share one read per collection per build worker instead.
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const buildMemo = new Map<string, Promise<unknown>>();
function once<T>(key: string, read: () => Promise<T>): () => Promise<T> {
  return () => {
    if (!isBuild) return read();
    let hit = buildMemo.get(key) as Promise<T> | undefined;
    if (!hit) {
      // A failed read stays failed for the rest of the build, so the other pages don't retry it.
      hit = read();
      buildMemo.set(key, hit);
    }
    return hit;
  };
}

// If Firestore refuses a read during the build (for example "Quota exceeded"), don't fail the whole
// deploy: the page is left out of the build and rendered on its first visit instead
// (unstable_noStore marks it dynamic). Outside the build, errors are thrown as usual.
function guard<A extends unknown[], T>(read: (...args: A) => Promise<T>): (...args: A) => Promise<T> {
  return async (...args: A) => {
    try {
      return await read(...args);
    } catch (error) {
      if (isBuild) {
        console.warn(`[data] Firestore read failed during build; the page will render on first visit instead. ${(error as Error)?.message ?? error}`);
        unstable_noStore();
      }
      throw error;
    }
  };
}

// Published listings that are not hidden and whose partner is not hidden (both set in the admin).
const cachedProperties = guard(unstable_cache(
  once('properties', async () => {
    const repos = getRepos();
    const [properties, developers] = await Promise.all([repos.properties.list({ status: 'published' }), repos.developers.list()]);
    const hiddenPartners = new Set(developers.filter((d) => d.hidden).map((d) => d.id));
    return properties.filter((p) => !p.hidden && !hiddenPartners.has(p.developerId)).map(toPublicProperty);
  }),
  ['published-properties-v2'],
  { tags: ['properties', 'catalogue'], revalidate: REVALIDATE },
));
const cachedCorridors = guard(unstable_cache(once('corridors', () => getRepos().corridors.list()), ['corridors'], { tags: ['catalogue'], revalidate: REVALIDATE }));

/** Corridors, with their admin-set regions registered for zoneOfCorridor(). */
export async function getCorridors() {
  const corridors = await cachedCorridors();
  registerCorridorZones(corridors);
  return corridors;
}

/** Published listings; corridors load alongside so region lookups are ready. */
export async function getPublishedProperties() {
  const [properties] = await Promise.all([cachedProperties(), getCorridors()]);
  return properties;
}

/** Published listings for cards, search and compare (lighter than the full records). */
export async function getListingCards() {
  return (await getPublishedProperties()).map(toCardView);
}

export async function getPublishedProperty(slug: string) {
  const all = await getPublishedProperties();
  return all.find((property) => property.slug === slug) ?? null;
}

/** Partners shown on the website (hidden ones are left out). */
export const getDevelopers = guard(unstable_cache(once('developers', async () => (await getRepos().developers.list()).filter((d) => !d.hidden)), ['developers-visible'], { tags: ['catalogue'], revalidate: REVALIDATE }));
export const getOfficeHubs = guard(unstable_cache(once('office-hubs', () => getRepos().corridors.listOfficeHubs()), ['office-hubs'], { tags: ['catalogue'], revalidate: REVALIDATE }));
export const getMarketSnapshots = guard(unstable_cache(once('market', () => getRepos().corridors.listMarketSnapshots()), ['market-snapshots'], { tags: ['catalogue'], revalidate: REVALIDATE }));
export const getPublishedBlogs = guard(unstable_cache(once('blogs', () => getRepos().blogs.listPublished()), ['published-blogs'], { tags: ['blogs'], revalidate: REVALIDATE }));
export const getSettings = guard(unstable_cache(once('settings', () => getRepos().settings.get()), ['site-settings'], { tags: ['settings'], revalidate: REVALIDATE }));
