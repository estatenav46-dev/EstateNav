'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { Images, LayoutGrid } from 'lucide-react';
import type { ImageRef } from '@/lib/data/types';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

export const isPlaceholder = (images: ImageRef[]) => images.some((img) => img.credit?.toLowerCase().includes('placeholder'));

const blur = (img: ImageRef) => (img.blurDataURL ? { placeholder: 'blur' as const, blurDataURL: img.blurDataURL } : { placeholder: 'empty' as const });

// Desktop grid per number of small photos, so there is never an empty cell.
const LAYOUT: Record<number, { grid: string; main: string }> = {
  0: { grid: '', main: '' },
  1: { grid: 'sm:grid-cols-3', main: 'sm:col-span-2' },
  2: { grid: 'sm:grid-cols-3 sm:grid-rows-2', main: 'sm:col-span-2 sm:row-span-2' },
  3: { grid: 'sm:grid-cols-4 sm:grid-rows-2', main: 'sm:col-span-2 sm:row-span-2' },
  4: { grid: 'sm:grid-cols-4 sm:grid-rows-2', main: 'sm:col-span-2 sm:row-span-2' },
};

// Compact photo mosaic: one large photo and up to four small ones (desktop), one photo plus a
// thumbnail strip (phones). Buttons open every photo or the floor plans full screen.
export function GalleryMosaic({ images, title, plans = [] }: { images: ImageRef[]; title: string; plans?: ImageRef[] }) {
  const [open, setOpen] = useState<{ set: 'photos' | 'plans'; start: number } | null>(null);
  const [main, ...rest] = images;
  if (!main) return null;
  const thumbs = rest.slice(0, 4);
  const layout = LAYOUT[thumbs.length];
  const show = (start: number) => setOpen({ set: 'photos', start });

  return (
    <div className="min-w-0">
      <div className={`relative grid gap-2 sm:h-[clamp(18rem,34vw,32rem)] sm:gap-2.5 ${layout.grid}`}>
        <button type="button" onClick={() => show(0)} className={`group relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2 sm:aspect-auto ${layout.main}`} aria-label={`Open photo 1 of ${images.length}`}>
          <Image src={main.url} alt={main.alt} fill priority quality={70} sizes="(min-width: 640px) 50vw, 100vw" {...blur(main)} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        </button>
        {thumbs.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => show(i + 1)}
            className={`group relative hidden overflow-hidden rounded-card bg-surface-2 sm:block ${thumbs.length === 3 && i === 2 ? 'sm:col-span-2' : ''}`}
            aria-label={`Open photo ${i + 2} of ${images.length}`}
          >
            <Image src={img.url} alt={img.alt} fill quality={55} sizes="25vw" {...blur(img)} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          </button>
        ))}

        <div className="pointer-events-none absolute bottom-3 right-3 flex gap-2">
          {images.length > 1 && (
            <button type="button" onClick={() => show(0)} className="pointer-events-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-surface/95 px-3.5 text-xs font-semibold text-ink shadow-[0_6px_18px_-8px_rgb(0_0_0/0.5)] backdrop-blur-sm transition-transform hover:-translate-y-px active:scale-[0.97]">
              <Images className="h-3.5 w-3.5" aria-hidden="true" /> All photos ({images.length})
            </button>
          )}
          {plans.length > 0 && (
            <button type="button" onClick={() => setOpen({ set: 'plans', start: 0 })} className="pointer-events-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-surface/95 px-3.5 text-xs font-semibold text-ink shadow-[0_6px_18px_-8px_rgb(0_0_0/0.5)] backdrop-blur-sm transition-transform hover:-translate-y-px active:scale-[0.97]">
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /> Floor plans ({plans.length})
            </button>
          )}
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="no-scrollbar mt-2 flex gap-2 overflow-x-auto sm:hidden" aria-label="More photos">
          {rest.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button type="button" onClick={() => show(i + 1)} className="relative block h-16 w-24 overflow-hidden rounded-[10px] bg-surface-2" aria-label={`Open photo ${i + 2}`}>
                <Image src={img.url} alt="" fill sizes="80px" quality={45} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {isPlaceholder(images) && <p className="mt-2 text-2xs text-ink-muted">Representative images. Project photos and renders will be added from the developer.</p>}
      {open && <Lightbox images={open.set === 'plans' ? plans : images} start={open.start} title={`${title} · ${open.set === 'plans' ? 'Floor plans' : 'Photos'}`} onClose={() => setOpen(null)} />}
    </div>
  );
}
