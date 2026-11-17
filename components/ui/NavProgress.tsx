'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

let begin: (() => void) | null = null;

/** Starts the top progress bar for navigations that do not come from a link click (router.push). */
export function startNavProgress() {
  begin?.();
}

// Instant feedback for every in-site navigation: a thin bar starts the moment a link is
// clicked, creeps while the next page loads and completes when the URL changes.
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? '';
  const bar = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const safety = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const start = () => {
      running.current = true;
      clearTimeout(safety.current);
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'scaleX(0.04)';
      void el.offsetWidth;
      el.style.transition = 'transform 6s cubic-bezier(0.08, 0.82, 0.17, 1)';
      el.style.transform = 'scaleX(0.86)';
      safety.current = setTimeout(finish, 12_000);
    };
    begin = start;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest('a');
      if (!link || !link.href || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const same = url.pathname === window.location.pathname && url.search === window.location.search;
      if (same) return;
      start();
    };
    document.addEventListener('click', onClick, true);
    return () => {
      begin = null;
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  function finish() {
    const el = bar.current;
    if (!el || !running.current) return;
    running.current = false;
    clearTimeout(safety.current);
    el.style.transition = 'transform 220ms ease-out, opacity 320ms ease 200ms';
    el.style.transform = 'scaleX(1)';
    el.style.opacity = '0';
  }

  useEffect(finish, [pathname, search]);

  return <div ref={bar} aria-hidden="true" className="nav-progress" style={{ opacity: 0, transform: 'scaleX(0)' }} />;
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
