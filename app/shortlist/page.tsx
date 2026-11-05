import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShortlistView } from './ShortlistView';
import { getPublishedProperties, getSettings } from '@/lib/data/cached';

export const metadata: Metadata = { title: 'Your shortlist', robots: { index: false } };
export const revalidate = 300;

export default async function ShortlistPage() {
  const [properties, settings] = await Promise.all([getPublishedProperties(), getSettings()]);
  return (
    <Suspense>
      <ShortlistView properties={properties} whatsapp={settings.contact.whatsapp} advisorName={settings.agent.name} />
    </Suspense>
  );
}
