'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

// FLIP for re-ordered grids: children with data-flip-id slide from their old position to the
// new one (translate only, so text stays crisp); newcomers fade up. Respects reduced motion.
export function useFlip(container: RefObject<HTMLElement>, key: string) {
  const rects = useRef(new Map<string, DOMRect>());
  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((child, index) => {
      const id = child.dataset.flipId!;
      const next = child.getBoundingClientRect();
      const prev = rects.current.get(id);
      seen.set(id, next);
      if (reduce || rects.current.size === 0) return;
      if (prev) {
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        }
      } else {
        child.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: Math.min(index, 5) * 60, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
      }
    });
    rects.current = seen;
  }, [container, key]);
}
