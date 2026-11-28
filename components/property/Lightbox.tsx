'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImageRef } from '@/lib/data/types';

type Zoom = { scale: number; x: number; y: number };
const NONE: Zoom = { scale: 1, x: 0, y: 0 };
let pendingBack: ReturnType<typeof setTimeout> | null = null;

// Full-screen photo viewer: swipe between photos, pinch or double-tap to zoom, drag to pan.
// It renders straight into <body> so no header or card can sit on top of it, and it adds a history
// entry while open, so the phone's back button or back swipe (Android, iPhone, iPad) closes the
// photos instead of leaving the page.
export default function Lightbox({ images, start, title, onClose: close }: { images: ImageRef[]; start: number; title: string; onClose: () => void }) {
  const [viewport, embla] = useEmblaCarousel({ startIndex: start, loop: images.length > 1 });
  const [index, setIndex] = useState(start);
  const [zoom, setZoom] = useState<Zoom>(NONE);
  const dialog = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; zx: number; zy: number } | null>(null);

  // Back closes the viewer: push an entry on open; going back (gesture or button) pops it and closes.
  // Closing any other way (✕, Escape) steps back over that entry so the history stays as it was.
  // The router's own state is copied into the entry so Next.js treats it as the same page. The step
  // back waits a tick so a quick unmount-and-remount (React's development double run) reuses the
  // entry instead of popping it.
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (pendingBack) {
      clearTimeout(pendingBack);
      pendingBack = null;
    } else {
      window.history.pushState({ ...(window.history.state ?? {}), lightbox: true }, '');
    }
    let popped = false;
    const onPop = () => {
      if (window.history.state?.lightbox) return; // still on a viewer entry
      popped = true;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (popped) return;
      pendingBack = setTimeout(() => {
        pendingBack = null;
        if (window.history.state?.lightbox) window.history.back();
      }, 0);
    };
  }, []);
  const onClose = () => close();

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setIndex(embla.selectedScrollSnap());
      setZoom(NONE);
    };
    embla.on('select', onSelect);
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla]);

  useEffect(() => {
    embla?.reInit({ watchDrag: zoom.scale === 1 });
  }, [embla, zoom.scale]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('[data-close]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') embla?.scrollNext();
      if (e.key === 'ArrowLeft') embla?.scrollPrev();
      if (e.key === 'Tab' && dialog.current) {
        const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('button'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embla]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: zoom.scale };
    } else if (zoom.scale > 1) {
      pan.current = { x: e.clientX, y: e.clientY, zx: zoom.x, zy: zoom.y };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const scale = Math.min(4, Math.max(1, (pinch.current.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist));
      setZoom((z) => (scale === 1 ? NONE : { ...z, scale }));
    } else if (pan.current) {
      setZoom((z) => ({ ...z, x: pan.current!.zx + e.clientX - pan.current!.x, y: pan.current!.zy + e.clientY - pan.current!.y }));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) pan.current = null;
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-[200] flex flex-col bg-scrim/95 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="font-mono text-sm" aria-live="polite">
          {index + 1} / {images.length}
        </p>
        <button data-close type="button" onClick={onClose} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 hover:bg-white/20" aria-label="Close photos">
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div ref={viewport} className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full">
          {images.map((img, i) => (
            <div key={img.id} className="relative h-full min-w-0 shrink-0 grow-0 basis-full overflow-hidden">
              <div
                className="relative h-full w-full touch-none"
                onPointerDown={i === index ? onPointerDown : undefined}
                onPointerMove={i === index ? onPointerMove : undefined}
                onPointerUp={i === index ? onPointerUp : undefined}
                onPointerCancel={i === index ? onPointerUp : undefined}
                onDoubleClick={() => setZoom((z) => (z.scale > 1 ? NONE : { scale: 2, x: 0, y: 0 }))}
                style={i === index ? { transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transition: pointers.current.size ? 'none' : 'transform 240ms var(--ease)' } : undefined}
              >
                <Image src={img.url} alt={img.alt} fill sizes="100vw" placeholder={img.blurDataURL ? 'blur' : 'empty'} blurDataURL={img.blurDataURL || undefined} className="object-contain" priority={i === start} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3">
          <button type="button" onClick={() => embla?.scrollPrev()} className="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/10" aria-label="Previous photo">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <p className="text-2xs text-white/70">Pinch or double-tap to zoom</p>
          <button type="button" onClick={() => embla?.scrollNext()} className="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/10" aria-label="Next photo">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
