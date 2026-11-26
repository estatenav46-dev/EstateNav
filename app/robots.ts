import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// One wildcard rule: search engines and AI search crawlers (OAI-SearchBot, PerplexityBot,
// Claude-SearchBot…) may read every public page. Private and machine-only paths are kept out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/shortlist', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
