import type { ReactNode } from 'react';
import { Reveal, Words } from '@/components/Reveal';

// Editorial section heading: a brass index and rule, a short kicker, then the title rising
// word by word as it scrolls into view.
export function SectionHeading({ index, kicker, title, id, action, tone = 'default' }: { index?: string; kicker: string; title: ReactNode; id: string; action?: ReactNode; tone?: 'default' | 'inverse' }) {
  const muted = tone === 'inverse' ? 'text-forest-on/70' : 'text-ink-muted';
  return (
    <Reveal variant="words" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="max-w-3xl">
        <p className={`rw-fade flex items-center gap-3 text-sm font-medium ${muted}`}>
          {index && <span className="font-mono text-xs text-brass">{index}</span>}
          <span aria-hidden="true" className="rw-line h-px w-10 bg-brass/70" />
          {kicker}
        </p>
        <h2 id={id} className={`mt-1.5 font-serif text-[1.55rem] leading-[1.08] tracking-[-0.025em] sm:text-[1.9rem] lg:text-[2.05rem] ${tone === 'inverse' ? 'text-forest-on' : ''}`}>
          <Words>{title}</Words>
        </h2>
      </div>
      {action && <div className="rw-fade">{action}</div>}
    </Reveal>
  );
}
