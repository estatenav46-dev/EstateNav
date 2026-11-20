import { unstable_cache } from 'next/cache';
import { getRepos } from '.';
import { registerCorridorZones } from '@/lib/regions';
import { toPublicProperty } from './publicView';

// Cached reads for public pages (ISR on Vercel). Admin publish actions call
// revalidateTag('properties' | 'catalogue' | 'settings') to refresh them immediately.
// Development keeps data for 30s (admin saves still refresh instantly by tag) instead of refetching
// Firestore on every request.
const REVALIDATE = process.env.NODE_ENV === 'development' ? 30 : 60;

const cachedProperties = unstable_cache(
  async () => (await getRepos().properties.list({ status: 'published' })).map(toPublicProperty),
  ['published-properties'],
  { tags: ['properties'], revalidate: REVALIDATE },
);
const cachedCorridors = unstable_cache(() => getRepos().corridors.list(), ['corridors'], { tags: ['catalogue'], revalidate: REVALIDATE });

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

export async function getPublishedProperty(slug: string) {
  const all = await getPublishedProperties();
  return all.find((property) => property.slug === slug) ?? null;
}

export const getDevelopers = unstable_cache(() => getRepos().developers.list(), ['developers'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getOfficeHubs = unstable_cache(() => getRepos().corridors.listOfficeHubs(), ['office-hubs'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getMarketSnapshots = unstable_cache(() => getRepos().corridors.listMarketSnapshots(), ['market-snapshots'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getPublishedBlogs = unstable_cache(() => getRepos().blogs.listPublished(), ['published-blogs'], { tags: ['blogs'], revalidate: REVALIDATE });
export const getSettings = unstable_cache(() => getRepos().settings.get(), ['site-settings'], { tags: ['settings'], revalidate: REVALIDATE });
