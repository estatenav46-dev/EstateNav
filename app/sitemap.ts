import type { MetadataRoute } from 'next';
import { getCorridors, getListingCards, getPublishedBlogs } from '@/lib/data/cached';
import { allLandingPages, landingFacts } from '@/lib/landing';
import { SITE_URL } from '@/lib/site';

// /admin, personal shortlists and filtered explore URLs (?seg=…) are deliberately left out; the
// /bangalore search pages stand in for those filters and are listed only while they have listings.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, posts, corridors] = await Promise.all([getListingCards(), getPublishedBlogs(), getCorridors()]);
  const landing = allLandingPages(properties, corridors);
  const newest = landingFacts(properties).updatedAt ?? undefined;
  return [
    { url: SITE_URL, lastModified: newest, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/bangalore`, lastModified: newest, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/properties`, lastModified: newest, changeFrequency: 'daily', priority: 0.8 },
    ...landing.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: landingFacts(p.listings).updatedAt ?? undefined,
      changeFrequency: 'daily' as const,
      priority: p.filter ? (p.place.kind === 'city' ? 0.8 : 0.7) : 0.8,
    })),
    ...properties.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.9 })),
    { url: `${SITE_URL}/blogs`, changeFrequency: 'weekly', priority: 0.6 },
    ...posts.map((p) => ({ url: `${SITE_URL}/blogs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
