'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { conciergeStore } from '@/lib/ui/visitor';
import { ConciergeCard, nextConciergeAt, writeConciergeState, type CatalogueItem, type ConsentCopy } from './ConciergeFlow';

// The welcome concierge as a centred dialog. It opens by itself 5 seconds after a visitor
// lands on any page (not for signed-in visitors or once answered). "I'll browse first"
// brings it back later in the visit; any "Get matched" button opens it at once.
const SKIP = ['/contact'];
export function WelcomeConcierge({ consent, advisorName, catalogue }: { consent: ConsentCopy; advisorName: string; catalogue: CatalogueItem[] }) {
  const pathname = usePathname() ?? '';
  const { user, loading } = useAuth();
  const requested = conciergeStore.useValue();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [session, setSession] = useState(0);
  const done = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const landedAt = useRef(0);
  useEffect(() => {
    landedAt.current ||= Date.now();
  }, []);

  useEffect(() => {
    if (open || loading || user || pathname.startsWith('/admin') || SKIP.includes(pathname)) return;
    const due = nextConciergeAt(landedAt.current || Date.now());
    if (due == null) return;
    let timer = 0;
    const attempt = () => {
      // Re-read the saved state (another tab may have answered or snoozed it), and never open
      // over another dialog or while the visitor is typing.
      const next = nextConciergeAt(landedAt.current || Date.now());
      if (next == null) return;
      if (next > Date.now() + 500) {
        timer = window.setTimeout(attempt, next - Date.now());
        return;
      }
      const busy = document.querySelector('dialog[open]') || (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName));
      if (busy) timer = window.setTimeout(attempt, 8000);
      else setOpen(true);
    };
    timer = window.setTimeout(attempt, Math.max(0, due - Date.now()));
    return () => window.clearTimeout(timer);
  }, [open, pathname, loading, user]);

  useEffect(() => {
    if (!requested) return;
    conciergeStore.set(false);
    done.current = false;
    setSession((n) => n + 1);
    setOpen(true);
  }, [requested]);

  useEffect(() => {
    const el = dialog.current;
    if (!open || !el) return;
    if (!el.open) el.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setOpen(false);
    // Leaving the page closes the dialog without counting as a dismissal.
  }, [pathname]);

  const close = () => {
    if (!done.current) writeConciergeState('later');
    setClosing(true);
    window.setTimeout(() => {
      dialog.current?.close();
      setClosing(false);
      setOpen(false);
    }, 300);
  };

  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      aria-labelledby="concierge-modal-title"
      data-closing={closing || undefined}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="dlg m-auto max-h-[calc(100dvh-1rem)] w-[min(1000px,calc(100vw-1rem))] overflow-y-auto overscroll-contain bg-transparent p-0 text-ink"
    >
      <ConciergeCard
        key={session}
        variant="modal"
        titleId="concierge-modal-title"
        consent={consent}
        advisorName={advisorName}
        catalogue={catalogue}
        onClose={close}
        onDone={() => {
          done.current = true;
        }}
      />
    </dialog>
  );
}
