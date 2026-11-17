'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { markRevealBooted } from '@/components/Reveal';

const RIPPLE_TARGETS = '.btn, .btn-primary, .btn-secondary, .btn-ghost, .chip, [data-ripple]';

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

// Site-wide motion with one listener each:
// - a press ripple on buttons and chips;
// - scroll-linked progress: [data-scrub] gets --p (0 → 1) for CSS to map to transforms,
//   [data-parallax] photo layers drift, and [data-scroll-progress] bars track the page.
export function Interactions() {
  const pathname = usePathname();

  useEffect(() => {
    markRevealBooted();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onDown = (event: PointerEvent) => {
      if (reduce.matches || event.button !== 0) return;
      const host = (event.target as Element | null)?.closest<HTMLElement>(RIPPLE_TARGETS);
      if (!host || host.matches(':disabled, [aria-disabled="true"]')) return;
      const box = host.getBoundingClientRect();
      const size = Math.hypot(box.width, box.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - box.left - size / 2}px;top:${event.clientY - box.top - size / 2}px`;
      host.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let scrubs: HTMLElement[] = [];
    let layers: HTMLElement[] = [];
    let bars: HTMLElement[] = [];
    const collect = () => {
      scrubs = Array.from(document.querySelectorAll<HTMLElement>('[data-scrub]'));
      layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
      bars = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-progress]'));
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const page = max > 0 ? clamp(window.scrollY / max) : 0;
      for (const bar of bars) bar.style.transform = `scaleX(${page.toFixed(4)})`;
      if (reduce) return;

      // Read every box first, then write, so the browser lays out once per frame.
      const scrubBoxes = scrubs.map((el) => el.getBoundingClientRect());
      const layerBoxes = layers.map((el) => el.parentElement?.getBoundingClientRect());
      scrubs.forEach((el, i) => {
        const box = scrubBoxes[i];
        if (box.bottom < -200 || box.top > vh + 200) return;
        const mode = el.dataset.scrub;
        const span = Number(el.dataset.scrubSpan) || 0.75;
        const p =
          mode === 'enter' ? clamp((vh - box.top) / (vh * span)) : mode === 'exit' ? clamp(-box.top / Math.max(1, box.height * span)) : clamp((vh - box.top) / (vh + box.height));
        const next = p.toFixed(4);
        if (el.dataset.p !== next) {
          el.dataset.p = next;
          el.style.setProperty('--p', next);
        }
      });
      layers.forEach((el, i) => {
        const box = layerBoxes[i];
        if (!box || box.bottom < -100 || box.top > vh + 100) return;
        const strength = Number(el.dataset.parallax) || 0.08;
        const offset = (box.top + box.height / 2 - vh / 2) * -strength;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.14)`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const refresh = () => {
      collect();
      onScroll();
    };

    refresh();
    // Sections that mount later (personalised rails, the welcome form) join on the next sweep.
    const sweep = window.setInterval(refresh, 1500);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(sweep);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refresh);
    };
  }, [pathname]);

  return null;
}
