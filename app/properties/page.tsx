import type { Metadata } from 'next';
import PropertyResults from './PropertyResults';
import { getCorridors, getMarketSnapshots, getPublishedProperties, getSettings } from '@/lib/data/cached';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Bengaluru property listings',
  description: 'Filter verified Bengaluru homes, plots and workspaces by corridor, BHK, budget, possession and approvals — direct-developer pricing, zero buyer brokerage.',
  alternates: { canonical: '/properties' },
};


export default async function PropertiesPage() {
  const [properties, corridors, snapshots, settings] = await Promise.all([getPublishedProperties(), getCorridors(), getMarketSnapshots(), getSettings()]);
  return (
    <>
      {/* Filtered links keep results hidden until the filters are applied in the browser. */}
      <script dangerouslySetInnerHTML={{ __html: "if(location.search.length>1)document.documentElement.setAttribute('data-listing-pending','')" }} />
      <PropertyResults properties={properties} corridors={corridors} snapshots={snapshots} costs={settings.costs} costDisclaimer={settings.disclaimers.costs} />
    </>
  );
}
