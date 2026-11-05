import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/HomeHero';
import { CorridorExplorer } from '@/components/home/CorridorExplorer';
import { PortfolioBento } from '@/components/home/PortfolioBento';
import { PartnerDeveloper } from '@/components/home/PartnerDeveloper';
import { HowItWorks } from '@/components/home/HowItWorks';
import { AdvisorBlock } from '@/components/home/AdvisorBlock';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getDevelopers, getMarketSnapshots, getPublishedProperties, getSettings } from '@/lib/data/cached';
import { realEstateAgentJsonLd } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'EstateNav | Verified Bengaluru homes, plots & workspaces' },
  description: 'Verified Bengaluru homes, plots and workspaces on Sarjapur Road, Whitefield, ORR, Electronic City and North Bengaluru — direct-developer pricing and zero buyer brokerage.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [properties, corridors, developers, snapshots, settings] = await Promise.all([getPublishedProperties(), getCorridors(), getDevelopers(), getMarketSnapshots(), getSettings()]);
  const partner = developers.find((d) => d.legalName === settings.partnerDeveloper) ?? developers[0];

  return (
    <main id="main">
      <JsonLd data={realEstateAgentJsonLd(settings, corridors.map((c) => c.name))} />
      <HomeHero properties={properties} corridors={corridors} />
      <CorridorExplorer corridors={corridors} properties={properties} snapshots={snapshots} />
      <PortfolioBento properties={properties} />
      {partner && <PartnerDeveloper developer={partner} legalName={settings.partnerDeveloper} projectCount={properties.filter((p) => p.developerId === partner.id).length} />}
      <HowItWorks />
      <AdvisorBlock settings={settings} />
    </main>
  );
}
