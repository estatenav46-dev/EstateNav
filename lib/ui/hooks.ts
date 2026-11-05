'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export const useReducedMotionPreference = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Hides on scroll down, shows on scroll up (rAF-throttled). */
export function useScrollDirectionVisible(threshold = 8) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (y < 40 || nearBottom) setVisible(true);
        else if (Math.abs(y - last) > threshold) setVisible(y < last);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);
  return visible;
}

export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const [timer] = useState(() => ({ id: 0 as unknown as ReturnType<typeof setTimeout> }));
  useEffect(() => () => clearTimeout(timer.id), [timer]);
  return (...args: A) => {
    clearTimeout(timer.id);
    timer.id = setTimeout(() => fn(...args), delay);
  };
}
