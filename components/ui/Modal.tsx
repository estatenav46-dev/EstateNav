'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

// Centred dialog card on the native <dialog> element: focus stays inside, Esc and a click on
// the backdrop close it, and the page behind does not scroll.
export function Modal({ open, onOpenChange, title, description, children, footer, className = '' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={() => onOpenChange(false)}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
      className={`m-auto max-h-[min(86vh,880px)] w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-[0_30px_80px_-30px_rgb(var(--shadow)/0.6)] backdrop:bg-scrim/50 backdrop:backdrop-blur-[2px] open:flex open:animate-fade-up open:flex-col ${className}`}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          {description && <p id={descId} className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        <button type="button" onClick={() => onOpenChange(false)} className="icon-btn -mr-2 h-11 w-11 border-transparent" aria-label="Close">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
      {footer && <div className="shrink-0 border-t border-line bg-surface px-6 py-4">{footer}</div>}
    </dialog>
  );
}
