import type { VisitorEvent } from './types';

/** Interest keys counted per visitor (e.g. interest.zone.east). Values are slugged so they are safe as field names. */
export const INTEREST_KEYS = ['zone', 'seg', 'budget', 'bhk', 'corridor'] as const;

const slugValue = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).toLowerCase().replace(/[^a-z0-9+-]/g, '_').slice(0, 24) : null);

export function interestDeltas(events: VisitorEvent[]): { counters: Record<string, number>; viewed: string[] } {
  const counters: Record<string, number> = {};
  const viewed: string[] = [];
  for (const e of events) {
    const data = e.data ?? {};
    for (const key of INTEREST_KEYS) {
      const value = slugValue(data[key]);
      if (value) counters[`${key}.${value}`] = (counters[`${key}.${value}`] ?? 0) + 1;
    }
    if (e.type === 'property_view' && typeof data.id === 'string') viewed.push(data.id.slice(0, 120));
  }
  return { counters, viewed: Array.from(new Set(viewed)) };
}
