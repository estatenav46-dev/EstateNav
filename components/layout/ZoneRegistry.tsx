'use client';

import { registerCorridorZones } from '@/lib/regions';

// Hands the admin-set region of each area to the browser before any page content renders.
export function ZoneRegistry({ zones }: { zones: { id: string; zone: string }[] }) {
  registerCorridorZones(zones);
  return null;
}
