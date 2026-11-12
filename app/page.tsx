import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/HomeHero';
import { MarketTicker } from '@/components/home/MarketTicker';
import { RegionTiles } from '@/components/home/RegionTiles';
import { NeedTiles } from '@/components/home/NeedTiles';
import { PartnerShowcase } from '@/components/home/PartnerShowcase';
import { TrustStrip } from '@/components/home/TrustStrip';
import { AdvisorBlock } from '@/components/home/AdvisorBlock';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getDevelopers, getMarketSnapshots, getPublishedProperties, getSettings } from '@/lib/data/cached';
import { realEstateAgentJsonLd } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'EstateNav | Verified Bengaluru homes, plots & workspaces' },
  description:
    'Verified Bengaluru homes, plots and workspaces on Sarjapur Road, Whitefield, ORR, Electronic City and North Bengaluru — direct-developer pricing and zero buyer brokerage.',
  alternates: { canonical: '/' },
};

// Fold 1 hero console + spotlight, Fold 2 sourced corridor ticker, then browse by region or
// need, Fold 3 inline developer partnership, trust strip and the advisor.
export default async function HomePage() {
  const [properties, corridors, developers, snapshots, settings] = await Promise.all([
    getPublishedProperties(),
    getCorridors(),
    getDevelopers(),
    getMarketSnapshots(),
    getSettings(),
  ]);
  const partner = developers.find((d) => d.legalName === settings.partnerDeveloper) ?? developers[0];

  return (
    <main id="main" className="pb-20 md:pb-0">
      <JsonLd data={realEstateAgentJsonLd(settings, corridors.map((c) => c.name))} />
      <HomeHero properties={properties} corridors={corridors} partnerDeveloper={settings.partnerDeveloper} />
      <MarketTicker snapshots={snapshots} corridors={corridors} />
      <RegionTiles properties={properties} advisorName={settings.agent.name} whatsapp={settings.contact.whatsapp} />
      <NeedTiles properties={properties} />
      {partner && (
        <PartnerShowcase developer={partner} legalName={settings.partnerDeveloper} projectCount={properties.filter((p) => p.developerId === partner.id).length} />
      )}
      <TrustStrip />
      <AdvisorBlock settings={settings} />
    </main>
  );
}
