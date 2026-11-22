import type { ReactNode } from 'react';
import { Reveal, Words } from '@/components/Reveal';

// Editorial section heading: a small uppercase kicker with a brass index and rule, then the
// serif title rising word by word as it scrolls into view.
export function SectionHeading({ index, kicker, title, id, action, tone = 'default' }: { index?: string; kicker: string; title: ReactNode; id: string; action?: ReactNode; tone?: 'default' | 'inverse' }) {
  const muted = tone === 'inverse' ? 'text-forest-on/70' : 'text-ink-muted';
  return (
    <Reveal variant="words" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="max-w-3xl">
        <p className={`rw-fade flex items-center gap-2.5 text-2xs font-semibold uppercase tracking-[0.16em] ${muted}`}>
          {index && <span className="tabular text-brass">{index}</span>}
          <span aria-hidden="true" className="rw-line h-px w-8 bg-brass/60" />
          {kicker}
        </p>
        <h2 id={id} className={`mt-3 font-serif text-[2rem] leading-[1.04] sm:text-[2.5rem] lg:text-[2.85rem] ${tone === 'inverse' ? 'text-forest-on' : ''}`}>
          <Words>{title}</Words>
        </h2>
      </div>
      {action && <div className="rw-fade">{action}</div>}
    </Reveal>
  );
}
