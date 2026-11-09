import { unstable_cache } from 'next/cache';
import { getRepos } from '.';

// Cached reads for public pages (ISR on Vercel). Admin publish actions call
// revalidateTag('properties' | 'catalogue' | 'settings') to refresh them immediately.
const REVALIDATE = process.env.NODE_ENV === 'development' ? 1 : 60;

export const getPublishedProperties = unstable_cache(
  () => getRepos().properties.list({ status: 'published' }),
  ['published-properties'],
  { tags: ['properties'], revalidate: REVALIDATE },
);

export async function getPublishedProperty(slug: string) {
  const all = await getPublishedProperties();
  return all.find((property) => property.slug === slug) ?? null;
}

export const getCorridors = unstable_cache(() => getRepos().corridors.list(), ['corridors'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getDevelopers = unstable_cache(() => getRepos().developers.list(), ['developers'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getOfficeHubs = unstable_cache(() => getRepos().corridors.listOfficeHubs(), ['office-hubs'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getMarketSnapshots = unstable_cache(() => getRepos().corridors.listMarketSnapshots(), ['market-snapshots'], { tags: ['catalogue'], revalidate: REVALIDATE });
export const getSettings = unstable_cache(() => getRepos().settings.get(), ['site-settings'], { tags: ['settings'], revalidate: REVALIDATE });
