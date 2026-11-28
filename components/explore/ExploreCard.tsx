'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, BadgePercent, Briefcase, GitCompareArrows, Heart, Images, MapPin, Sparkles } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { formatINR, formatSqftRange } from '@/lib/price';
import { activeOffer, bhkLabel, rateLabel, statusChip } from '@/lib/property';
import { compareStore, MAX_COMPARE, shortlistStore, toggleCompare } from '@/lib/ui/stores';
import { toggleWishlist } from '@/lib/ui/wishlist';
import { track } from '@/lib/ui/visitor';

const Lightbox = dynamic(() => import('@/components/property/Lightbox'), { ssr: false });

const STATUS_DOT: Record<ReturnType<typeof statusChip>, string> = {
  Ready: 'bg-emerald-500',
  'Under construction': 'bg-amber-500',
  'Pre-launch': 'bg-sky-500',
  'New launch': 'bg-teal-500',
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
  'cq-btn relative inline-flex h-10 w-10 items-center justify-center rounded-full shadow-[0_4px_12px_-6px_rgb(0_0_0/0.5)] backdrop-blur-sm transition-[transform,background-color,color] duration-base active:scale-[0.9] before:absolute before:-inset-1 before:content-[""]';

// The whole card opens the project page (in a new tab, so the list keeps its place). The
// heart, compare and photo buttons sit above that link and keep their own actions.
export function ExploreCard({ property, priority = false, reasons, sizes, commute }: { property: Property; priority?: boolean; reasons?: string[]; sizes?: string; /** Distance to the tech park searched for, shown on every card size. */ commute?: string }) {
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
  const offer = activeOffer(property);
  const rate = rateLabel(property);
  const size = formatSqftRange(property.sizeMin, property.sizeMax);
  const bhks = [...property.bhkOptions].filter((b) => b > 0).sort((a, b) => a - b);
  const units = bhks.length ? Array.from(new Set(bhks.map(bhkLabel))) : [configSummary(property)];
  const f = property.facts;
  const stats: [string, string, boolean][] = [
    ['Possession', property.possession.status === 'ready' ? 'Ready' : property.possession.status === 'pre-launch' ? 'Pre-launch' : property.possession.label, property.possession.status === 'ready'],
    f.landAcres ? ['Land', `${Number(f.landAcres.toFixed(1))} acres`, false] : f.totalUnits ? ['Units', f.totalUnits.toLocaleString('en-IN'), false] : ['Type', TYPE_NOUN[property.propertyType], false],
    ['K-RERA', property.rera.number ? 'Registered' : 'On request', Boolean(property.rera.number)],
  ];

  return (
    <article className="cq lift group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface">
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
          className="lift-photo object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
        <span className="cq-wide absolute left-3 top-3 inline-flex max-w-[calc(100%-4rem)] items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} />
          <span className="truncate">{status}</span>
        </span>
        {offer && !reasons?.length && (
          <span className="absolute bottom-3 left-3 right-16 z-[1] inline-flex max-w-max items-center gap-1 truncate rounded-full bg-brass px-2.5 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm">
            <BadgePercent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{offer.text}</span>
          </span>
        )}
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
          className="absolute bottom-3 right-3 z-[2] inline-flex h-8 items-center gap-1.5 rounded-full bg-black/55 px-2.5 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-black/75"
          aria-label={`View ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} of ${property.title}`}
        >
          <Images className="h-3.5 w-3.5" aria-hidden="true" /> {photos.length}
        </button>
      </div>

      <div className="cq-pad flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="cq-title line-clamp-2 font-serif text-[1.25rem] leading-[1.2]">
            <a href={href} target="_blank" rel="noopener noreferrer" className="outline-none after:absolute after:inset-0 after:z-[1] after:rounded-card after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-accent-ink">
              {property.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h3>
          <span aria-hidden="true" className="cq-wide mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-[transform,background-color,border-color,color] duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-ink group-hover:bg-ink group-hover:text-bg">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[13px] text-ink-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className="truncate">
            {property.locality || property.corridorName}
            {property.locality && property.corridorName && <span className="cq-wide"> · {property.corridorName}</span>}
          </span>
        </p>
        {commute && (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-[12.5px] font-semibold text-accent-ink">
            <Briefcase className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{commute}</span>
          </p>
        )}
        {property.developerName && (
          <p className="cq-wide mt-0.5 truncate text-xs text-ink-muted">
            by <span className="font-medium text-ink">{property.developerName}</span>
          </p>
        )}

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="tabular shrink-0 whitespace-nowrap text-[1.2rem] font-semibold leading-tight tracking-[-0.015em]">
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
          {rate && <p className="cq-wide tabular min-w-0 truncate text-xs text-ink-muted" title={rate}>{rate}</p>}
        </div>

        <p className="cq-wide mt-1.5 truncate text-[13px] font-medium" aria-label={`Unit types: ${units.join(', ')}`}>
          {units.slice(0, 4).join(' · ')}
          {units.length > 4 && <span className="text-ink-muted"> · +{units.length - 4}</span>}
        </p>
        {size && <p className="cq-wide truncate text-[13px] text-ink-muted">{size}</p>}

        <dl className="cq-wide mt-auto grid grid-cols-[1.35fr_1fr_1.1fr] gap-x-2 pt-4 text-[11.5px]">
          {stats.map(([label, value, ok]) => (
            <div key={label} className="min-w-0 border-t border-line pt-2.5">
              <dt className="text-ink-muted">{label}</dt>
              <dd className={`mt-0.5 truncate font-semibold ${ok ? 'text-accent-ink' : ''}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="cq-actions absolute right-3 top-3 z-[2] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            if (toggleWishlist(property.id) && !saved) setPop((n) => n + 1);
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from your wishlist` : `Save ${property.title} to your wishlist`}
          className={`${roundBtn} ${saved ? 'bg-accent text-accent-on' : 'bg-white/95 text-neutral-900 hover:scale-105'}`}
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
          className={`${roundBtn} disabled:opacity-50 ${comparing ? 'bg-ink text-bg' : 'bg-white/95 text-neutral-900 hover:scale-105'}`}
        >
          <GitCompareArrows className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {viewer && createPortal(<Lightbox images={photos} start={0} title={property.title} onClose={() => setViewer(false)} />, document.body)}
    </article>
  );
}
