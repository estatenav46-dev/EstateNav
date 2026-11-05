'use client';

import { useRouter } from 'next/navigation';
import type { Corridor, Property } from '@/lib/data/types';

// A hand-drawn, schematic Bengaluru: Outer Ring Road as a ring, the radial growth
// corridors as clickable paths, and project pins placed along them. Not to scale.

type Shape = { d: string; label: [number, number]; badge: [number, number]; pins: [number, number][] };

export const CORRIDOR_SHAPES: Record<string, Shape> = {
  orr: {
    d: 'M200 108C262 108 300 140 312 190C324 242 300 300 246 322C196 342 132 326 104 282C78 240 84 176 118 140C140 118 168 108 200 108Z',
    label: [96, 128],
    badge: [118, 140],
    pins: [[300, 252], [286, 172], [148, 314], [112, 206]],
  },
  sarjapur: {
    d: 'M262 300C282 326 300 352 318 378C330 396 342 414 352 432',
    label: [324, 446],
    badge: [338, 398],
    pins: [[290, 340], [306, 362], [326, 390], [342, 416]],
  },
  whitefield: {
    d: 'M308 214C330 210 352 204 372 196C386 190 398 184 410 178',
    label: [368, 168],
    badge: [384, 206],
    pins: [[340, 207], [366, 198], [392, 187]],
  },
  varthur: {
    d: 'M304 246C322 254 340 264 356 276C368 284 378 294 388 304',
    label: [372, 324],
    badge: [362, 262],
    pins: [[334, 260], [358, 278]],
  },
  ecity: {
    d: 'M214 326C216 352 220 378 226 402C230 418 236 432 242 446',
    label: [176, 452],
    badge: [248, 392],
    pins: [[220, 372], [228, 402], [236, 426]],
  },
  north: {
    d: 'M196 108C198 84 204 62 214 44C222 30 232 20 244 12',
    label: [160, 22],
    badge: [226, 76],
    pins: [[200, 82], [208, 60], [224, 36]],
  },
};

const HUBS: { name: string; at: [number, number] }[] = [
  { name: 'Manyata', at: [214, 112] },
  { name: 'ITPL', at: [396, 182] },
  { name: 'Ecospace', at: [292, 266] },
  { name: 'Wipro', at: [270, 318] },
  { name: 'E-City Ph 1', at: [222, 384] },
  { name: 'Airport', at: [248, 8] },
];

type Props = {
  corridors: Corridor[];
  properties: Property[];
  selected?: string | null;
  onSelect?: (corridorId: string | null) => void;
  focusPropertyId?: string;
  className?: string;
  animatePins?: boolean;
};

