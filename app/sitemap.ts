import type { MetadataRoute } from 'next';
import { getPublishedBlogs, getPublishedProperties } from '@/lib/data/cached';
import { SITE_URL } from '@/lib/site';

// /admin and personal shortlists are deliberately left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, posts] = await Promise.all([getPublishedProperties(), getPublishedBlogs()]);
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/blogs`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((p) => ({ url: `${SITE_URL}/blogs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...properties.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
