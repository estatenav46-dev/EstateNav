'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// A faint architectural drawing behind every page: drafting grid, dimension lines and an
// isometric mid-rise. The outline draws once on load; on the homepage, scrolling adds floors
// and fades in survey lines (transform and opacity only).

const S = 17; // px per model unit
const W = 10; // building width (x)
const D = 6; // building depth (y)
const H = 1.45; // floor height
const BASE_FLOORS = 6;
const MAX_FLOORS = 12;
const ORIGIN = { x: 262, y: 480 };
const C = Math.cos(Math.PI / 6);
const SN = Math.sin(Math.PI / 6);

const iso = (x: number, y: number, z: number) => [ORIGIN.x + (x - y) * C * S, ORIGIN.y + (x + y) * SN * S - z * S] as const;
const pt = (x: number, y: number, z: number) => iso(x, y, z).map((n) => n.toFixed(1)).join(' ');
const line = (...points: [number, number, number][]) => `M${points.map((p) => pt(...p)).join('L')}`;

function floorPaths(k: number) {
  const z0 = k * H;
  const z1 = z0 + H;
  const paths: string[] = [line([0, D, z1], [W, D, z1], [W, 0, z1])];
  // Corner edges for this storey.
  paths.push(line([0, D, z0], [0, D, z1]), line([W, D, z0], [W, D, z1]), line([W, 0, z0], [W, 0, z1]));
  // Balconies on the left face, a slab and a rail projecting from the wall.
  for (let x = 0.8; x + 2 <= W; x += 3.1) {
    const x2 = x + 2;
    paths.push(line([x, D, z0 + 0.12], [x, D + 0.7, z0 + 0.12], [x2, D + 0.7, z0 + 0.12], [x2, D, z0 + 0.12]));
    paths.push(line([x, D + 0.7, z0 + 0.62], [x2, D + 0.7, z0 + 0.62]), line([x, D + 0.7, z0 + 0.12], [x, D + 0.7, z0 + 0.62]), line([x2, D + 0.7, z0 + 0.12], [x2, D + 0.7, z0 + 0.62]));
    paths.push(line([x + 0.35, D, z0 + 0.12], [x + 0.35, D, z1 - 0.2], [x2 - 0.35, D, z1 - 0.2], [x2 - 0.35, D, z0 + 0.12]));
  }
  // Windows on the right face.
  for (let y = 0.7; y + 1.1 <= D; y += 1.75) {
    paths.push(line([W, y, z0 + 0.35], [W, y, z1 - 0.3], [W, y + 1.1, z1 - 0.3], [W, y + 1.1, z0 + 0.35], [W, y, z0 + 0.35]));
  }
  return paths;
}

const ground = [
  line([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0], [0, 0, 0]),
  line([-2, D + 2.5, 0], [W + 3, D + 2.5, 0]),
  line([W + 2.5, -2, 0], [W + 2.5, D + 2, 0]),
];
const roof = [
  line([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0], [0, 0, 0]),
  line([0, 0, 0.5], [W, 0, 0.5], [W, D, 0.5], [0, D, 0.5], [0, 0, 0.5]),
  line([0, D, 0], [0, D, 0.5]),
  line([W, D, 0], [W, D, 0.5]),
  line([W, 0, 0], [W, 0, 0.5]),
  line([6, 1.5, 0.5], [6, 1.5, 1.7], [8.4, 1.5, 1.7], [8.4, 3.4, 1.7], [6, 3.4, 1.7], [6, 1.5, 1.7]),
  line([8.4, 3.4, 0.5], [8.4, 3.4, 1.7]),
  line([6, 3.4, 0.5], [6, 3.4, 1.7]),
];
// A tower crane beside the site.
const crane = [
  line([W + 5, 2, 0], [W + 5, 2, 22]),
  line([W + 5.6, 2, 0], [W + 5.6, 2, 22]),
  ...Array.from({ length: 11 }, (_, i) => line([W + 5, 2, i * 2], [W + 5.6, 2, i * 2 + 2])),
  line([W + 5.3, 2, 22.6], [W - 9, 2, 22.6]),
  line([W + 5.3, 2, 22.6], [W + 9, 2, 22.6]),
  line([W + 5.3, 2, 24.5], [W - 9, 2, 22.6]),
  line([W + 5.3, 2, 24.5], [W + 9, 2, 22.6]),
  line([W - 4, 2, 22.6], [W - 4, 2, 17]),
];
const survey = [
  line([0, D + 2.5, 0], [-14, D + 9, 0]),
  line([W + 2.5, D + 2, 0], [W + 2.5, D + 14, 0]),
  line([0, 0, 0], [-10, 2, 0]),
];
const surveyMarks = [iso(-14, D + 9, 0), iso(W + 2.5, D + 14, 0), iso(-10, 2, 0), iso(0, D + 2.5, 0)];

