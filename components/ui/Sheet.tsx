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
};

// Bottom sheets on phones and side sheets on desktop, built on vaul (Radix Dialog), so focus
// is trapped, Escape closes and the page behind stops scrolling.
export function Sheet({ open, onOpenChange, title, description, hideTitle, direction = 'bottom', children, footer, className = '', fullHeight }: Props) {
  const side = direction === 'right';
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-scrim/50" />
        <Drawer.Content
          className={`fixed z-[90] flex flex-col bg-surface text-ink outline-none ${
            side
              ? 'inset-y-0 right-0 w-full max-w-[640px] border-l border-line'
              : `inset-x-0 bottom-0 rounded-t-[20px] border-t border-line ${fullHeight ? 'h-[96dvh]' : 'max-h-[85dvh]'}`
          } ${className}`}
        >
          {!side && <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong" />}
          <div className={`flex shrink-0 items-start justify-between gap-3 px-5 ${side ? 'pt-5' : 'pt-3'} ${hideTitle ? 'sr-only' : 'pb-3'}`}>
            <div className="min-w-0">
              <Drawer.Title className="text-lg font-medium">{title}</Drawer.Title>
              {description && <Drawer.Description className="mt-0.5 text-sm text-ink-muted">{description}</Drawer.Description>}
            </div>
            <Drawer.Close className="icon-btn -mr-2 -mt-1 border-transparent" aria-label="Close">
              <X className="h-5 w-5" aria-hidden="true" />
            </Drawer.Close>
          </div>
          {!description && <Drawer.Description className="sr-only">{title}</Drawer.Description>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
          {footer && <div className="shrink-0 border-t border-line bg-surface px-5 py-3 safe-bottom">{footer}</div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