export function CorridorMap({ corridors, properties, selected = null, onSelect, focusPropertyId, className = '', animatePins = true }: Props) {
  const router = useRouter();
  const byPath = new Map(corridors.map((c) => [c.svgPathId, c]));
  const count = (id: string) => properties.filter((p) => p.corridorId === id).length;
  const interactive = Boolean(onSelect);

  const pins = corridors.flatMap((corridor) => {
    const shape = CORRIDOR_SHAPES[corridor.svgPathId];
    if (!shape) return [];
    return properties
      .filter((p) => p.corridorId === corridor.id)
      .map((p, i) => ({ property: p, at: shape.pins[i % shape.pins.length], offset: Math.floor(i / shape.pins.length) * 9 }));
  });

  return (
    <figure className={`relative ${className}`}>
      <svg viewBox="0 0 440 470" className="h-full w-full" role="group" aria-label="Schematic map of Bengaluru growth corridors">
        <defs>
          <pattern id="map-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgb(var(--accent-ink))" strokeWidth="1" opacity="0.35" />
          </pattern>
        </defs>

        {/* Lakes, the city centre and the drawing furniture. */}
        <path d="M262 236c10-8 26-6 30 4s-8 18-20 18-18-14-10-22z" fill="url(#map-hatch)" stroke="rgb(var(--line-strong))" />
        <path d="M330 270c8-6 20-4 22 4s-6 14-14 14-14-10-8-18z" fill="url(#map-hatch)" stroke="rgb(var(--line-strong))" />
        <g stroke="rgb(var(--ink-muted))" strokeWidth="1">
          <circle cx="196" cy="214" r="5" fill="none" />
          <path d="M184 214h24M196 202v24" />
        </g>
        <text x="206" y="232" className="fill-ink-muted font-mono text-[9px]">MG Road</text>
        <g transform="translate(26 400)" className="text-ink-muted" stroke="currentColor" fill="none">
          <path d="M0 22L8 0l8 22-8-6z" fill="currentColor" stroke="none" />
          <text x="3" y="36" className="fill-current font-mono text-[9px]" stroke="none">N</text>
        </g>
        <text x="20" y="460" className="fill-ink-muted font-mono text-[9px]">Schematic · not to scale</text>

        {Object.entries(CORRIDOR_SHAPES).map(([pathId, shape]) => {
          const corridor = byPath.get(pathId);
          if (!corridor) return null;
          const active = selected === corridor.id;
          const dimmed = selected != null && !active;
          const n = count(corridor.id);
          const isRing = pathId === 'orr';
          const select = () => onSelect?.(active ? null : corridor.id);
          return (
            <g
              key={pathId}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? active : undefined}
              aria-label={interactive ? `${corridor.name}, ${n} ${n === 1 ? 'project' : 'projects'}` : undefined}
              onClick={interactive ? select : undefined}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  select();
                }
              }}
              className={`group outline-none ${interactive ? 'cursor-pointer' : ''}`}
              style={{ opacity: dimmed ? 0.4 : 1, transition: 'opacity var(--dur-base) var(--ease)' }}
            >
              <path d={shape.d} fill="none" stroke="transparent" strokeWidth="22" />
              <path d={shape.d} fill="none" stroke="rgb(var(--line-strong))" strokeWidth={isRing ? 9 : 7} strokeLinecap="round" />
              <path
                d={shape.d}
                fill="none"
                stroke="rgb(var(--accent-ink))"
                strokeWidth={isRing ? 3 : 2.5}
                strokeLinecap="round"
                strokeDasharray={isRing ? '1 0' : undefined}
                className="transition-opacity duration-base group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ opacity: active ? 1 : 0.55 }}
              />
              <path d={shape.d} fill="none" stroke="rgb(var(--accent-ink))" strokeWidth="9" strokeLinecap="round" className="opacity-0 transition-opacity duration-base group-focus-visible:opacity-30" style={active ? { opacity: 0.25 } : undefined} />
              <text x={shape.label[0]} y={shape.label[1]} textAnchor="middle" className={`font-sans text-[12px] ${active ? 'fill-accent-ink' : 'fill-ink'}`}>
                {corridor.name}
              </text>
              <g transform={`translate(${shape.badge[0]} ${shape.badge[1]})`} className={`transition-opacity duration-base ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                <rect x="-36" y="-11" width="72" height="22" rx="11" fill="rgb(var(--ink))" />
                <text textAnchor="middle" y="4" className="fill-bg font-mono text-[10px]">
                  {n} {n === 1 ? 'project' : 'projects'}
                </text>
              </g>
            </g>
          );
        })}

        {HUBS.map((hub) => (
          <g key={hub.name} transform={`translate(${hub.at[0]} ${hub.at[1]})`} className="pointer-events-none">
            <rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="rgb(var(--surface))" stroke="rgb(var(--ink-muted))" />
            <text x="8" y="3" className="fill-ink-muted font-mono text-[8.5px]">{hub.name}</text>
          </g>
        ))}

        {pins.map(({ property, at, offset }, i) => {
          const focus = property.id === focusPropertyId;
          const visible = !selected || selected === property.corridorId || focus;
          return (
            <a
              key={property.id}
              href={`/properties/${property.slug}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/properties/${property.slug}`, { scroll: false });
              }}
              aria-label={`${property.title}, ${property.locality}`}
              style={{ opacity: visible ? 1 : 0.15, transition: 'opacity var(--dur-base) var(--ease)' }}
            >
              <g transform={`translate(${at[0] + offset} ${at[1] - offset})`}>
                <circle cy="-12" r="16" fill="transparent" />
                <g className={animatePins ? 'animate-pin-drop' : ''} style={{ animationDelay: `${120 + i * 50}ms`, transformBox: 'fill-box', transformOrigin: 'bottom' }}>
                  <path d="M0 0c-5-7-8-11-8-15a8 8 0 0116 0c0 4-3 8-8 15z" fill={focus ? 'rgb(var(--accent))' : 'rgb(var(--surface))'} stroke="rgb(var(--accent-ink))" strokeWidth="1.5" />
                  <circle cy="-15" r="2.5" fill={focus ? 'rgb(var(--on-accent))' : 'rgb(var(--accent-ink))'} />
                </g>
                <title>{property.title}</title>
              </g>
            </a>
          );
        })}
      </svg>
      <figcaption className="sr-only">Corridors: {corridors.map((c) => `${c.name} (${count(c.id)})`).join(', ')}.</figcaption>
    </figure>
  );
}
