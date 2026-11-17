'use client';

import { useMemo, useState } from 'react';
import { PenLine, Sparkles } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import { zoneById, zoneOfCorridor } from '@/lib/regions';
import { budgetBucket, conciergeStore, consentStore, prefsStore, profileStore, topInterest } from '@/lib/ui/visitor';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { Reveal } from '@/components/Reveal';
import { ConciergeCard } from '@/components/concierge/ConciergeFlow';
import { SEGMENT_LABEL } from '@/lib/property';
import { SectionHeading } from './SectionHeading';

const GOAL_SEG: Record<string, string> = { 'buy-home': 'residential', plot: 'plot', office: 'commercial' };

// "For you": until a visitor answers the welcome questions, the concierge sits right here in
// the page. Afterwards the section turns into picks from those answers and, with cookie
// consent, the areas and homes they looked at.
export function ForYou({ properties, settings }: { properties: Property[]; settings: SiteSettings }) {
  const consent = consentStore.useValue();
  const profile = profileStore.useValue();
  const prefs = prefsStore.useValue();
  const [justDone, setJustDone] = useState(false);
  const catalogue = useMemo(
    () => properties.map((p) => ({ id: p.id, zone: zoneOfCorridor(p.corridorId), seg: p.segment, rent: p.transaction === 'rent', price: p.priceMin, img: p.media.cover.url, title: p.title })),
    [properties],
  );

  const result = useMemo(() => {
    const signals = consent?.analytics ? profile : { interest: {}, viewed: [] };
    const zone = (prefs?.region && prefs.region !== 'any' ? prefs.region : null) ?? topInterest(signals, 'zone');
    const seg = (prefs?.goal ? GOAL_SEG[prefs.goal] : null) ?? topInterest(signals, 'seg');
    const budget = (prefs?.budget && prefs.budget !== 'any' ? prefs.budget : null) ?? topInterest(signals, 'budget');
    const viewed = signals.viewed.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
    const picked = properties
      .map((p) => {
        let score = 0;
        if (zone && zoneOfCorridor(p.corridorId) === zone) score += 3;
        if (seg && p.segment === seg) score += 2;
        if (budget && budgetBucket(p.priceMin, p.transaction === 'rent') === budget) score += 2;
        if (signals.viewed.slice(0, 3).includes(p.id)) score -= 2;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.p);
    const reasons = [zone && zoneById(zone)?.name, seg && SEGMENT_LABEL[seg as keyof typeof SEGMENT_LABEL]].filter(Boolean) as string[];
    return { picked, viewed: viewed.slice(0, 4), reasons };
  }, [consent?.analytics, profile, prefs, properties]);

  // Stores load after hydration; render nothing until we know which state to show.
  if (consent === undefined) return null;

  if (!prefs || justDone) {
    return (
      <section id="brief" aria-labelledby="brief-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <SectionHeading index="03" kicker="Your brief" id="brief-title" title={<>Thirty seconds, <span className="text-accent-ink">then we shortlist.</span></>} />
        <Reveal variant="zoom" className="mt-6 sm:mt-8">
          <ConciergeCard variant="inline" titleId="brief-step-title" consent={{ text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote }} advisorName={settings.agent.name} catalogue={catalogue} onDone={() => setJustDone(true)} onFinish={() => setJustDone(false)} />
        </Reveal>
        {result.viewed.length > 0 && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span>Recently viewed:</span>
            {result.viewed.map((p) => (
              <a key={p.id} href={`/properties/${p.slug}`} target="_blank" rel="noopener noreferrer" className="chip min-h-[36px] px-3 text-xs">
                {p.title}
              </a>
            ))}
          </p>
        )}
      </section>
    );
  }

  const rail = result.picked.length ? result.picked : result.viewed;
  if (!rail.length) return null;

  return (
    <section id="brief" aria-labelledby="for-you-title" className="mx-auto max-w-container scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <SectionHeading
        index="03"
        kicker={prefs?.name ? `For you, ${prefs.name}` : 'For you'}
        id="for-you-title"
        title={<>Picked <span className="text-accent-ink">for you.</span></>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {result.reasons.length > 0 && (
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
                <Sparkles className="h-3.5 w-3.5 text-brass" aria-hidden="true" /> Because you chose {result.reasons.join(' · ')}
              </p>
            )}
            <button type="button" onClick={() => conciergeStore.set(true)} className="btn-secondary min-h-[40px] px-4 text-xs">
              <PenLine className="h-3.5 w-3.5" aria-hidden="true" /> Edit my brief
            </button>
          </div>
        }
      />
      <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-4 pb-3 pt-2 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-0 lg:grid-cols-4">
        {rail.map((p, i) => (
          <Reveal as="li" key={p.id} index={i} variant="zoom" className="w-[80%] shrink-0 snap-start sm:w-auto">
            <ExploreCard property={p} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 80vw" />
          </Reveal>
        ))}
      </ul>
      {result.picked.length > 0 && result.viewed.length > 0 && (
        <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>Recently viewed:</span>
          {result.viewed.map((p) => (
            <a key={p.id} href={`/properties/${p.slug}`} target="_blank" rel="noopener noreferrer" className="chip min-h-[36px] px-3 text-xs">
              {p.title}
            </a>
          ))}
        </p>
      )}
    </section>
  );
}
