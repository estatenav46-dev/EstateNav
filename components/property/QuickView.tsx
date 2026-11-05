'use client';

import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, MessageCircle } from 'lucide-react';
import { Drawer } from 'vaul';
import type { Property } from '@/lib/data/types';
import { priceLabel, rateLabel, sizeLabel } from '@/lib/property';
import { propertyWhatsApp } from '@/lib/contact';
import { absoluteUrl } from '@/lib/site';
import { StatusChip, ReraRow } from './PropertyCard';
import { VerificationLedger } from './VerificationLedger';
import { isPlaceholder } from './GalleryMosaic';

function QuickGallery({ property }: { property: Property }) {
  const [viewport, embla] = useEmblaCarousel({ loop: property.media.gallery.length > 1 });
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on('select', onSelect);
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla]);
  const images = property.media.gallery;
  return (
    <div className="relative">
      <div ref={viewport} className="overflow-hidden rounded-card" aria-roledescription="carousel" aria-label={`${property.title} photos`}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={img.id} className="relative aspect-[4/3] min-w-0 shrink-0 grow-0 basis-full" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
              <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 600px, 100vw" placeholder="blur" blurDataURL={img.blurDataURL} priority={i === 0} className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1 rounded-full bg-surface/95 p-1">
          <button type="button" onClick={() => embla?.scrollPrev()} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2" aria-label="Previous photo">‹</button>
          <span className="inline-flex items-center px-1 font-mono text-2xs" aria-live="polite">{index + 1}/{images.length}</span>
          <button type="button" onClick={() => embla?.scrollNext()} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2" aria-label="Next photo">›</button>
        </div>
      )}
      {isPlaceholder(images) && <p className="mt-1.5 text-2xs text-ink-muted">Representative images.</p>}
    </div>
  );
}

// Opened by the intercepting route: the URL is the property's own, so refresh or a shared
// link shows the full page, and Back closes the sheet.
export function QuickView({ property, whatsappNumber }: { property: Property; whatsappNumber: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => setDesktop(window.matchMedia('(min-width: 1024px)').matches), []);
  const href = `/properties/${property.slug}`;
  const rate = rateLabel(property);
  const size = sizeLabel(property);
  if (desktop === null) return null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction={desktop ? 'right' : 'bottom'}
      onAnimationEnd={(isOpen) => !isOpen && router.back()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-scrim/50" />
        <Drawer.Content
          aria-describedby={undefined}
          className={`fixed z-[90] flex flex-col bg-surface text-ink outline-none ${desktop ? 'inset-y-0 right-0 w-[640px] max-w-full border-l border-line' : 'inset-x-0 bottom-0 h-[96dvh] rounded-t-[20px] border-t border-line'}`}
        >
          {!desktop && <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong" />}
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
            <p className="sheet-label">Quick view</p>
            <Drawer.Close className="btn-ghost min-h-[44px] px-3">Close</Drawer.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
            <QuickGallery property={property} />
            <div className="mt-4">
              <StatusChip property={property} className="border border-line" />
              <Drawer.Title className="mt-2 font-serif text-3xl leading-tight">{property.title}</Drawer.Title>
              <p className="mt-1 text-ink-muted">{property.locality} · {property.corridorName}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-y border-line py-4">
              <div>
                <p className="tabular font-serif text-3xl leading-none">{priceLabel(property)}</p>
                {rate && <p className="mt-1 text-sm text-ink-muted">{rate}</p>}
              </div>
              <p className="text-sm text-ink-muted">{property.possession.label}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-2xs text-ink-muted">Configurations</dt>
                <dd>{property.configurations.map((c) => c.label).join(', ')}</dd>
              </div>
              {size && (
                <div>
                  <dt className="text-2xs text-ink-muted">Size</dt>
                  <dd>{size}</dd>
                </div>
              )}
            </dl>
            <ReraRow property={property} className="mt-4" />
            <div className="mt-5">
              <VerificationLedger property={property} summary notes={false} />
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-[auto_1fr_1fr] gap-2 border-t border-line px-5 py-3 safe-bottom">
            <a href={propertyWhatsApp({ title: property.title, url: absoluteUrl(href) }, whatsappNumber)} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="WhatsApp advisor">
              <MessageCircle className="h-5 w-5 text-accent-ink" aria-hidden="true" />
            </a>
            <Link href={`/contact?intent=site-visit&property=${property.slug}`} className="btn-secondary px-3">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Schedule visit
            </Link>
            <a href={href} onClick={(e) => { e.preventDefault(); window.location.assign(href); }} className="btn-primary px-3">
              Open full page <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
