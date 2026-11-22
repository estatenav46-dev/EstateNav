'use client';

import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  hideTitle?: boolean;
  direction?: 'bottom' | 'right';
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  fullHeight?: boolean;
  /** Side sheets only: a floating card sized to its content instead of a full-height panel. */
  compact?: boolean;
};

// Bottom sheets on phones and side sheets on desktop, built on vaul (Radix Dialog), so focus
// is trapped, Escape closes and the page behind stops scrolling.
export function Sheet({ open, onOpenChange, title, description, hideTitle, direction = 'bottom', children, footer, className = '', fullHeight, compact }: Props) {
  const side = direction === 'right';
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-scrim/50" />
        <Drawer.Content
          className={`fixed z-[90] flex flex-col bg-surface text-ink outline-none ${
            side
              ? compact
                ? 'right-3 top-3 max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[400px] overflow-hidden rounded-card border border-line shadow-[0_30px_70px_-30px_rgb(var(--shadow)/0.7)]'
                : 'inset-y-0 right-0 w-full max-w-[640px] border-l border-line shadow-[-30px_0_80px_-40px_rgb(var(--shadow)/0.5)]'
              : `inset-x-0 bottom-0 rounded-t-[24px] border-t border-line ${fullHeight ? 'h-[96dvh]' : 'max-h-[85dvh]'}`
          } ${className}`}
        >
          {!side && <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong" />}
          <div className={`flex shrink-0 items-start justify-between gap-3 ${compact ? 'px-4 pt-3.5' : 'px-5'} ${side && !compact ? 'pt-6' : !side ? 'pt-3' : ''} ${hideTitle ? 'sr-only' : compact ? 'pb-2' : 'pb-3'}`}>
            <div className="min-w-0">
              <Drawer.Title className={compact ? 'text-base font-semibold leading-snug' : 'font-serif text-[1.5rem] leading-tight'}>{title}</Drawer.Title>
              {description && <Drawer.Description className={`mt-0.5 text-ink-muted ${compact ? 'text-xs' : 'text-sm'}`}>{description}</Drawer.Description>}
            </div>
            <Drawer.Close className={compact ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink' : 'icon-btn -mr-2 -mt-1 border-transparent'} aria-label="Close">
              <X className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
            </Drawer.Close>
          </div>
          {!description && <Drawer.Description className="sr-only">{title}</Drawer.Description>}
          <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${compact ? 'px-4 pb-4' : 'px-5 pb-5'}`}>{children}</div>
          {footer && <div className="shrink-0 border-t border-line bg-surface px-5 py-3 safe-bottom">{footer}</div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
