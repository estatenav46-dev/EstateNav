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
  'New launch': 'bg-violet-400',
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
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold ring-1 ring-line">
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
                className={`h-[19rem] shrink-0 grow basis-[84%] sm:h-[20rem] sm:basis-[calc((100%-0.75rem)/2)] md:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-0.75rem)/2)] xl:h-[21rem] xl:basis-[calc((100%-1.5rem)/3)] ${animate ? (dir === 1 ? 'card-in-next' : 'card-in-prev') : ''}`}
                style={{ '--d': `${k * 70}ms` } as CSSProperties}
              >
                <a
                  href={`/properties/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-2xl bg-forest p-3.5 text-white shadow-[0_24px_50px_-34px_rgb(var(--shadow)/0.8)]"
                >
                  <Image
                    src={p.media.cover.url}
                    alt={p.media.cover.alt}
                    fill
                    priority={k === 0 && p.id === firstId}
                    quality={65}
                    placeholder={p.media.cover.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={p.media.cover.blurDataURL}
                    sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 27vw, (min-width: 768px) 31vw, (min-width: 640px) 47vw, 84vw"
                    className="-z-10 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.35)_0%,transparent_26%,transparent_40%,rgb(0_0_0/0.6)_66%,rgb(0_0_0/0.9)_100%)]" />

                  <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/20">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[chip]}`} aria-hidden="true" /> {chip}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform duration-slow ease-out group-hover:rotate-45" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>

                  <h2 className="line-clamp-2 font-serif text-[1.2rem] leading-[1.1] tracking-[-0.02em] text-white">{p.title}</h2>
                  <p className="mt-1 truncate text-xs text-white/75">
                    {p.locality} · {p.corridorName}
                  </p>
                  <p className="mt-2 truncate text-[11px] text-white/70">{configLabels(p).slice(0, 3).join(' · ')}</p>
                  <div className="mt-0.5 flex items-end justify-between gap-2">
                    <p className="tabular truncate font-serif text-[1.3rem] leading-tight text-white">
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

      <div className="mt-3 flex items-center gap-3">
        <span aria-hidden="true" className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
          <span
            key={timerKey}
            className={`block h-full origin-left bg-brass ${animate ? 'timer-fill' : ''}`}
            style={{ '--dur': `${duration}ms`, animationPlayState: running ? 'running' : 'paused' } as CSSProperties}
            onAnimationEnd={onAdvance}
          />
        </span>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onTogglePause} className="hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-2 sm:inline-flex" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}>
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => onStep(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-2" aria-label="Previous project">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onStep(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg hover:bg-ink/85" aria-label="Next project">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
