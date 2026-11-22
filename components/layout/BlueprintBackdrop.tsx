'use client';

import { usePathname } from 'next/navigation';

// A faint architectural drawing in the bottom corner of every page (the ground itself stays
// flat): an isometric mid-rise and a tower crane. The outline draws once on load and then stays
// still (nothing repaints while scrolling).

const S = 17; // px per model unit
const W = 10; // building width (x)
const D = 6; // building depth (y)
const H = 1.45; // floor height
const BASE_FLOORS = 6;
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

export function BlueprintBackdrop() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith('/admin');

  if (hidden) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ opacity: 'var(--backdrop-opacity)', color: 'rgb(var(--backdrop-ink))' }}>
      <svg
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
        <g>
          <g transform={`translate(0 ${(-BASE_FLOORS * H * S).toFixed(1)})`}>
            {roof.map((d) => <path key={d} d={d} pathLength={1} className="bp-draw" />)}
          </g>
        </g>
      </svg>
    </div>
  );
}
