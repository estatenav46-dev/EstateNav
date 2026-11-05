// Thin line-art silhouettes, one per corridor, laid over the duotone corridor photos.
const SKYLINES: Record<string, string> = {
  // Tech-park blocks.
  whitefield: 'M0 60H20V34H44V60H52V18H84V60H92V40H118V60H128V26H150V12H170V60H182V36H206V60H240',
  // Flyover deck on piers with towers behind.
  ecity: 'M0 60H240M0 44H240M30 44V60M80 44V60M130 44V60M180 44V60M150 44V14H170V44M176 44V24H194V44M40 44V28H58V44',
  // Airport: control tower, runway and a climbing aircraft.
  north: 'M0 60H240M20 60V30H28V20H40V30H48V60M24 20L34 12L44 20M70 56H230M150 30L176 22L200 18L186 26L206 30M160 34L176 28',
  // Apartment towers and a school roof.
  sarjapur: 'M0 60H16V20H40V60H48V30H68V60H80V44L100 32L120 44V60H130V12H152V60H160V26H182V60H240M20 28H36M20 36H36M20 44H36',
  // Ring-road interchange and glass towers.
  orr: 'M0 60H240M10 50C60 30 120 30 170 50M10 54C60 40 120 40 170 54M182 60V10H204V60M210 60V24H230V60',
  // Lake edge and low-rise homes.
  varthur: 'M0 60C30 52 60 56 90 50S150 46 180 52 240 50 240 50M120 40V24L134 14L148 24V40M160 40V28L170 20L180 28V40M118 40H184',
};

export function Skyline({ corridor, className = '' }: { corridor: string; className?: string }) {
  const d = SKYLINES[corridor] ?? SKYLINES.whitefield;
  return (
    <svg viewBox="0 0 240 64" preserveAspectRatio="xMidYMax meet" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
