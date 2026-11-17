'use client';

import { useEffect } from 'react';
import type { Property } from '@/lib/data/types';
import { zoneOfCorridor } from '@/lib/regions';
import { budgetBucket, track } from '@/lib/ui/visitor';

// Records a property view for personalisation (sent only with cookie consent).
export function TrackView({ property }: { property: Property }) {
  useEffect(() => {
    track('property_view', {
      id: property.id,
      zone: zoneOfCorridor(property.corridorId),
      corridor: property.corridorId,
      seg: property.transaction === 'rent' ? 'rent' : property.segment,
      bhk: property.bhkOptions.length ? Math.min(...property.bhkOptions) : null,
      budget: budgetBucket(property.priceMin, property.transaction === 'rent'),
    });
  }, [property]);
  return null;
}
