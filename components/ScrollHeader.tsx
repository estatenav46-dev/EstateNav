'use client';

import { ReactNode, useEffect, useState } from 'react';

export function ScrollHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(!reduceMotion.matches && window.scrollY > 24));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    reduceMotion.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      reduceMotion.removeEventListener('change', update);
    };
  }, []);

  return <header data-scrolled={scrolled ? 'true' : 'false'} className={`page-scroll-header sticky top-0 z-50 border-b border-[#E5E2DC] bg-white ${className}`}><div className="page-scroll-header__inner">{children}</div></header>;
}
