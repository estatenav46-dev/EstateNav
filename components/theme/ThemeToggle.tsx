'use client';

import { useTheme } from 'next-themes';
import { useEffect, useId, useState } from 'react';

// Sun and moon share one SVG: the sun's rays retract and a crescent mask slides in (200ms).
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const maskId = `moon-${useId().replace(/:/g, '')}`;
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Site plan (light)' : 'Blueprint (dark)'}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-ink-muted transition-colors duration-fast hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle
            cx="18"
            cy="6"
            r="6"
            fill="black"
            style={{ transform: dark ? 'translate(0, 0)' : 'translate(8px, -8px)', transition: 'transform 200ms var(--ease)' }}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          style={{ transformOrigin: '12px 12px', transform: dark ? 'scale(1)' : 'scale(0.56)', transition: 'transform 200ms var(--ease)' }}
        />
        <g style={{ transformOrigin: '12px 12px', transform: dark ? 'rotate(45deg) scale(0.4)' : 'none', opacity: dark ? 0 : 1, transition: 'transform 200ms var(--ease), opacity 200ms var(--ease)' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${angle} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
