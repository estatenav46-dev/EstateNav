'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Clock, Search, X } from 'lucide-react';
import type { Corridor, Property } from '@/lib/data/types';
import { recentSearchStore } from '@/lib/ui/stores';

export type Suggestion =
  | { kind: 'project'; label: string; slug: string; hint: string }
  | { kind: 'locality'; label: string; hint: string }
  | { kind: 'corridor'; label: string; id: string; hint: string }
  | { kind: 'developer'; label: string; hint: string }
  | { kind: 'recent'; label: string; href: string; hint: string };

const GROUP_LABEL: Record<Suggestion['kind'], string> = {
  recent: 'Recent searches',
  project: 'Projects',
  locality: 'Localities',
  corridor: 'Corridors',
  developer: 'Developers',
};

export function buildSuggestions(properties: Property[], corridors: Pick<Corridor, 'id' | 'name'>[]): Suggestion[] {
  const count = (fn: (p: Property) => boolean) => properties.filter(fn).length;
  const plural = (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`;
  const localities = Array.from(new Set(properties.map((p) => p.locality)));
  const developers = Array.from(new Set(properties.map((p) => p.developerName)));
  return [
    ...properties.map((p) => ({ kind: 'project' as const, label: p.title, slug: p.slug, hint: p.locality })),
    ...localities.map((l) => ({ kind: 'locality' as const, label: l, hint: plural(count((p) => p.locality === l)) })),
    ...corridors.map((c) => ({ kind: 'corridor' as const, label: c.name, id: c.id, hint: plural(count((p) => p.corridorId === c.id)) })),
    ...developers.map((d) => ({ kind: 'developer' as const, label: d, hint: plural(count((p) => p.developerName === d)) })),
  ];
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-accent-soft text-accent-ink">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (suggestion: Suggestion) => void;
  suggestions: Suggestion[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
};

// ARIA 1.2 combobox: grouped options, arrow-key navigation, matched-text highlighting,
// and recent searches (from localStorage) when the field is empty.
export function LocalityAutocomplete({ id, value, onChange, onPick, suggestions, placeholder = 'Locality, project or developer', className = '', inputClassName = '', autoFocus }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const recent = recentSearchStore.useValue();
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const options = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return recent.map((r) => ({ kind: 'recent' as const, label: r.label, href: r.href, hint: '' })).slice(0, 5);
    return suggestions.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 12);
  }, [value, suggestions, recent]);

  const grouped = useMemo(() => {
    const order: Suggestion['kind'][] = ['recent', 'project', 'locality', 'corridor', 'developer'];
    return order.map((kind) => ({ kind, items: options.filter((o) => o.kind === kind) })).filter((g) => g.items.length);
  }, [options]);
  const flat = grouped.flatMap((g) => g.items);
  const expanded = open && flat.length > 0;

  const choose = (suggestion: Suggestion) => {
    setOpen(false);
    onPick(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        id={id}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
          } else if (e.key === 'Enter' && expanded && flat[active]) {
            e.preventDefault();
            choose(flat[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={`field pl-11 pr-11 ${inputClassName}`}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:text-ink" aria-label="Clear search">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <div
        id={listId}
        role="listbox"
        aria-label="Suggestions"
        className={`panel absolute inset-x-0 top-full z-30 mt-2 max-h-[min(420px,60vh)] overflow-y-auto p-1.5 shadow-[0_24px_48px_-24px_rgb(var(--shadow)/0.45)] ${expanded ? '' : 'hidden'}`}
        onMouseDown={() => clearTimeout(blurTimer.current)}
      >
        {grouped.map((group) => (
          <div key={group.kind} role="group" aria-label={GROUP_LABEL[group.kind]}>
            <p className="sheet-label px-3 pb-1 pt-2" aria-hidden="true">{GROUP_LABEL[group.kind]}</p>
            {group.items.map((item) => {
              const index = flat.indexOf(item);
              return (
                <div
                  key={`${item.kind}-${item.label}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item)}
                  className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-sm ${index === active ? 'bg-surface-2' : ''}`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {item.kind === 'recent' && <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />}
                    <span className="truncate">
                      <Highlight text={item.label} query={value} />
                    </span>
                  </span>
                  {item.hint && <span className="shrink-0 text-2xs text-ink-muted">{item.hint}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
