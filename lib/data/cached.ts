import { unstable_cache } from 'next/cache';
import { getRepos } from '.';
import { registerCorridorZones } from '@/lib/regions';
import { toPublicProperty } from './publicView';

// Cached reads for public pages (ISR on Vercel). Admin publish actions call
// revalidateTag('properties' | 'catalogue' | 'settings') to refresh them immediately.
// Development keeps data for 30s (admin saves still refresh instantly by tag) instead of refetching
// Firestore on every request.
const REVALIDATE = process.env.NODE_ENV === 'development' ? 30 : 60;

// Published listings that are not hidden and whose partner is not hidden (both set in the admin).
const cachedProperties = unstable_cache(
  async () => {
    const repos = getRepos();
    const [properties, developers] = await Promise.all([repos.properties.list({ status: 'published' }), repos.developers.list()]);
    const hiddenPartners = new Set(developers.filter((d) => d.hidden).map((d) => d.id));
    return properties.filter((p) => !p.hidden && !hiddenPartners.has(p.developerId)).map(toPublicProperty);
  },
  ['published-properties-v2'],
  { tags: ['properties', 'catalogue'], revalidate: REVALIDATE },
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

/** Partners shown on the website (hidden ones are left out). */
export const getDevelopers = unstable_cache(async () => (await getRepos().developers.list()).filter((d) => !d.hidden), ['developers-visible'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getOfficeHubs = unstable_cache(() => getRepos().corridors.listOfficeHubs(), ['office-hubs'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getMarketSnapshots = unstable_cache(() => getRepos().corridors.listMarketSnapshots(), ['market-snapshots'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getPublishedBlogs = unstable_cache(() => getRepos().blogs.listPublished(), ['published-blogs'], { tags: ['blogs'], revalidate: REVALIDATE });
export const getSettings = unstable_cache(() => getRepos().settings.get(), ['site-settings'], { tags: ['settings'], revalidate: REVALIDATE });
