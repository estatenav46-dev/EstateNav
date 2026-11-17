import type { SVGProps } from 'react';

// EstateNav's own icon set for property needs: one 24px grid, 1.6px rounded strokes and a
// soft two-tone fill, drawn to read as architecture rather than generic UI glyphs.
export type NeedIconName = 'apartment' | 'plot' | 'ready' | 'launch' | 'budget' | 'family' | 'first-home' | 'nri' | 'office';

const tone = { fill: 'currentColor', opacity: 0.16, stroke: 'none' } as const;

const PATHS: Record<NeedIconName, JSX.Element> = {
  apartment: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1.5" {...tone} />
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <path d="M9.5 7h1.5M13 7h1.5M9.5 10.5h1.5M13 10.5h1.5M9.5 14h1.5M13 14h1.5" />
      <path d="M11 21v-3.5h2V21M3 21h18" />
    </>
  ),
  plot: (
    <>
      <path d="M12 5l8 4-8 4-8-4z" {...tone} />
      <path d="M12 5l8 4-8 4-8-4z" />
      <path d="M4 9v5l8 4 8-4V9" strokeDasharray="2 2.2" />
      <path d="M12 13v5" />
      <circle cx="12" cy="9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  ready: (
    <>
      <circle cx="8" cy="12" r="4" {...tone} />
      <circle cx="8" cy="12" r="4" />
      <circle cx="8" cy="12" r="1.2" />
      <path d="M12 12h9M17.5 12v3M20.5 12v2.2" />
    </>
  ),
  launch: (
    <>
      <path d="M4 21V10l6-3v14" {...tone} />
      <path d="M4 21V10l6-3v14M10 21V12l6 2.5V21M2.5 21h15" />
      <path d="M6.5 13h1M6.5 16h1M12.5 16.5h1" />
      <path d="M19 3l.8 1.9 1.9.8-1.9.8L19 8.4l-.8-1.9-1.9-.8 1.9-.8z" fill="currentColor" stroke="none" />
    </>
  ),
  budget: (
    <>
      <circle cx="12" cy="12" r="8.5" {...tone} />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 8h6M9 10.8h6M12.2 8c1.6 0 2 2.8-.8 2.8H9.2l4.3 5" />
    </>
  ),
  family: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" {...tone} />
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <path d="M11 4.5v4.5M11 11v1H3M14 12h7M15 12v7.5M7 15.5v4" />
    </>
  ),
  'first-home': (
    <>
      <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" {...tone} />
      <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M12 16.8s-3-1.7-3-3.5a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.8-3 3.5-3 3.5z" fill="currentColor" stroke="none" />
    </>
  ),
  nri: (
    <>
      <circle cx="12" cy="12" r="8.5" {...tone} />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c-2.6 2.4-2.6 14.6 0 17M12 3.5c2.6 2.4 2.6 14.6 0 17" />
      <path d="M5.5 7.5c4 1.4 9 1.4 13 0M5.5 16.5c4-1.4 9-1.4 13 0" opacity="0.7" />
    </>
  ),
  office: (
    <>
      <rect x="3.5" y="8" width="17" height="11.5" rx="1.8" {...tone} />
      <rect x="3.5" y="8" width="17" height="11.5" rx="1.8" />
      <path d="M9 8V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2V8M3.5 13h17M11 13v1.6h2V13" />
    </>
  ),
};

export function NeedIcon({ name, ...props }: { name: NeedIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {PATHS[name]}
    </svg>
  );
}