export function BlueprintBackdrop() {
  const pathname = usePathname();
  const svgRef = useRef<SVGSVGElement>(null);
  const roofRef = useRef<SVGGElement>(null);
  const isHome = pathname === '/';
  const hidden = pathname?.startsWith('/admin');

  useEffect(() => {
    const svg = svgRef.current;
    const roofGroup = roofRef.current;
    if (!svg || !roofGroup) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 768px)');
    let frame = 0;

    const apply = (progress: number) => {
      svg.style.setProperty('--bp-p', progress.toFixed(3));
      const floorsUp = Math.min(1, progress / 0.8) * (MAX_FLOORS - BASE_FLOORS);
      roofGroup.style.transform = `translateY(${(-floorsUp * H * S).toFixed(1)}px)`;
    };
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      apply(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    if (!isHome || reduce.matches || !wide.matches) {
      apply(0);
      return;
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onScroll);
    };
  }, [isHome]);

  if (hidden) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ opacity: 'var(--backdrop-opacity)', color: 'rgb(var(--backdrop-ink))' }}>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <pattern id="bp-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M120 0H0V120" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <pattern id="bp-ticks-h" width="24" height="16" patternUnits="userSpaceOnUse">
            <path d="M0.5 4V12" stroke="currentColor" />
          </pattern>
          <pattern id="bp-ticks-v" width="16" height="24" patternUnits="userSpaceOnUse">
            <path d="M4 0.5H12" stroke="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)" />
        <rect width="100%" height="100%" fill="url(#bp-grid-major)" />
      </svg>

      {/* Dimension lines along the top and left edges. */}
      <svg className="absolute left-10 right-10 top-[84px] h-4">
        <rect width="100%" height="16" fill="url(#bp-ticks-h)" />
        <line x1="0" y1="8" x2="100%" y2="8" stroke="currentColor" />
        <line x1="0.5" y1="0" x2="0.5" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-10 left-3 top-[120px] w-4">
        <rect width="16" height="100%" fill="url(#bp-ticks-v)" />
        <line x1="8" y1="0" x2="8" y2="100%" stroke="currentColor" />
      </svg>

      <svg
        ref={svgRef}
        viewBox="0 0 560 640"
        className="absolute -bottom-6 right-0 w-[92vw] max-w-[640px] md:w-[48vw]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      >
        <g>
          {ground.map((d) => <path key={d} d={d} pathLength={1} className="bp-draw" />)}
          {Array.from({ length: BASE_FLOORS }, (_, k) => floorPaths(k).map((d, i) => <path key={`${k}-${i}`} d={d} pathLength={1} className="bp-draw" />))}
          {crane.map((d) => <path key={d} d={d} pathLength={1} className="bp-draw" strokeWidth="0.8" />)}
        </g>
        {isHome &&
          Array.from({ length: MAX_FLOORS - BASE_FLOORS }, (_, i) => (
            <g key={i} className="bp-floor" style={{ ['--k' as string]: ((i / (MAX_FLOORS - BASE_FLOORS)) * 0.8).toFixed(3) }}>
              {floorPaths(BASE_FLOORS + i).map((d) => <path key={d} d={d} />)}
            </g>
          ))}
        <g ref={roofRef} style={{ transition: 'transform 120ms linear' }}>
          <g transform={`translate(0 ${(-BASE_FLOORS * H * S).toFixed(1)})`}>
            {roof.map((d) => <path key={d} d={d} pathLength={1} className="bp-draw" />)}
          </g>
        </g>
        {isHome && (
          <g className="bp-survey" style={{ color: 'rgb(var(--survey))' }} stroke="currentColor" strokeDasharray="6 5" strokeWidth="1">
            {survey.map((d) => <path key={d} d={d} />)}
            {surveyMarks.map(([x, y]) => (
              <g key={`${x}-${y}`} strokeDasharray="none">
                <circle cx={x} cy={y} r="5" />
                <path d={`M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}`} />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
