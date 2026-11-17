'use client';

import Image from 'next/image';
import { useRef, useState, type CSSProperties } from 'react';
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
  return property.priceMax ? priceLabel(property) : `From ${formatINR(property.priceMin)}${property.transaction === 'rent' ? ' /month' : ''}`;
}

type Props = {
  /** Every featured project across segments; only the active, previous and next photos load. */
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

// The hero spotlight: stacked photos that wipe in from the side they come from, a slow Ken
// Burns on the active one, and the project plate rising in over a deep gradient.
export function HeroShowcase({ all, slides, index, dir, segLabel, duration, timerKey, running, animate, paused, preload, onAdvance, onStep, onPick, onHold, onTogglePause }: Props) {
  const active = slides[index];
  const [view, setView] = useState({ id: active?.id ?? '', prev: null as string | null, dir });
  if (active && view.id !== active.id) setView({ id: active.id, prev: view.id, dir });
  const swipe = useRef<{ x: number; y: number } | null>(null);
  if (!active) return null;

  const mounted = new Set([view.id, view.prev, ...preload].filter(Boolean) as string[]);
  const chips = [statusChip(active), active.rera.number ? 'K-RERA registered' : null].filter(Boolean) as string[];

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
      <section
        aria-roledescription="carousel"
        aria-label={`Featured ${segLabel.toLowerCase()} projects`}
        className="relative isolate aspect-[4/5] touch-pan-y overflow-hidden rounded-[30px] bg-forest shadow-[0_50px_100px_-50px_rgb(var(--shadow)/0.75)] sm:aspect-[5/4] lg:aspect-[8/8.2] xl:aspect-[8/7.4]"
      >
        {all.map((p) => {
          const isActive = p.id === view.id;
          const isPrev = p.id === view.prev;
          if (!mounted.has(p.id)) return null;
          const wipe = isActive && view.prev && animate ? (view.dir === 1 ? 'wipe-next' : 'wipe-prev') : '';
          return (
            <div
              key={p.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 ${isActive ? `z-20 ${wipe}` : isPrev ? 'z-10' : 'z-0 opacity-0'}`}
            >
              <Image
                src={p.media.cover.url}
                alt={isActive ? p.media.cover.alt : ''}
                fill
                priority={p.id === all[0]?.id}
                quality={70}
                placeholder={p.media.cover.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={p.media.cover.blurDataURL}
                sizes="(min-width: 1024px) 56vw, 100vw"
                className={`object-cover ${isActive && animate ? 'kenburns' : ''}`}
              />
            </div>
          );
        })}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgb(0_0_0/0.38)_0%,transparent_22%,transparent_42%,rgb(0_0_0/0.55)_68%,rgb(0_0_0/0.86)_100%)]" />

        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4 sm:p-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" /> Featured · {segLabel}
          </span>
          <span className="tabular rounded-full bg-black/45 px-3 py-1.5 font-mono text-xs text-white/90 ring-1 ring-white/15">
            {String(index + 1).padStart(2, '0')} <span className="text-white/50">/ {String(slides.length).padStart(2, '0')}</span>
          </span>
        </div>

        <div key={active.id} className="absolute inset-x-0 bottom-0 z-30 p-4 text-white sm:p-7">
          <div className="flex flex-wrap gap-1.5 rise-in" style={{ '--d': '250ms' } as CSSProperties}>
            {chips.map((chip, i) => (
              <span key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/20">
                {i === 0 ? <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[statusChip(active)]}`} aria-hidden="true" /> : <ShieldCheck className="h-3 w-3" aria-hidden="true" />}
                {chip}
              </span>
            ))}
          </div>
          <h2 className="mt-3 max-w-[18ch] font-serif text-[1.75rem] leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.6rem]">
            <span className="word-mask">
              <span style={{ '--i': 3 } as CSSProperties}>{active.title}</span>
            </span>
          </h2>
          <p className="mt-2 text-sm text-white/75 rise-in" style={{ '--d': '380ms' } as CSSProperties}>
            {active.locality} · {active.corridorName}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rise-in" style={{ '--d': '460ms' } as CSSProperties}>
            <div className="min-w-0">
              <p className="truncate text-xs text-white/70">{configLabels(active).slice(0, 3).join(' · ')}</p>
              <p className="tabular mt-0.5 whitespace-nowrap font-serif text-2xl text-white sm:text-[1.75rem]">
                {fromLabel(active)}
                <sup className="ml-0.5 text-sm text-brass">*</sup>
              </p>
            </div>
            <a
              href={`/properties/${active.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="arrow-host group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] transition-transform duration-base active:scale-[0.97]"
            >
              View project
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest text-forest-on transition-transform duration-slow ease-out group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-center gap-3">
        <ol className="flex min-w-0 flex-1 gap-1.5" aria-label="Projects in this segment">
          {slides.map((p, i) => (
            <li key={p.id} className="min-w-0 flex-1">
              <button type="button" onClick={() => onPick(i)} aria-current={i === index ? 'true' : undefined} className="group block w-full py-3 text-left" aria-label={`Show ${p.title}`}>
                <span className="block h-[3px] overflow-hidden rounded-full bg-line">
                  {i < index && <span className="block h-full w-full bg-ink/70" />}
                  {i === index && (
                    <span
                      key={timerKey}
                      className={`block h-full bg-accent ${animate ? 'timer-fill' : ''}`}
                      style={{ '--dur': `${duration}ms`, animationPlayState: running ? 'running' : 'paused' } as CSSProperties}
                      onAnimationEnd={onAdvance}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={onTogglePause} className="icon-btn hidden h-11 w-11 sm:inline-flex" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}>
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => onStep(-1)} className="icon-btn h-11 w-11" aria-label="Previous project">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onStep(1)} className="icon-btn h-11 w-11 border-ink bg-ink text-bg hover:border-ink hover:bg-ink/85" aria-label="Next project">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
