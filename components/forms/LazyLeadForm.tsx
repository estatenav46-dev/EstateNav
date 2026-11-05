'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { LeadForm as LeadFormType } from './LeadForm';

const LeadForm = dynamic(() => import('./LeadForm').then((m) => m.LeadForm), { ssr: false, loading: () => <div className="skeleton h-56 rounded-xl" /> });

// Below-the-fold forms load their validation code shortly before they scroll into view.
export function LazyLeadForm(props: ComponentProps<typeof LeadFormType>) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{near ? <LeadForm {...props} /> : <div className="skeleton h-56 rounded-xl" />}</div>;
}
