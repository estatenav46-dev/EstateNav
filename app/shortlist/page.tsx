import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShortlistView } from './ShortlistView';
import { getListingCards, getSettings } from '@/lib/data/cached';

export const metadata: Metadata = { title: 'Your wishlist', robots: { index: false } };
export const revalidate = 3600;

export default async function ShortlistPage() {
  const [properties, settings] = await Promise.all([getListingCards(), getSettings()]);
  return (
    <Suspense>
      <ShortlistView properties={properties} whatsapp={settings.contact.whatsapp} advisorName={settings.agent.name} />
    </Suspense>
  );
}
