'use client';

import { useEffect, useState } from 'react';

// Sticky in-page navigation with scroll-spy.
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-[60px] z-30 -mx-4 border-b border-line bg-bg/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <ul className="no-scrollbar -ml-2.5 flex gap-1 overflow-x-auto">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                document.getElementById(s.id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
                history.replaceState(null, '', `#${s.id}`);
              }}
              className={`relative inline-flex min-h-[48px] items-center whitespace-nowrap px-2.5 text-sm transition-colors duration-fast ${active === s.id ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              {s.label}
              <span aria-hidden="true" className="absolute inset-x-2.5 bottom-0 h-[2px] origin-left bg-ink transition-transform duration-base" style={{ transform: active === s.id ? 'scaleX(1)' : 'scaleX(0)' }} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
