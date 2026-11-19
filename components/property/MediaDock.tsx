'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, PlayCircle, Rotate3d } from 'lucide-react';
import type { ImageRef, Property } from '@/lib/data/types';
import { isPlaceholder } from './GalleryMosaic';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

type Tab = { id: 'photos' | 'plans' | 'master'; label: string; images: ImageRef[]; contain: boolean };

// The project's media in one panel: tabs for photos, floor plans and the master plan, a stage
// with arrows, and a thumbnail strip. On desktop it stays in view while the details scroll.
export function MediaDock({ property }: { property: Property }) {
  const { gallery, floorPlans, masterPlan, videoUrl, virtualTourUrl } = property.media;
  const tabs = useMemo<Tab[]>(() => {
    const photos = gallery.length ? gallery : [property.media.cover];
    return [
      { id: 'photos' as const, label: 'Photos', images: photos, contain: false },
      { id: 'plans' as const, label: 'Floor plans', images: floorPlans, contain: true },
      { id: 'master' as const, label: 'Master plan', images: masterPlan ? [masterPlan] : [], contain: true },
    ].filter((t) => t.images.length > 0);
  }, [gallery, floorPlans, masterPlan, property.media.cover]);
  const [tabId, setTabId] = useState<Tab['id']>('photos');
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const strip = useRef<HTMLUListElement>(null);
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  if (!tab) return null;
  const current = tab.images[Math.min(index, tab.images.length - 1)];
  const many = tab.images.length > 1;
  const planLabel = (img: ImageRef) => property.configurations.find((c) => c.floorPlanImageId === img.id)?.label;

  const go = (next: number) => {
    const i = (next + tab.images.length) % tab.images.length;
    setIndex(i);
    strip.current?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTabId(t.id);
              setIndex(0);
            }}
            aria-pressed={t.id === tab.id}
            className="chip shrink-0 text-xs"
          >
            {t.label} <span className="font-mono text-[11px] text-ink-muted">{t.images.length}</span>
          </button>
        ))}
        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="chip shrink-0 text-xs">
            <PlayCircle className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" /> Video
          </a>
        )}
        {virtualTourUrl && (
          <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer" className="chip shrink-0 text-xs">
            <Rotate3d className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" /> 3D tour
          </a>
        )}
      </div>

      <div className={`group relative aspect-[4/3] overflow-hidden rounded-[20px] lg:aspect-auto lg:h-[min(54vh,30rem)] ${tab.contain ? 'bg-white ring-1 ring-line' : 'bg-surface-2'}`}>
        <button type="button" onClick={() => setViewer(true)} className="absolute inset-0" aria-label={`Open ${tab.label.toLowerCase()} full screen`}>
          <Image
            key={current.id}
            src={current.url}
            alt={current.alt}
            fill
            priority={tab.id === 'photos' && index === 0}
            quality={72}
            sizes="(min-width: 1024px) 45vw, 100vw"
            placeholder={current.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={current.blurDataURL || undefined}
            className={`animate-fade-up ${tab.contain ? 'object-contain p-3' : 'object-cover'}`}
          />
        </button>
        {many && (
          <>
            <button type="button" onClick={() => go(index - 1)} className="absolute left-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(index + 1)} className="absolute right-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" aria-label="Next">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 max-w-[70%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
          {tab.id === 'plans' ? planLabel(current) ?? 'Floor plan' : tab.id === 'master' ? 'Master plan' : `${index + 1} / ${tab.images.length}`}
        </span>
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
          <Expand className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      {many && (
        <ul ref={strip} className="no-scrollbar mt-2 flex gap-2 overflow-x-auto" aria-label={`${tab.label} thumbnails`}>
          {tab.images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? 'true' : undefined}
                className={`relative block h-14 w-20 overflow-hidden rounded-lg transition-[opacity,box-shadow] ${i === index ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100'} ${tab.contain ? 'bg-white' : 'bg-surface-2'}`}
                aria-label={`Show image ${i + 1}`}
              >
                <Image src={img.url} alt="" fill sizes="80px" quality={45} className={tab.contain ? 'object-contain p-1' : 'object-cover'} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {tab.id === 'photos' && isPlaceholder(tab.images) && <p className="mt-2 text-2xs text-ink-muted">Representative images. Project photos and renders will be added from the developer.</p>}
      {viewer && createPortal(<Lightbox images={tab.images} start={index} title={`${property.title} · ${tab.label}`} onClose={() => setViewer(false)} />, document.body)}
    </div>
  );
}
