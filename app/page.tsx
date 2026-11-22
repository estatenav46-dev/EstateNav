import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/HomeHero';
import { MarketTicker } from '@/components/home/MarketTicker';
import { RegionTiles } from '@/components/home/RegionTiles';
import { NeedTiles } from '@/components/home/NeedTiles';
import { ForYou } from '@/components/home/ForYou';
import { SavedRail } from '@/components/home/SavedRail';
import { AdvisoryBand } from '@/components/home/AdvisoryBand';
import { FromTheBlog } from '@/components/home/FromTheBlog';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getMarketSnapshots, getPublishedBlogs, getListingCards, getSettings } from '@/lib/data/cached';
import { realEstateAgentJsonLd } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'EstateNav | Verified Bengaluru homes, plots & workspaces' },
  description:
    'Verified Bengaluru homes, plots and workspaces on Sarjapur Road, Whitefield, ORR, Electronic City and North Bengaluru — direct-developer pricing and zero buyer brokerage.',
  alternates: { canonical: '/' },
};

// Hero (auto-cycling segments) → market pulse → region → need → your brief / picks → blog → advisory.
export default async function HomePage() {
  const [properties, corridors, snapshots, settings, posts] = await Promise.all([
    getListingCards(),
    getCorridors(),
    getMarketSnapshots(),
    getSettings(),
    getPublishedBlogs(),
  ]);

  return (
    <main id="main">
      <JsonLd data={realEstateAgentJsonLd(settings, corridors.map((c) => c.name))} />
      <HomeHero properties={properties} corridors={corridors} />
      <MarketTicker snapshots={snapshots} corridors={corridors} />
      <SavedRail properties={properties} />
      <RegionTiles properties={properties} advisorName={settings.agent.name} whatsapp={settings.contact.whatsapp} />
      <NeedTiles properties={properties} />
      <ForYou properties={properties} settings={settings} />
      <FromTheBlog posts={posts} />
      <AdvisoryBand settings={settings} />
    </main>
  );
}
