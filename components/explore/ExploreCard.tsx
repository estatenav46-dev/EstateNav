'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, GitCompareArrows, Heart, Images, MapPin, Sparkles } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { formatINR } from '@/lib/price';
import { scaleFacts, statusChip } from '@/lib/property';
import { compareStore, MAX_COMPARE, shortlistStore, toggleCompare } from '@/lib/ui/stores';
import { toggleWishlist } from '@/lib/ui/wishlist';
import { track } from '@/lib/ui/visitor';

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
  villament: 'Villament',
  penthouse: 'Penthouse',
  'independent-house': 'Independent house',
  plot: 'Plot',
  office: 'Office',
  retail: 'Retail',
};

function configSummary(p: Property): string {
  const bhks = [...p.bhkOptions].filter((b) => b > 0).sort((a, b) => a - b);
  const noun = TYPE_NOUN[p.propertyType];
  if (!bhks.length) return p.segment === 'plot' && p.sizeMin ? `${noun} · ${p.sizeMin.toLocaleString('en-IN')}+ sq.ft` : noun;
  const range = bhks[0] === bhks[bhks.length - 1] ? `${bhks[0]}` : `${bhks[0]}–${bhks[bhks.length - 1]}`;
  return `${range} BHK ${noun}`;
}

/** Cover first, then the rest of the gallery without repeating it. */
export function propertyPhotos(p: Property) {
  return [p.media.cover, ...p.media.gallery.filter((img) => img.id !== p.media.cover.id)];
}

const roundBtn =
  'cq-btn relative inline-flex h-10 w-10 items-center justify-center rounded-full shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)] transition-[transform,background-color,color] duration-base active:scale-[0.9] before:absolute before:-inset-1 before:content-[""]';

// The whole card opens the project page (in a new tab, so the list keeps its place). The
// heart, compare and photo buttons sit above that link and keep their own actions.
export function ExploreCard({ property, priority = false, reasons, sizes }: { property: Property; priority?: boolean; reasons?: string[]; sizes?: string }) {
  const saved = shortlistStore.useValue().includes(property.id);
  const compareItems = compareStore.useValue();
  const comparing = compareItems.some((c) => c.id === property.id);
  const compareFull = !comparing && compareItems.length >= MAX_COMPARE;
  const [viewer, setViewer] = useState(false);
  const [pop, setPop] = useState(0);
  const status = statusChip(property);
  const href = `/properties/${property.slug}`;
  const rent = property.transaction === 'rent';
  const { cover } = property.media;
  const photos = propertyPhotos(property);
  const possession = property.possession.status === 'ready' ? 'Ready to move' : property.possession.status === 'pre-launch' ? 'Pre-launch' : `Possession ${property.possession.label}`;
  const facts = [...scaleFacts(property).slice(0, 2), possession];

  return (
    <article className="cq group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:border-transparent [@media(hover:hover)]:hover:shadow-[0_30px_60px_-30px_rgb(var(--shadow)/0.55)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <Image
          src={cover.url}
          alt=""
          fill
          priority={priority}
          quality={65}
          placeholder={cover.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={cover.blurDataURL}
          sizes={sizes ?? '(min-width: 1536px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 44vw, 80vw'}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <span className="cq-wide absolute left-3 top-3 inline-flex max-w-[calc(100%-4rem)] items-center gap-1.5 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} />
          <span className="truncate">{status}</span>
        </span>
        {reasons && reasons.length > 0 && (
          <ul className="cq-wide absolute bottom-3 left-3 right-16 flex flex-wrap gap-1" aria-label="Why it is similar">
            {reasons.slice(0, 2).map((r) => (
              <li key={r} className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/20">
                <Sparkles className="h-3 w-3 text-brass" aria-hidden="true" /> {r}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setViewer(true)}
          className="absolute bottom-3 right-3 z-[2] inline-flex h-8 items-center gap-1.5 rounded-full bg-black/60 px-2.5 text-[11px] font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-black/70"
          aria-label={`View ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} of ${property.title}`}
        >
          <Images className="h-3.5 w-3.5" aria-hidden="true" /> {photos.length}
        </button>
      </div>

      <div className="cq-pad flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="tabular whitespace-nowrap text-[1.15rem] font-bold leading-tight tracking-[-0.01em]">
            {property.priceOnRequest ? (
              <span className="text-[0.95rem]">Price on request</span>
            ) : (
              <>
                {formatINR(property.priceMin)}
                <sup className="ml-px text-[0.65em] font-semibold text-brass">*</sup>
                {(rent || property.priceMax) && <span className="ml-1 text-xs font-medium text-ink-muted">{rent ? '/month' : 'onwards'}</span>}
              </>
            )}
          </p>
          <p className="cq-wide truncate text-xs font-medium text-ink-muted">{configSummary(property)}</p>
        </div>
        <h3 className="cq-title mt-1.5 line-clamp-1 text-[0.95rem] font-semibold leading-snug">
          <a href={href} target="_blank" rel="noopener noreferrer" className="outline-none after:absolute after:inset-0 after:z-[1] after:rounded-[24px] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-accent-ink">
            {property.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{property.locality}</span>
          </p>
          <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-[transform,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-on">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        {facts.length > 0 && <p className="cq-wide mt-2 truncate border-t border-line pt-2 text-[11px] font-medium text-ink-muted">{facts.join(' · ')}</p>}
      </div>

      <div className="absolute right-3 top-3 z-[2] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            if (toggleWishlist(property.id) && !saved) setPop((n) => n + 1);
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from your wishlist` : `Save ${property.title} to your wishlist`}
          className={`${roundBtn} ${saved ? 'bg-accent text-accent-on' : 'bg-white/90 text-neutral-900 hover:scale-105'}`}
        >
          <Heart key={pop} className={`h-[18px] w-[18px] ${saved ? 'fill-current' : ''} ${pop && saved ? 'heart-pop' : ''}`} strokeWidth={1.75} aria-hidden="true" />
          {pop > 0 && saved && <span key={`b${pop}`} className="heart-burst" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (toggleCompare({ id: property.id, slug: property.slug, title: property.title }) && !comparing) track('compare', { id: property.id });
          }}
          disabled={compareFull}
          aria-pressed={comparing}
          aria-label={comparing ? `Remove ${property.title} from compare` : compareFull ? `Compare holds ${MAX_COMPARE} projects; remove one first` : `Add ${property.title} to compare`}
          title={compareFull ? `Compare up to ${MAX_COMPARE} projects` : 'Compare'}
          className={`${roundBtn} disabled:opacity-50 ${comparing ? 'bg-ink text-bg' : 'bg-white/90 text-neutral-900 hover:scale-105'}`}
        >
          <GitCompareArrows className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {viewer && createPortal(<Lightbox images={photos} start={0} title={property.title} onClose={() => setViewer(false)} />, document.body)}
    </article>
  );
}
