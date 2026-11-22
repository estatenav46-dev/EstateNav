'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Building2, CornerDownLeft, MapPin, Navigation, Search, X } from 'lucide-react';
import type { Corridor, Property } from '@/lib/data/types';
import { liveZones, zoneOfCorridor } from '@/lib/regions';

type Suggestion = { key: string; group: 'Regions' | 'Areas' | 'Locations' | 'Projects'; label: string; hint: string; href: string; img?: string };

const ICON = { Regions: Navigation, Areas: MapPin, Locations: MapPin, Projects: Building2 };

function buildIndex(properties: Property[], corridors: Corridor[]): Suggestion[] {
  const out: Suggestion[] = [];
  for (const z of liveZones(properties)) {
    const n = properties.filter((p) => zoneOfCorridor(p.corridorId) === z.id).length;
    out.push({ key: `z-${z.id}`, group: 'Regions', label: z.name, hint: `${n} ${n === 1 ? 'project' : 'projects'} · ${z.areas}`, href: `/properties?zone=${z.id}` });
  }
  for (const c of corridors) {
    const n = properties.filter((p) => p.corridorId === c.id).length;
    if (!n) continue;
    out.push({ key: `c-${c.id}`, group: 'Areas', label: c.name, hint: `${n} ${n === 1 ? 'project' : 'projects'}`, href: `/properties?zone=${zoneOfCorridor(c.id)}&corridor=${c.id}` });
  }
  const seen = new Set<string>();
  for (const p of properties) {
    const key = `${p.corridorId}|${p.locality}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      key: `l-${key}`,
      group: 'Locations',
      label: p.locality,
      hint: p.corridorName,
      href: `/properties?zone=${zoneOfCorridor(p.corridorId)}&corridor=${p.corridorId}&loc=${encodeURIComponent(p.locality)}`,
    });
  }
  for (const p of properties) {
    out.push({ key: `p-${p.id}`, group: 'Projects', label: p.title, hint: `${p.locality} · ${p.developerName}`, href: `/properties/${p.slug}`, img: p.media.cover.url });
  }
  return out;
}

type QuickSearchProps = {
  properties: Property[];
  corridors: Corridor[];
  id?: string;
  className?: string;
  placeholder?: string;
  /** Extra filters (segment, budget…) carried into every explore link. */
  params?: Record<string, string>;
  /** Optional controlled text, so a surrounding console can read what was typed. */
  value?: string;
  onValueChange?: (value: string) => void;
};

export function QuickSearch({ properties, corridors, id = 'quick-search', className = '', placeholder = 'Search Whitefield, Sarjapur, a project…', params, value, onValueChange }: QuickSearchProps) {
  const router = useRouter();
  const listId = useId();
  const [ownQuery, setOwnQuery] = useState('');
  const query = value ?? ownQuery;
  const setQuery = (next: string) => {
    if (value === undefined) setOwnQuery(next);
    onValueChange?.(next);
  };
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const index = useMemo(() => buildIndex(properties, corridors), [properties, corridors]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return index.filter((s) => s.group === 'Regions');
    const tokens = q.split(/\s+/);
    const hits = index.filter((s) => tokens.every((t) => `${s.label} ${s.hint}`.toLowerCase().includes(t)));
    // Keep the list short: a few of each kind.
    const perGroup: Record<string, number> = {};
    return hits.filter((s) => (perGroup[s.group] = (perGroup[s.group] ?? 0) + 1) <= 4);
  }, [index, q]);

  useEffect(() => setActive(-1), [q]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const withParams = (href: string) => {
    if (!params || (!href.startsWith('/properties?') && href !== '/properties')) return href;
    const url = new URL(href, 'https://x');
    Object.entries(params).forEach(([k, v]) => v && !url.searchParams.has(k) && url.searchParams.set(k, v));
    return `${url.pathname}?${url.searchParams.toString()}`;
  };
  const go = (href: string) => {
    setOpen(false);
    // Project pages open in a new tab, like the property cards.
    if (href.startsWith('/properties/')) window.open(href, '_blank', 'noopener');
    else router.push(withParams(href));
  };
  const submit = () => {
    if (active >= 0 && results[active]) return go(results[active].href);
    if (q) go(`/properties?q=${encodeURIComponent(query.trim())}`);
  };

  let lastGroup = '';
  return (
    <div ref={box} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <label htmlFor={id} className="sr-only">Search by region, area, locality or project</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent-ink" aria-hidden="true" />
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(-1, i - 1));
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="h-[60px] w-full rounded-[20px] border border-line bg-surface pl-12 pr-12 text-base text-ink transition-[border-color,box-shadow] duration-base placeholder:text-ink-muted/80 hover:border-line-strong focus:border-accent-ink focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.12)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink" aria-label="Clear search">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </form>

      {open && (
        <div className="pop-in absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-slide border border-line bg-surface shadow-[0_30px_70px_-28px_rgb(var(--shadow)/0.55)]">
          {results.length ? (
            <ul id={listId} role="listbox" aria-label="Suggestions" className="no-scrollbar max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-2">
              {results.map((s, i) => {
                const Icon = ICON[s.group];
                const heading = s.group !== lastGroup ? (lastGroup = s.group) : null;
                return (
                  <li key={s.key} role="presentation">
                    {heading && <p className="px-3 pb-1.5 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{q ? heading : 'Start with a region'}</p>}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(s.href)}
                      onMouseEnter={() => setActive(i)}
                      style={{ '--i': i } as React.CSSProperties}
                      className={`group/opt flex cursor-pointer items-center gap-3 rounded-card px-2.5 py-2 transition-colors duration-fast ${i === active ? 'bg-surface-2' : ''}`}
                    >
                      {s.img ? (
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                          <Image src={s.img} alt="" fill sizes="44px" quality={40} className="object-cover" />
                        </span>
                      ) : (
                        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${i === active ? 'bg-forest text-forest-on' : 'bg-sand text-forest dark:text-brass'}`}>
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.label}</span>
                        <span className="block truncate text-xs text-ink-muted">{s.hint}</span>
                      </span>
                      <span className={`shrink-0 text-ink-muted transition-[opacity,transform] duration-base ${i === active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`} aria-hidden="true">
                        {s.group === 'Projects' ? <ArrowUpRight className="h-4 w-4" /> : <CornerDownLeft className="h-4 w-4" />}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="p-4 text-sm text-ink-muted">
              No direct match. Press Enter to search all listings for “{query.trim()}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
