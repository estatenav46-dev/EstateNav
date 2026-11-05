import { notFound } from 'next/navigation';
import { QuickView } from '@/components/property/QuickView';
import { getPublishedProperty, getSettings } from '@/lib/data/cached';

export const revalidate = 300;

export default async function QuickViewPage({ params }: { params: { slug: string } }) {
  const [property, settings] = await Promise.all([getPublishedProperty(params.slug), getSettings()]);
  if (!property) notFound();
  return <QuickView property={property} whatsappNumber={settings.contact.whatsapp} />;
}
