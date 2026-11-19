'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2 } from 'lucide-react';
import type { ImageRef, Property } from '@/lib/data/types';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

// Master plan first, then every floor plan, labelled with the unit type it belongs to.
export function PlanGallery({ property }: { property: Property }) {
  const [viewer, setViewer] = useState<number | null>(null);
  const label = (img: ImageRef) => property.configurations.find((c) => c.floorPlanImageId === img.id)?.label;
  const items: { image: ImageRef; caption: string }[] = [
    ...(property.media.masterPlan ? [{ image: property.media.masterPlan, caption: 'Master plan' }] : []),
    ...property.media.floorPlans.map((img) => ({ image: img, caption: label(img) ? `${label(img)} floor plan` : img.alt })),
  ];
  if (!items.length) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ image, caption }, i) => (
          <li key={image.id}>
            <button type="button" onClick={() => setViewer(i)} className="group block w-full text-left" aria-label={`Open ${caption}`}>
              <span className="relative block aspect-[4/3] overflow-hidden rounded-card border border-line bg-white">
                <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 22vw, 45vw" className="object-contain p-1 transition-transform duration-slow group-hover:scale-[1.03]" />
                <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
              <span className="mt-1.5 block truncate text-sm font-medium">{caption}</span>
            </button>
          </li>
        ))}
      </ul>
      {viewer !== null &&
        createPortal(<Lightbox images={items.map((i) => i.image)} start={viewer} title={`${property.title} plans`} onClose={() => setViewer(null)} />, document.body)}
    </>
  );
}
