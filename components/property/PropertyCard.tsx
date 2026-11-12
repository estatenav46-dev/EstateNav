'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Columns3, Heart, MessageCircle } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { priceLabel, rateLabel, shortRera, sizeLabel, statusChip } from '@/lib/property';
import { propertyWhatsApp } from '@/lib/contact';
import { absoluteUrl } from '@/lib/site';
import { compareStore, shortlistStore, toggleCompare } from '@/lib/ui/stores';
import { toggleWishlist } from '@/lib/ui/wishlist';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

type Variant = 'grid' | 'list' | 'feature';

const STATUS_DOT: Record<ReturnType<typeof statusChip>, string> = {
  Ready: 'bg-accent',
  'Under construction': 'bg-ink-muted',
  'Pre-launch': 'bg-ink',
  'New launch': 'bg-accent-ink',
};

export function StatusChip({ property, className = '' }: { property: Property; className?: string }) {
  const status = statusChip(property);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-2xs font-medium text-ink backdrop-blur ${className}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function ReraRow({ property, className = '' }: { property: Property; className?: string }) {
  const { number, verifyUrl } = property.rera;
  if (!number) return <p className={`font-mono text-2xs text-ink-muted ${className}`}>RERA details on request</p>;
  return (
    <p className={`flex min-w-0 items-center gap-2 font-mono text-2xs text-ink-muted ${className}`}>
      <span className="shrink-0 text-ink">K-RERA</span>
      <span className="min-w-0 truncate" title={number}>{shortRera(number)}</span>
      {verifyUrl && (
        <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 -my-3 inline-flex shrink-0 items-center gap-0.5 py-3 font-sans text-accent-ink hover:underline" aria-label={`Verify ${property.title} on the Karnataka RERA portal`}>
          Verify <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </p>
  );
}

export function PropertyCard({ property, priority = false, variant = 'grid', sizes }: { property: Property; priority?: boolean; variant?: Variant; sizes?: string }) {
  const shortlist = shortlistStore.useValue();
  const compare = compareStore.useValue();
  const [swap, setSwap] = useState<'idle' | 'loading' | 'shown'>('idle');
  const [compareFull, setCompareFull] = useState(false);
  const [viewer, setViewer] = useState(false);
  const photos = [property.media.cover, ...property.media.gallery.filter((img) => img.id !== property.media.cover.id)];
  const saved = shortlist.includes(property.id);
  const comparing = compare.some((c) => c.id === property.id);
  const { cover, gallery } = property.media;
  const second = gallery.find((img) => img.id !== cover.id);
  const href = `/properties/${property.slug}`;
  const chips = property.configurations.map((c) => c.label);
  const size = sizeLabel(property);
  const rate = rateLabel(property);
  const list = variant === 'list';
  const feature = variant === 'feature';

  return (
    <article
      className={`lift group relative flex h-full overflow-hidden rounded-card border border-line bg-surface ${list ? 'flex-col sm:flex-row' : 'flex-col'}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && second && swap === 'idle' && setSwap('loading')}
    >
      <div className={`relative shrink-0 overflow-hidden bg-surface-2 ${list ? 'aspect-[4/3] sm:aspect-auto sm:w-[38%]' : feature ? 'aspect-[4/3] lg:aspect-auto lg:min-h-[360px] lg:flex-1' : 'aspect-[4/3]'}`}>
        <Image
          src={cover.url}
          alt={cover.alt}
          fill
          priority={priority}
          quality={60}
          placeholder={cover.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={cover.blurDataURL || undefined}
          unoptimized={cover.url.startsWith('blob:')}
          sizes={sizes ?? (feature ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw')}
          className="object-cover"
        />
        {second && swap !== 'idle' && (
          <Image
            src={second.url}
            alt=""
            fill
            sizes={sizes ?? '(min-width: 1280px) 30vw, 50vw'}
            onLoad={() => setSwap('shown')}
            className={`object-cover transition-opacity duration-slow ease-out ${swap === 'shown' ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          />
        )}
        <button
          type="button"
          onClick={() => setViewer(true)}
          className="absolute inset-0 z-[5]"
          aria-label={`View ${photos.length} photos of ${property.title}`}
        />
        <StatusChip property={property} className="pointer-events-none absolute left-3 top-3 z-[6]" />
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
          <label className={`relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full backdrop-blur transition-colors duration-fast ${comparing ? 'bg-accent text-accent-on' : 'bg-surface/95 text-ink'}`} title={comparing ? 'Remove from compare' : 'Add to compare'}>
            <input
              type="checkbox"
              checked={comparing}
              onChange={() => setCompareFull(!toggleCompare({ id: property.id, slug: property.slug, title: property.title }))}
              className="peer sr-only"
            />
            <Columns3 className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="sr-only">Compare {property.title}</span>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--accent-ink))]" />
          </label>
          <button
            type="button"
            onClick={() => toggleWishlist(property.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${property.title} from your wishlist` : `Save ${property.title} to your wishlist`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-ink backdrop-blur transition-transform duration-fast active:scale-90"
          >
            <Heart className={`h-[18px] w-[18px] transition-colors duration-fast ${saved ? 'fill-[rgb(var(--danger))] text-danger' : ''}`} aria-hidden="true" />
          </button>
        </div>
        <span className="absolute bottom-2.5 right-3 rounded-md bg-scrim/60 px-1.5 py-0.5 font-mono text-2xs text-white">1/{photos.length}</span>
        {compareFull && (
          <span role="status" className="absolute inset-x-3 bottom-10 rounded-lg bg-ink px-3 py-2 text-2xs text-bg">
            Compare holds three — untick one first.
          </span>
        )}
      </div>

      <div className={`flex min-w-0 flex-col gap-2.5 p-4 ${feature ? 'lg:p-6' : 'flex-1'}`}>
        <div className="min-w-0">
          <h3 className={`truncate font-serif leading-tight ${feature ? 'text-2xl lg:text-3xl' : 'text-xl'}`} title={property.title}>
            <Link href={href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none" aria-label={`${property.title}, ${property.locality}. View details (opens in a new tab)`}>
              {property.title}
            </Link>
          </h3>
          <p className="truncate text-sm text-ink-muted">
            {property.locality} · {property.corridorName}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Configurations">
          {chips.slice(0, 3).map((chip) => (
            <li key={chip} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-2xs text-ink">{chip}</li>
          ))}
          {chips.length > 3 && <li className="rounded-md px-1 py-0.5 text-2xs text-ink-muted">+{chips.length - 3}</li>}
        </ul>

        {size && <p className="text-sm text-ink-muted">{size}</p>}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
          <div className="min-w-0">
            <p className="tabular font-serif text-2xl leading-none">{priceLabel(property)}</p>
            {rate && <p className="mt-1 text-2xs text-ink-muted">{rate}{property.transaction === 'sale' ? ' (from)' : ''}</p>}
          </div>
          <div className="relative z-10 flex shrink-0 gap-1">
            <a href={propertyWhatsApp({ title: property.title, url: absoluteUrl(href) })} target="_blank" rel="noopener noreferrer" className="icon-btn h-11 w-11" aria-label={`WhatsApp the advisor about ${property.title}`}>
              <MessageCircle className="h-[18px] w-[18px] text-accent-ink" aria-hidden="true" />
            </a>
            <Link href={`/contact?intent=site-visit&property=${property.slug}`} className="icon-btn h-11 w-11" aria-label={`Schedule a site visit to ${property.title}`}>
              <CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* K-RERA row hidden on cards for now at the client's request; the detail page still shows it.
        <ReraRow property={property} className="border-t border-line pt-2.5" /> */}
      </div>
      {viewer && createPortal(<Lightbox images={photos} start={0} title={property.title} onClose={() => setViewer(false)} />, document.body)}
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-6 w-2/5 rounded" />
        <div className="skeleton h-3 w-full rounded" />
      </div>
    </div>
  );
}
