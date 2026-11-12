'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Expand, GitCompareArrows, Heart, MapPin } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { formatINR } from '@/lib/price';
import { statusChip } from '@/lib/property';
import { compareStore, MAX_COMPARE, shortlistStore, toggleCompare } from '@/lib/ui/stores';
import { toggleWishlist } from '@/lib/ui/wishlist';

const Lightbox = dynamic(() => import('@/components/property/Lightbox'), { ssr: false });

const STATUS_DOT: Record<ReturnType<typeof statusChip>, string> = {
  Ready: 'bg-emerald-500',
  'Under construction': 'bg-amber-500',
  'Pre-launch': 'bg-sky-500',
  'New launch': 'bg-violet-500',
};

const TYPE_NOUN: Record<Property['propertyType'], string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  'row-house': 'Row house',
  plot: 'Plot',
  office: 'Office',
  retail: 'Retail',
};

function configSummary(p: Property): string {
  const bhks = [...p.bhkOptions].filter((b) => b > 0).sort((a, b) => a - b);
  const noun = TYPE_NOUN[p.propertyType];
  if (!bhks.length) return p.segment === 'plot' && p.sizeMin ? `${noun} · from ${p.sizeMin.toLocaleString('en-IN')} sq.ft` : noun;
  const range = bhks[0] === bhks[bhks.length - 1] ? `${bhks[0]}` : `${bhks[0]}–${bhks[bhks.length - 1]}`;
  return `${range} BHK · ${noun}`;
}

/** Cover first, then the rest of the gallery without repeating it. */
export function propertyPhotos(p: Property) {
  return [p.media.cover, ...p.media.gallery.filter((img) => img.id !== p.media.cover.id)];
}

export function ExploreCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const saved = shortlistStore.useValue().includes(property.id);
  const compareItems = compareStore.useValue();
  const comparing = compareItems.some((c) => c.id === property.id);
  const compareFull = !comparing && compareItems.length >= MAX_COMPARE;
  const [viewer, setViewer] = useState(false);
  const status = statusChip(property);
  // The full project page opens in a new tab so the list stays where it was.
  const href = `/properties/${property.slug}`;
  const rent = property.transaction === 'rent';
  const { cover } = property.media;
  const photos = propertyPhotos(property);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-base hover:border-line-strong hover:shadow-[0_14px_34px_-22px_rgb(var(--shadow)/0.45)]">
      <button
        type="button"
        onClick={() => setViewer(true)}
        className="relative z-[1] block aspect-[4/3] w-full overflow-hidden bg-surface-2 text-left"
        aria-label={`View ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} of ${property.title}`}
      >
        <Image
          src={cover.url}
          alt=""
          fill
          priority={priority}
          quality={60}
          placeholder={cover.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={cover.blurDataURL}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 26vw, (min-width: 640px) 34vw, 46vw"
          className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-3.5rem)] items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} />
          <span className="truncate">{status}</span>
        </span>
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-scrim/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
          <Expand className="h-3 w-3" aria-hidden="true" /> {photos.length}
        </span>
      </button>

      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => toggleWishlist(property.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from your wishlist` : `Save ${property.title} to your wishlist`}
          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-[transform,background-color] duration-fast before:absolute before:-inset-1.5 before:content-[''] active:scale-90 ${
            saved ? 'bg-accent text-accent-on' : 'bg-surface/95 text-ink hover:text-accent-ink'
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => toggleCompare({ id: property.id, slug: property.slug, title: property.title })}
          disabled={compareFull}
          aria-pressed={comparing}
          aria-label={comparing ? `Remove ${property.title} from compare` : compareFull ? `Compare holds ${MAX_COMPARE} projects; remove one first` : `Add ${property.title} to compare`}
          title={compareFull ? `Compare up to ${MAX_COMPARE} projects` : undefined}
          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-[transform,background-color] duration-fast before:absolute before:-inset-1.5 before:content-[''] active:scale-90 disabled:opacity-50 ${
            comparing ? 'bg-ink text-bg' : 'bg-surface/95 text-ink hover:text-accent-ink'
          }`}
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="tabular whitespace-nowrap text-base font-bold leading-tight sm:text-lg">
          {formatINR(property.priceMin)}
          <span className="ml-1 text-xs font-medium text-ink-muted">{rent ? '/mo' : property.priceMax ? 'onwards' : ''}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm">{configSummary(property)}</p>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent-ink hover:underline">
            {property.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{property.locality}</span>
        </p>

        <div className="mt-auto space-y-2 pt-3">
          {/*
            K-RERA badge and Karnataka RERA portal link, hidden on cards for now at the client's
            request (the detail page still shows them). To restore, uncomment this block and add
            ExternalLink, ShieldCheck (lucide-react) and shortRera (@/lib/property) to the imports.

          {property.rera.number ? (
            <div className="flex items-stretch gap-1">
              <span className="flex min-w-0 flex-1 items-center gap-1 rounded-lg bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent-ink" title={property.rera.number}>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 leading-tight">
                  <span className="block">K-RERA Registered</span>
                  <span className="block truncate font-mono font-medium">{shortRera(property.rera.number)}</span>
                </span>
              </span>
              {property.rera.verifyUrl && (
                <a href={property.rera.verifyUrl} target="_blank" rel="noopener noreferrer" className="relative inline-flex w-8 shrink-0 items-center justify-center rounded-lg border border-line text-accent-ink hover:bg-surface-2" aria-label={`Verify the K-RERA registration of ${property.title} on the Karnataka RERA portal`}>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-surface-2 px-2 py-1 text-[10px] text-ink-muted">RERA details on request</p>
          )}
          */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Inspect allocation deck for ${property.title} (opens in a new tab)`}
            className="btn-secondary min-h-[44px] w-full gap-1 rounded-xl px-2 text-xs font-semibold sm:text-sm"
          >
            <span className="sm:hidden">Inspect deck</span>
            <span className="hidden sm:inline">Inspect allocation deck</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      {viewer && createPortal(<Lightbox images={photos} start={0} title={property.title} onClose={() => setViewer(false)} />, document.body)}
    </article>
  );
}
