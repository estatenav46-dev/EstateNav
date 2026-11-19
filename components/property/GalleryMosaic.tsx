'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { Images } from 'lucide-react';
import type { ImageRef } from '@/lib/data/types';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

export const isPlaceholder = (images: ImageRef[]) => images.some((img) => img.credit?.toLowerCase().includes('placeholder'));

const blur = (img: ImageRef) => (img.blurDataURL ? { placeholder: 'blur' as const, blurDataURL: img.blurDataURL } : { placeholder: 'empty' as const });

// Main photo with a strip of up to four thumbnails underneath; the last one shows "+N".
// Any photo opens the full-screen viewer.
export function GalleryMosaic({ images, title }: { images: ImageRef[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [main, ...rest] = images;
  if (!main) return null;
  const strip = rest.slice(0, 4);
  const more = images.length - 1 - strip.length;

  return (
    <div className="min-w-0">
      <button type="button" onClick={() => setOpen(0)} className="group relative block aspect-[16/10] w-full overflow-hidden rounded-card bg-surface-2 lg:aspect-[16/9]" aria-label={`Open photo 1 of ${images.length}`}>
        <Image src={main.url} alt={main.alt} fill priority quality={70} sizes="(min-width: 1024px) 46vw, 100vw" {...blur(main)} className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.02]" />
        {images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
            <Images className="h-3.5 w-3.5" aria-hidden="true" /> View all {images.length}
          </span>
        )}
      </button>
      {strip.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {strip.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setOpen(i + 1)} className="group relative aspect-[16/11] overflow-hidden rounded-xl bg-surface-2" aria-label={`Open photo ${i + 2} of ${images.length}`}>
              <Image src={img.url} alt={img.alt} fill quality={55} sizes="(min-width: 1024px) 11vw, 24vw" {...blur(img)} className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.05]" />
              {i === strip.length - 1 && more > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">+{more}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {isPlaceholder(images) && <p className="mt-2 text-2xs text-ink-muted">Representative images. Project photos and renders will be added from the developer.</p>}
      {open !== null && <Lightbox images={images} start={open} title={title} onClose={() => setOpen(null)} />}
    </div>
  );
}
