'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { useAuth } from '@/lib/auth/context';
import { shortlistStore } from '@/lib/ui/stores';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from './SectionHeading';

// Signed-in visitors see their saved homes near the top of the home page.
export function SavedRail({ properties }: { properties: Property[] }) {
  const { user } = useAuth();
  const ids = shortlistStore.useValue();
  if (!user || !ids.length) return null;
  const saved = ids.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  if (!saved.length) return null;
  const first = (user.displayName || '').trim().split(/\s+/)[0];

  return (
    <section aria-labelledby="saved-title" className="mx-auto max-w-container px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading
        kicker={first ? `Welcome back, ${first}` : 'Welcome back'}
        id="saved-title"
        title={<>Your <span className="text-accent-ink">wishlist.</span></>}
        action={
          <Link href="/shortlist" className="btn-secondary min-h-[44px] px-5">
            View all {saved.length} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
      <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overflow-y-hidden px-4 pb-3 pt-1 sm:mx-0 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-4">
        {saved.slice(0, 4).map((p, i) => (
          <Reveal as="li" key={p.id} index={i} variant="zoom" className="w-[80%] shrink-0 snap-start sm:w-auto">
            <ExploreCard property={p} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 80vw" />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
