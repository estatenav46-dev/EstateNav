'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

// A labelled trigger with a dropdown panel; closes on outside click or Escape and returns focus.
export function Popover({ label, value, children, panelClassName = '', align = 'left' }: { label: string; value: string; children: ReactNode; panelClassName?: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    wrap.current?.querySelector<HTMLElement>('[data-autofocus], button, input')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative min-w-0">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[56px] w-full min-w-0 flex-col items-start justify-center rounded-xl px-4 text-left hover:bg-surface-2"
      >
        <span className="sheet-label">{label}</span>
        <span className="flex w-full min-w-0 items-center justify-between gap-2 text-sm text-ink">
          <span className="truncate">{value}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-fast ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>
      {open && (
        <div id={panelId} className={`panel absolute top-full z-30 mt-2 animate-fade-up p-4 shadow-[0_24px_48px_-24px_rgb(var(--shadow)/0.45)] ${align === 'right' ? 'right-0' : 'left-0'} ${panelClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}
