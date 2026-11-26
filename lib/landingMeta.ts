import type { Metadata } from 'next';
import { landingHeading, landingSummary, type LandingPage } from './landing';

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function landingMetadata(page: LandingPage): Metadata {
  const title = landingHeading(page);
  const description = clip(landingSummary(page), 160);
  const cover = page.listings[0]?.media.cover;
  return {
    title,
    description,
    alternates: { canonical: page.path },
    openGraph: { title, description, url: page.path, type: 'website', ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}) },
  };
}
