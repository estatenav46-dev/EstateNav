'use client';

import Image from 'next/image';
import { useRef, type CSSProperties } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { configLabels, priceLabel, statusChip } from '@/lib/property';
import { formatINR } from '@/lib/price';

const STATUS_DOT: Record<ReturnType<typeof statusChip>, string> = {
  Ready: 'bg-emerald-400',
  'Under construction': 'bg-amber-400',
  'Pre-launch': 'bg-sky-400',
  'New launch': 'bg-teal-300',
};

function fromLabel(property: Property) {
  if (property.priceOnRequest) return priceLabel(property);
  return property.priceMax ? priceLabel(property) : `From ${formatINR(property.priceMin)}${property.transaction === 'rent' ? ' /month' : ''}`;
}

type Props = {
  /** Every featured project across segments (kept for the caller; cards load lazily). */
  all: Property[];
  /** Projects of the segment on show, in order. */
  slides: Property[];
  index: number;
  dir: 1 | -1;
  segLabel: string;
  duration: number;
  timerKey: string;
  running: boolean;
  animate: boolean;
  paused: boolean;
  preload: string[];
  onAdvance: () => void;
  onStep: (dir: 1 | -1) => void;
  onPick: (index: number) => void;
  onHold: (hold: boolean) => void;
  onTogglePause: () => void;
};

// The hero spotlight as a card rail: several featured projects side by side (one and a peek on
// phones, two on tablets and the two-column hero, three on wide screens). Every few seconds the
// rail moves on by one project; cards slide in from the side they come from.
export function HeroShowcase({ all, slides, index, dir, segLabel, duration, timerKey, running, animate, paused, onAdvance, onStep, onHold, onTogglePause }: Props) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  if (!slides.length) return null;
  const order = slides.map((_, k) => slides[(index + k) % slides.length]);
  const firstId = all[0]?.id;

  return (
    <div
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHold(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHold(false)}
      onFocusCapture={(e) => (e.target as Element).matches(':focus-visible') && onHold(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onHold(false)}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y)) onStep(dx < 0 ? 1 : -1);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onStep(1);
        if (e.key === 'ArrowLeft') onStep(-1);
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" /> Featured · {segLabel}
        </span>
        <span className="tabular font-mono text-xs text-ink-muted">
          {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      <section aria-roledescription="carousel" aria-label={`Featured ${segLabel.toLowerCase()} projects`} className="touch-pan-y">
        <ul className="flex gap-3 overflow-hidden">
          {order.map((p, k) => {
            const chip = statusChip(p);
            return (
              <li
                key={`${timerKey}-${p.id}`}
                aria-roledescription="slide"
                aria-label={`${((index + k) % slides.length) + 1} of ${slides.length}: ${p.title}`}
                className={`h-[22rem] shrink-0 grow sm:h-[24rem] lg:h-[31rem] xl:h-[33rem] ${slides.length === 1 ? 'basis-full' : slides.length === 2 ? 'basis-[84%] sm:basis-[calc((100%-0.75rem)/2)]' : 'basis-[84%] sm:basis-[calc((100%-0.75rem)/2)] md:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-0.75rem)/2)]'} ${animate ? (dir === 1 ? 'card-in-next' : 'card-in-prev') : ''}`}
                style={{ '--d': `${k * 70}ms` } as CSSProperties}
              >
                <a
                  href={`/properties/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-card bg-forest p-4 text-white shadow-[0_24px_50px_-34px_rgb(var(--shadow)/0.8)] sm:p-5"
                >
                  <Image
                    src={p.media.cover.url}
                    alt={p.media.cover.alt}
                    fill
                    priority={k === 0 && p.id === firstId}
                    quality={65}
                    placeholder={p.media.cover.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={p.media.cover.blurDataURL}
                    sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 29vw, (min-width: 768px) 31vw, (min-width: 640px) 47vw, 84vw"
                    className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.3)_0%,transparent_22%,transparent_45%,rgb(0_0_0/0.55)_70%,rgb(0_0_0/0.85)_100%)]" />

                  <span className="absolute inset-x-4 top-4 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur-sm">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[chip]}`} aria-hidden="true" /> {chip}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform duration-base ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>

                  <h2 className="line-clamp-2 font-serif text-[1.45rem] leading-[1.08] text-white lg:text-[1.7rem]">{p.title}</h2>
                  <p className="mt-1.5 truncate text-[13px] text-white/80">
                    {p.locality} · {p.corridorName}
                  </p>
                  <p className="mt-3 truncate border-t border-white/20 pt-3 text-xs text-white/75">{configLabels(p).slice(0, 3).join(' · ')}</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="tabular truncate text-[1.15rem] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[1.3rem]">
                      {fromLabel(p)}
                      <sup className="ml-0.5 text-xs text-brass">*</sup>
                    </p>
                    {p.rera.number && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-white/80" title="K-RERA registered">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" /> K-RERA
                      </span>
                    )}
                  </div>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={`mt-4 flex items-center gap-3 ${slides.length < 2 ? 'hidden' : ''}`}>
        <span aria-hidden="true" className="h-[2px] flex-1 overflow-hidden rounded-full bg-line">
          <span
            key={timerKey}
            className={`block h-full origin-left bg-brass ${animate ? 'timer-fill' : ''}`}
            style={{ '--dur': `${duration}ms`, animationPlayState: running ? 'running' : 'paused' } as CSSProperties}
            onAnimationEnd={onAdvance}
          />
        </span>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onTogglePause} className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-ink/40 sm:inline-flex" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}>
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => onStep(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-ink/40 lg:h-10 lg:w-10" aria-label="Previous project">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onStep(1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-ink/85 lg:h-10 lg:w-10" aria-label="Next project">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
