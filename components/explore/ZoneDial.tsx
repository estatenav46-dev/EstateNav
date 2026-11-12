import type { Zone } from '@/lib/regions';

// A small direction badge: a dial with an arrow pointing the way the region lies from the city centre.
export function ZoneDial({ zone, size = 44 }: { zone: Zone; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`zone-${zone.id} inline-flex shrink-0 items-center justify-center rounded-full bg-[rgb(var(--tint)/0.12)] text-[rgb(var(--tint))]`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72} fill="none">
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 3" />
        <path d="M20 2.5v3" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
        {zone.heading == null ? (
          <circle cx="20" cy="20" r="5" fill="currentColor" />
        ) : (
          <g transform={`rotate(${zone.heading} 20 20)`}>
            <path d="M20 7l6 15-6-3.5-6 3.5z" fill="currentColor" />
            <circle cx="20" cy="26" r="2.2" fill="currentColor" fillOpacity="0.45" />
          </g>
        )}
      </svg>
    </span>
  );
}
