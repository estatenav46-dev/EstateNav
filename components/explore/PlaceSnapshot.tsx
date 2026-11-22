import { Building2, GraduationCap, HeartPulse, TrainFront, Trees } from 'lucide-react';
import { GUIDE_LABEL, type GuideKind, type PlaceGuide } from '@/lib/placeGuides';

const ICON: Record<GuideKind, typeof Building2> = { work: Building2, transit: TrainFront, schools: GraduationCap, health: HeartPulse, leisure: Trees };

// "What's around" panel beside the explore headline: a line on what the region, area or
// location is like, then its work hubs, transport, schools and hospitals (lib/placeGuides.ts).
export function PlaceSnapshot({ place, guide, className = '' }: { place: string; guide: PlaceGuide | null; className?: string }) {
  if (!guide) return null;
  const groups = guide.groups.slice(0, 4);
  return (
    <section aria-label={`What’s around ${place}`} className={`rounded-card border border-line bg-surface px-5 py-4 ${className}`}>
      <p className="sheet-label">What’s around {place}</p>
      <p className="mt-1.5 text-sm leading-snug text-ink">{guide.intro}</p>
      <dl className={`mt-3 grid gap-x-5 gap-y-2.5 border-t border-line pt-3 ${groups.length >= 3 ? 'grid-cols-2' : 'grid-cols-1'} ${groups.length === 3 ? 'xl:grid-cols-3' : ''}`}>
        {groups.map((g) => {
          const Icon = ICON[g.kind];
          return (
            <div key={g.kind} className="flex min-w-0 gap-2.5">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-accent-soft text-accent-ink">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{GUIDE_LABEL[g.kind]}</dt>
                <dd className="line-clamp-2 text-[13px] leading-snug text-ink">{g.items.slice(0, 3).join(' · ')}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
