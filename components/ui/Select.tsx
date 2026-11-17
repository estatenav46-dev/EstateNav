'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string; hint?: string; count?: number; disabled?: boolean };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Accessible name of the control. */
  label: string;
  /** Small heading shown above the value inside the trigger. */
  caption?: string;
  icon?: ReactNode;
  /** Replaces the selected label in the trigger. */
  display?: ReactNode;
  className?: string;
  menuWidth?: number;
  align?: 'start' | 'end';
  /** Hides the round chevron, for icon-only triggers. */
  hideChevron?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Place = { left: number; width: number; top?: number; bottom?: number; maxHeight: number; up: boolean };

// A listbox in place of the native <select>: the menu is portalled (so tables and scrolling
// rows never clip it), opens with a short scale-in, and supports arrows, Home/End, Enter,
// Escape and type-ahead.
export function Select({ value, options, onChange, label, caption, icon, display, className = '', menuWidth = 240, align = 'start', hideChevron, onOpenChange }: Props) {
  const [open, setOpenState] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<Place | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const id = useId();
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const current = options[selectedIndex];

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!next) setPlace(null);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const measure = useCallback(() => {
    const box = trigger.current?.getBoundingClientRect();
    if (!box) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = vh - box.bottom - 12;
    const above = box.top - 12;
    const up = below < Math.min(300, options.length * 52 + 16) && above > below;
    const width = Math.min(vw - 16, Math.max(box.width, menuWidth));
    const left = Math.min(Math.max(8, align === 'end' ? box.right - width : box.left), vw - width - 8);
    setPlace({ left, width, up, maxHeight: Math.max(160, Math.min(380, (up ? above : below) - 8)), ...(up ? { bottom: vh - box.top + 8 } : { top: box.bottom + 8 }) });
  }, [align, menuWidth, options.length]);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  // The list mounts once it has a position; move focus into it then.
  const placed = place !== null;
  useEffect(() => {
    if (open && placed) list.current?.focus({ preventScroll: true });
  }, [open, placed]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!list.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    document.addEventListener('pointerdown', outside);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open, measure, setOpen]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    close();
  };
  const step = (from: number, dir: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const next = (from + dir * i + options.length) % options.length;
      if (!options[next].disabled) return next;
    }
    return from;
  };

  const onListKey = (event: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => step(i, 1)),
      ArrowUp: () => setActive((i) => step(i, -1)),
      Home: () => setActive(step(-1, 1)),
      End: () => setActive(step(options.length, -1)),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    if (keys[event.key]) {
      if (event.key !== 'Tab') event.preventDefault();
      keys[event.key]();
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 600 ? '' : typed.current.text) + event.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={`${label}: ${current?.label ?? ''}`}
        onClick={() => (open ? close() : openAt(selectedIndex))}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            openAt(event.key === 'ArrowUp' ? step(selectedIndex, -1) : selectedIndex);
          }
        }}
        data-open={open}
        className={`group/select flex min-w-0 items-center gap-2.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-base ease-out active:scale-[0.985] ${className}`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="min-w-0 flex-1">
          {caption && <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{caption}</span>}
          <span className="block truncate">{display ?? current?.label}</span>
        </span>
        {!hideChevron && (
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted transition-[transform,background-color,color] duration-slow ease-out group-hover/select:text-ink ${open ? 'rotate-180 bg-ink text-bg group-hover/select:text-bg' : ''}`}>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </button>
      {open &&
        place &&
        createPortal(
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-opt-${active}`}
            onKeyDown={onListKey}
            className="pop-in no-scrollbar fixed z-[90] overflow-y-auto overscroll-contain rounded-[20px] border border-line bg-surface p-1.5 text-ink shadow-[0_28px_70px_-24px_rgb(var(--shadow)/0.55),0_2px_6px_rgb(var(--shadow)/0.06)] outline-none"
            style={{ left: place.left, width: place.width, top: place.top, bottom: place.bottom, maxHeight: place.maxHeight, '--origin': place.up ? 'bottom center' : 'top center' } as CSSProperties}
          >
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  onPointerMove={() => !option.disabled && setActive(index)}
                  onClick={() => choose(index)}
                  style={{ '--i': index } as CSSProperties}
                  className={`relative flex min-h-[48px] cursor-pointer select-none items-center gap-3 rounded-[14px] px-3 py-2 text-sm transition-colors duration-fast ${
                    option.disabled ? 'cursor-not-allowed opacity-40' : index === active ? 'bg-surface-2' : ''
                  }`}
                >
                  <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-base ${selected ? 'border-accent bg-accent text-accent-on' : 'border-line-strong text-transparent'}`}>
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-medium'}`}>{option.label}</span>
                    {option.hint && <span className="block truncate text-xs text-ink-muted">{option.hint}</span>}
                  </span>
                  {option.count != null && (
                    <span className={`tabular rounded-full px-2 py-0.5 text-xs font-semibold ${option.count ? 'bg-accent-soft text-accent-ink' : 'bg-surface-2 text-ink-muted'}`}>{option.count}</span>
                  )}
                </li>
              );
            })}
          </ul>,
          trigger.current?.closest('dialog') ?? document.body,
        )}
    </>
  );
}
