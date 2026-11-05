import type { MetadataRoute } from 'next';
import { getPublishedProperties } from '@/lib/data/cached';
import { SITE_URL } from '@/lib/site';

// /admin and personal shortlists are deliberately left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedProperties();
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    ...properties.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
