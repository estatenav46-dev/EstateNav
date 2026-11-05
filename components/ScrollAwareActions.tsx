'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

export function ScrollAwareActions({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setVisible(true);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastY.current;
        const nearBottom = window.innerHeight + currentY >= document.documentElement.scrollHeight - 120;
        if (preference.matches || currentY <= 24 || nearBottom) setVisible(true);
        else if (Math.abs(delta) >= 6) setVisible(delta < 0);
        lastY.current = currentY;
      });
    };
    lastY.current = Math.max(0, window.scrollY);
    updatePreference();
    window.addEventListener('scroll', onScroll, { passive: true });
    preference.addEventListener('change', updatePreference);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      preference.removeEventListener('change', updatePreference);
    };
  }, []);

  return <div aria-hidden={!visible && !reducedMotion} data-visible={visible || reducedMotion ? 'true' : 'false'} className={`detail-mobile-actions fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-[#E5E2DC] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden ${reducedMotion ? '' : 'transition-transform duration-200 ease-out'}`} style={{ transform: visible || reducedMotion ? 'translateY(0)' : 'translateY(100%)', pointerEvents: visible || reducedMotion ? 'auto' : 'none' }}>{children}</div>;
}
