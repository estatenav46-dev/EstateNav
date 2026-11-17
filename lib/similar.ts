import type { Property } from './data/types';
import { possessionMonths } from './property';
import { zoneOfCorridor } from './regions';

export type SimilarMatch = { property: Property; score: number; reasons: string[] };

// Ranks other listings by how alike they are to this one: same area or region, same kind of
// property, overlapping BHK and a price within reach. Different segments (e.g. an office for
// a home) never qualify.
export function similarProperties(base: Property, all: Property[], limit = 6): SimilarMatch[] {
  const zone = zoneOfCorridor(base.corridorId);
  const sameKind = (p: Property) => p.segment === base.segment && p.transaction === base.transaction;
  const baseMonths = possessionMonths(base);

  return all
    .filter((p) => p.id !== base.id && sameKind(p))
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];
      if (p.corridorId === base.corridorId) {
        score += 4;
        reasons.push('Same area');
      } else if (zoneOfCorridor(p.corridorId) === zone) {
        score += 2;
        reasons.push('Same region');
      }
      const sharedBhk = p.bhkOptions.filter((b) => base.bhkOptions.includes(b));
      if (sharedBhk.length) {
        score += 3;
        reasons.push(`${sharedBhk.slice(0, 2).join(' / ')} BHK too`);
      } else if (p.bhkOptions.some((b) => base.bhkOptions.some((x) => Math.abs(x - b) <= 1))) {
        score += 1;
      }
      const ratio = p.priceMin / base.priceMin;
      if (ratio >= 0.8 && ratio <= 1.2) {
        score += 3;
        reasons.push('Similar budget');
      } else if (ratio >= 0.6 && ratio <= 1.4) {
        score += 1.5;
        reasons.push(ratio < 1 ? 'Lower entry price' : 'A step up');
      }
      const months = possessionMonths(p);
      if (Number.isFinite(months) && Number.isFinite(baseMonths) && Math.abs(months - baseMonths) <= 12) score += 0.5;
      if (p.featured) score += 0.25;
      return { property: p, score, reasons };
    })
    .filter((m) => m.score >= 2)
    .sort((a, b) => b.score - a.score || a.property.featuredRank - b.property.featuredRank)
    .slice(0, limit);
}
