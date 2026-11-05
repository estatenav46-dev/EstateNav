'use client';

import { m } from 'motion/react';
import { useId } from 'react';

// A drawing-set approval stamp that lands on the form once an enquiry is registered.
export function Stamp({ label = 'Request registered', reference }: { label?: string; reference?: string }) {
  const pathId = `stamp-${useId().replace(/:/g, '')}`;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <m.div
      initial={{ opacity: 0, scale: 1.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="h-36 w-36 text-accent-ink"
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" fill="none" stroke="currentColor">
        <defs>
          <path id={pathId} d="M80 80m-58 0a58 58 0 1 1 116 0a58 58 0 1 1-116 0" />
        </defs>
        <circle cx="80" cy="80" r="74" strokeWidth="3" />
        <circle cx="80" cy="80" r="66" strokeWidth="1" />
        <circle cx="80" cy="80" r="44" strokeWidth="1" strokeDasharray="3 4" />
        <text fill="currentColor" stroke="none" fontSize="11" letterSpacing="2.4" className="font-mono uppercase">
          <textPath href={`#${pathId}`}>{`${label} · EstateNav · ${label} ·`}</textPath>
        </text>
        <path d="M62 80l12 12 24-26" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="80" y="112" textAnchor="middle" fill="currentColor" stroke="none" fontSize="9" className="font-mono">
          {reference ?? today}
        </text>
      </svg>
    </m.div>
  );
}
