'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, FileText, Home, Sparkles } from 'lucide-react';
import { WhatsAppGlyph } from '@/components/contact/WhatsAppGlyph';
import { LIST_PROPERTY_PATH, listPropertyWhatsApp } from '@/lib/contact';

// Thin strip above the header for owners: "List your property" opens a small menu with the
// contact form or WhatsApp. Lives outside the sticky header so the header keeps its room.
// With `launchUrl`, the left side announces the grand launch instead, linking to the launch page.
export function ListPropertyBar({ whatsapp, launchUrl }: { whatsapp: string; launchUrl?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative z-[60] bg-forest text-forest-on">
      <div className={`mx-auto flex h-10 max-w-container items-center gap-3 px-4 text-[13px] sm:justify-between sm:px-6 lg:px-8 ${launchUrl ? 'justify-between' : 'justify-center'}`}>
        {launchUrl ? (
          <a
            href={launchUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta"
            data-track-kind="grand-launch"
            className="launch-link group flex min-w-0 items-center gap-2.5"
          >
            <span className="launch-badge relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E6C788] px-2.5 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.12em] text-neutral-900 sm:text-[11px]">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="launch-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neutral-900" />
              </span>
              Grand launch
            </span>
            <span className="launch-shine hidden truncate font-medium md:inline">EstateNav is launching in Bengaluru. Join the celebration</span>
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#EBD09A] underline-offset-4 group-hover:underline">
              <Sparkles className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
              <span className="sm:hidden">Watch</span>
              <span className="hidden sm:inline">Watch the launch</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <p className="hidden items-center gap-2 text-forest-on/80 sm:flex">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Own a flat, plot or office in Bengaluru? Reach buyers through EstateNav.
          </p>
        )}
        <div ref={wrap} className="relative shrink-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            data-testid="list-property"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-semibold text-forest-on underline-offset-4 hover:underline"
          >
            List your property
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {open && (
            <div id={menuId} className="absolute right-1/2 top-full z-[70] mt-1 w-[17rem] translate-x-1/2 rounded-card border border-line bg-surface p-1.5 text-ink shadow-[0_24px_48px_-24px_rgb(var(--shadow)/0.5)] sm:right-0 sm:translate-x-0">
              <Link href={LIST_PROPERTY_PATH} onClick={() => setOpen(false)} className="flex min-h-[48px] items-center gap-3 rounded-[10px] px-3 hover:bg-surface-2">
                <FileText className="h-[18px] w-[18px] text-accent-ink" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold">Fill a short form</span>
                  <span className="block text-xs text-ink-muted">Your advisor calls you back</span>
                </span>
              </Link>
              <a
                href={listPropertyWhatsApp(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                data-track="cta"
                data-track-kind="whatsapp-list-property"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center gap-3 rounded-[10px] px-3 hover:bg-surface-2"
              >
                <WhatsAppGlyph size={18} />
                <span>
                  <span className="block text-sm font-semibold">Message on WhatsApp</span>
                  <span className="block text-xs text-ink-muted">Send the details in a chat</span>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
