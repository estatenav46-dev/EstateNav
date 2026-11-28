import type { Property } from './data/types';
import { possessionMonths } from './property';
import { zoneOfCorridor } from './regions';

export type SimilarMatch = { property: Property; score: number; reasons: string[] };

/** A listing's guide price, or null when it is on request or missing. */
function entryPrice(p: Property): number | null {
  return !p.priceOnRequest && p.priceMin > 0 ? p.priceMin : null;
}

// How far apart two prices are, as a fraction (0.2 = one is 20% above the other). Measured on a log
// scale so ₹1 Cr vs ₹1.25 Cr counts the same as ₹1.25 Cr vs ₹1 Cr.
function priceGap(a: number, b: number) {
  return Math.exp(Math.abs(Math.log(a / b))) - 1;
}

// Similar listings, for the "Also worth a look" cards and the side-by-side comparison.
// Price matters most. Listings are grouped by how close their price is (within 15%, 30%, 50%,
// price unknown, further away) and a closer group always comes first; area, BHK and possession
// only decide the order inside a group. Different segments (an office
// for a home) or deal types (rent for sale) never qualify.
export function similarProperties(base: Property, all: Property[], limit = 6): SimilarMatch[] {
  const zone = zoneOfCorridor(base.corridorId);
  const sameKind = (p: Property) => p.segment === base.segment && p.transaction === base.transaction;
  const baseMonths = possessionMonths(base);
  const basePrice = entryPrice(base);

  return all
    .filter((p) => p.id !== base.id && sameKind(p))
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];
      const price = entryPrice(p);
      const gap = basePrice != null && price != null ? priceGap(price, basePrice) : null;

      if (gap != null) {
        const cheaper = price! < basePrice!;
        if (gap <= 0.15) {
          score += 6;
          reasons.push('Similar price');
        } else if (gap <= 0.3) {
          score += 4;
          reasons.push(cheaper ? 'Slightly lower price' : 'Slightly higher price');
        } else if (gap <= 0.5) {
          score += 1.5;
          reasons.push(cheaper ? 'Lower entry price' : 'A step up');
        } else {
          score -= 3;
        }
        // Overlapping price ranges (e.g. ₹90 L – 1.4 Cr against ₹1.1 – 1.6 Cr) are a further hint.
        const top = (x: Property) => Math.max(x.priceMax ?? x.priceMin, x.priceMin);
        if (price! <= top(base) && basePrice! <= top(p)) score += 1;
      }

      if (p.corridorId === base.corridorId) {
        score += 3;
        reasons.push('Same area');
      } else if (zoneOfCorridor(p.corridorId) === zone) {
        score += 1.5;
        reasons.push('Same region');
      }
      const sharedBhk = p.bhkOptions.filter((b) => base.bhkOptions.includes(b));
      if (sharedBhk.length) {
        score += 2;
        reasons.push(`${sharedBhk.slice(0, 2).join(' / ')} BHK too`);
      } else if (p.bhkOptions.some((b) => base.bhkOptions.some((x) => Math.abs(x - b) <= 1))) {
        score += 0.5;
      }
      const months = possessionMonths(p);
      if (Number.isFinite(months) && Number.isFinite(baseMonths) && Math.abs(months - baseMonths) <= 12) score += 0.5;
      if (p.featured) score += 0.25;
      const tier = gap == null ? 3 : gap <= 0.15 ? 0 : gap <= 0.3 ? 1 : gap <= 0.5 ? 2 : 4;
      return { property: p, score, reasons, tier, gap: gap ?? Infinity };
    })
    .filter((m) => m.tier <= 2 || m.score >= 2)
    .sort((a, b) => a.tier - b.tier || b.score - a.score || a.gap - b.gap || a.property.featuredRank - b.property.featuredRank)
    .slice(0, limit)
    .map(({ property, score, reasons }) => ({ property, score, reasons }));
}
