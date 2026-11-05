'use client';

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react';

// One shared IntersectionObserver for every reveal on the page: a 12px rise and fade that
// runs once. In a grid, pass `index` for a 60ms stagger, capped at the sixth item.
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = 'shown';
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  return observer;
}

type Props = { children: ReactNode; className?: string; index?: number; as?: ElementType; id?: string };

export function Reveal({ children, className = '', index = 0, as = 'div', id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    const io = getObserver();
    if (!element || !io || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92) return; // already on screen: no flash
    element.dataset.reveal = 'waiting';
    io.observe(element);
    return () => io.unobserve(element);
  }, []);

  return createElement(
    as,
    {
      ref,
      id,
      className: `reveal ${className}`,
      style: { '--reveal-delay': `${Math.min(index, 5) * 60}ms` },
      onFocusCapture: () => {
        if (ref.current) ref.current.dataset.reveal = 'shown';
      },
    },
    children,
  );
}
