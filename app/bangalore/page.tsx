import type { Metadata } from 'next';
import { LandingView } from '@/components/landing/LandingView';
import { getCorridors, getListingCards } from '@/lib/data/cached';
import { allLandingPages, CITY_PLACE, LANDING_ROOT, type LandingPage } from '@/lib/landing';
import { landingMetadata } from '@/lib/landingMeta';

export const revalidate = 60;

async function load() {
  const [properties, corridors] = await Promise.all([getListingCards(), getCorridors()]);
  const page: LandingPage = { place: CITY_PLACE, filter: null, path: LANDING_ROOT, listings: properties };
  return { page, all: allLandingPages(properties, corridors) };
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  const meta = { ...landingMetadata(page), title: 'Property in Bangalore: new flats, plots & offices by area' };
  // An empty hub is not worth indexing; it becomes indexable with the first published listing.
  return page.listings.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function BangalorePage() {
  const { page, all } = await load();
  return <LandingView page={page} all={all} />;
}
