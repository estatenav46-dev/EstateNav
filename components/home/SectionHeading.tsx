import type { ReactNode } from 'react';
import { Reveal, Words } from '@/components/Reveal';

// Section heading: a short label, then the serif title rising word by word as it scrolls into
// view, with an optional link on the right.
export function SectionHeading({ kicker, title, id, action, tone = 'default' }: { index?: string; kicker: string; title: ReactNode; id: string; action?: ReactNode; tone?: 'default' | 'inverse' }) {
  const muted = tone === 'inverse' ? 'text-forest-on/70' : 'text-ink-muted';
  return (
    <Reveal variant="words" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="max-w-3xl">
        <p className={`rw-fade text-sm font-medium ${muted}`}>{kicker}</p>
        <h2 id={id} className={`mt-1 font-serif text-[1.65rem] leading-[1.1] sm:text-[1.9rem] lg:text-[2.1rem] ${tone === 'inverse' ? 'text-forest-on' : ''}`}>
          <Words>{title}</Words>
        </h2>
      </div>
      {action && <div className="rw-fade">{action}</div>}
    </Reveal>
  );
}
