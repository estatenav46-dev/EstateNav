'use client';

import { useEffect, useRef, useState } from 'react';

const STEPS = [
  { title: 'Shortlist', text: 'Heart the projects that fit. Compare up to three side by side.' },
  { title: 'Verify', text: 'Check the K-RERA number, approvals and bank tie-ups on each project’s ledger.' },
  { title: 'Visit', text: 'Pick a date and the advisor arranges the site visit with the developer’s team.' },
  { title: 'Book at developer price', text: 'Book directly with the developer under their own pricing terms — no buyer brokerage.' },
];

// Four steps on a dimension line that draws across as the section scrolls into view.
export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="how-title" className="mx-auto mt-24 max-w-container px-4 sm:px-6 lg:px-8">
      <p className="sheet-label">Sheet A-05 · How it works</p>
      <h2 id="how-title" className="mt-2 font-serif text-2xl sm:text-3xl">From shortlist to booking, in four steps</h2>
      <div ref={ref} className="relative mt-10">
        <div aria-hidden="true" className="absolute left-0 right-0 top-[7px] hidden h-4 lg:block">
          <div className="absolute inset-x-0 top-1/2 h-px origin-left bg-ink-muted transition-transform duration-[1200ms] ease-out" style={{ transform: `scaleX(${drawn ? 1 : 0})` }} />
          <span className="absolute left-0 top-0 h-4 w-px bg-ink-muted" />
          <span className="absolute right-0 top-0 h-4 w-px bg-ink-muted transition-opacity duration-base" style={{ opacity: drawn ? 1 : 0, transitionDelay: '1100ms' }} />
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative transition-[opacity,transform] duration-slow ease-out lg:pt-10" style={{ opacity: drawn ? 1 : 0.001, transform: drawn ? 'none' : 'translateY(12px)', transitionDelay: `${200 + i * 180}ms` }}>
              <span aria-hidden="true" className="absolute left-0 top-0 hidden h-[22px] w-[22px] items-center justify-center rounded-full border border-ink-muted bg-bg lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <p className="font-mono text-2xs text-ink-muted">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
              <p className="mt-1 text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
