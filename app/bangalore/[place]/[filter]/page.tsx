import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingView } from '@/components/landing/LandingView';
import { getCorridors, getListingCards } from '@/lib/data/cached';
import { allLandingPages, resolveLanding } from '@/lib/landing';
import { landingMetadata } from '@/lib/landingMeta';

export const revalidate = 3600;

// A place plus a search: /bangalore/whitefield/2-bhk-flats. Exists only with at least two matches.
async function load(place: string, filter: string) {
  const [properties, corridors] = await Promise.all([getListingCards(), getCorridors()]);
  return { page: resolveLanding([place, filter], properties, corridors), all: allLandingPages(properties, corridors) };
}

export async function generateMetadata({ params }: { params: { place: string; filter: string } }): Promise<Metadata> {
  const { page } = await load(params.place, params.filter);
  // Not found here, before the page streams, so the response is a real 404 (not a soft 404).
  if (!page) notFound();
  return landingMetadata(page);
}

export default async function PlaceFilterPage({ params }: { params: { place: string; filter: string } }) {
  const { page, all } = await load(params.place, params.filter);
  if (!page) notFound();
  return <LandingView page={page} all={all} />;
}
