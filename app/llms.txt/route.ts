import { getCorridors, getListingCards, getSettings } from '@/lib/data/cached';
import { allLandingPages, landingHeading, landingSummary, priceRangeText, landingFacts } from '@/lib/landing';
import { priceLabel } from '@/lib/property';
import { SITE_URL } from '@/lib/site';

export const revalidate = 300;

// llms.txt (llmstxt.org): a plain-text map of the site for AI assistants, rebuilt from the live
// listings, so answers about "flats in Whitefield" or a project's price can cite the right page.
export async function GET() {
  const [properties, corridors, settings] = await Promise.all([getListingCards(), getCorridors(), getSettings()]);
  const pages = allLandingPages(properties, corridors);
  const facts = landingFacts(properties);
  const range = priceRangeText(facts);
  const lines = [
    '# EstateNav',
    '',
    `> EstateNav (estatenav.in) is a Bengaluru (Bangalore) property advisory and authorised channel partner of developers. It lists verified new flats, plots and office spaces with direct-developer pricing, zero buyer brokerage and K-RERA registration details. ${facts.count} projects are listed${range ? `, priced ${range}` : ''}.`,
    '',
    `Contact: ${settings.contact.phoneDisplay}, ${settings.contact.email}. Site visits, developer price sheets and home-loan help are free for buyers. Owners can list a property at ${SITE_URL}/contact?intent=list-property.`,
    '',
    '## Search by area and type',
    '',
    `- [All property in Bangalore](${SITE_URL}/bangalore): every listed project by area`,
    ...pages.map((p) => `- [${landingHeading(p)}](${SITE_URL}${p.path}): ${landingSummary(p).split('. ')[0]}.`),
    '',
    '## Projects',
    '',
    ...properties.map(
      (p) =>
        `- [${p.title}](${SITE_URL}/properties/${p.slug}): ${p.developerName}; ${p.locality}, ${p.corridorName}, Bengaluru; ${Array.from(new Set(p.configurations.map((c) => c.label))).slice(0, 4).join(', ') || p.segment}; ${priceLabel(p)}; ${p.possession.label}${p.rera.number ? `; K-RERA ${p.rera.number}` : ''}`,
    ),
    '',
    '## Guides',
    '',
    `- [Blog: Bengaluru property guides](${SITE_URL}/blogs)`,
    `- [Contact an advisor](${SITE_URL}/contact)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
