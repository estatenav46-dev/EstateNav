'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { Images } from 'lucide-react';
import type { ImageRef } from '@/lib/data/types';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

export const isPlaceholder = (images: ImageRef[]) => images.some((img) => img.credit?.toLowerCase().includes('placeholder'));

// One large photo and up to four small ones; "View all" opens the lightbox.
export function GalleryMosaic({ images, title }: { images: ImageRef[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [main, ...rest] = images;
  const thumbs = rest.slice(0, 4);
  if (!main) return null;

  return (
    <div>
      <div className={`grid gap-2 ${thumbs.length ? 'sm:grid-cols-4 sm:grid-rows-2' : ''} sm:h-[clamp(320px,46vw,560px)]`}>
        <button type="button" onClick={() => setOpen(0)} className={`group relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2 sm:aspect-auto ${thumbs.length ? 'sm:col-span-2 sm:row-span-2' : ''}`} aria-label={`Open photo 1 of ${images.length}`}>
          <Image src={main.url} alt={main.alt} fill priority quality={65} sizes="(min-width: 640px) 50vw, 100vw" placeholder="blur" blurDataURL={main.blurDataURL} className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.02]" />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-2xs font-medium text-ink sm:hidden">
            <Images className="h-3.5 w-3.5" aria-hidden="true" /> 1 / {images.length}
          </span>
        </button>
        {thumbs.map((img, i) => (
          <button key={img.id} type="button" onClick={() => setOpen(i + 1)} className="group relative hidden overflow-hidden rounded-card bg-surface-2 sm:block" aria-label={`Open photo ${i + 2} of ${images.length}`}>
            <Image src={img.url} alt={img.alt} fill quality={60} sizes="25vw" placeholder="blur" blurDataURL={img.blurDataURL} className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]" />
            {i === thumbs.length - 1 && images.length > 1 && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-sm font-medium text-ink">
                <Images className="h-4 w-4" aria-hidden="true" /> View all {images.length}
              </span>
            )}
          </button>
        ))}
      </div>
      {isPlaceholder(images) && <p className="mt-2 text-2xs text-ink-muted">Representative images. Project photos and renders will be added from the developer.</p>}
      {open !== null && <Lightbox images={images} start={open} title={title} onClose={() => setOpen(null)} />}
    </div>
  );
}
