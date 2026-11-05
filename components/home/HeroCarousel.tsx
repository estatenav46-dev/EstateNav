'use client';

import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { configLabels, priceLabel, statusChip } from '@/lib/property';
import { formatINR } from '@/lib/price';
import { StatusChip } from '@/components/property/PropertyCard';

const AUTOPLAY_MS = 6000;
const PARALLAX = 0.15;

function fromLabel(property: Property) {
  return property.priceMax ? priceLabel(property) : `From ${formatINR(property.priceMin)}${property.transaction === 'rent' ? ' /month' : ''}`;
}

function Plate({ property, overlay, active }: { property: Property; overlay: boolean; active: boolean }) {
  return (
    <div className={overlay ? 'panel w-[min(440px,calc(100%-3rem))] p-5' : 'px-1 pt-4'}>
      {overlay ? <StatusChip property={property} className="border border-line" /> : <span className="sheet-label">{statusChip(property)}</span>}
      <h2 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">{property.title}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {property.locality} · {property.corridorName}
      </p>
      <p className="mt-1 truncate text-sm text-ink">{configLabels(property).slice(0, 4).join(' · ')}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="tabular font-serif text-xl">{fromLabel(property)}</p>
        <Link href={`/properties/${property.slug}`} className="btn-primary min-h-[44px] px-4" tabIndex={active ? 0 : -1}>
          View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// Centre-focus "coverflow-lite": the active slide sits at ~72% width; neighbours shrink to
// 0.92, dim to about 55% and peek in. Images drift at 0.15x the slide offset.
export function HeroCarousel({ slides, label }: { slides: Property[]; label: string }) {
  const loop = slides.length > 2;
  const [viewportRef, embla] = useEmblaCarousel({ loop, align: 'center', containScroll: loop ? false : 'keepSnaps', duration: 30 });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchResume = useRef<ReturnType<typeof setTimeout>>();
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tween = useCallback((api: EmblaCarouselType, event?: string) => {
    const engine = api.internalEngine();
    const progress = api.scrollProgress();
    const snaps = api.scrollSnapList();
    const inView = api.slidesInView();
    const factor = snaps.length > 1 ? snaps.length - (loop ? 0 : 1) : 1;
    snaps.forEach((snap, snapIndex) => {
      let diff = snap - progress;
      engine.slideRegistry[snapIndex].forEach((slideIndex) => {
        if (event === 'scroll' && !inView.includes(slideIndex)) return;
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((point) => {
            const target = point.target();
            if (slideIndex === point.index && target !== 0) {
              if (Math.sign(target) === -1) diff = snap - (1 + progress);
              if (Math.sign(target) === 1) diff = snap + (1 - progress);
            }
          });
        }
        const offset = diff * factor;
        const distance = Math.min(1, Math.abs(offset));
        const node = slideRefs.current[slideIndex];
        if (!node) return;
        const frame = node.querySelector<HTMLElement>('[data-frame]');
        const image = node.querySelector<HTMLElement>('[data-image]');
        const dim = node.querySelector<HTMLElement>('[data-dim]');
        const plates = node.querySelectorAll<HTMLElement>('[data-plate]');
        if (frame) frame.style.transform = `scale(${1 - 0.08 * distance})`;
        if (image) image.style.transform = `translateX(${(-offset * PARALLAX * 100).toFixed(2)}%)`;
        if (dim) dim.style.opacity = String(0.45 * distance);
        plates.forEach((plate) => (plate.style.opacity = String(Math.max(0, 1 - distance * 2.5))));
      });
    });
  }, [loop]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    tween(embla);
    onSelect();
    embla.on('reInit', tween).on('scroll', tween).on('slideFocus', tween).on('select', onSelect);
    return () => {
      embla.off('reInit', tween).off('scroll', tween).off('slideFocus', tween).off('select', onSelect);
    };
  }, [embla, tween]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    const visibility = () => setHiddenTab(document.hidden);
    update();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  const running = !paused && !hovering && !hiddenTab && !reduced && slides.length > 1;
  const go = (index: number) => embla?.scrollTo(index);
  const next = () => embla?.scrollNext();
  const prev = () => embla?.scrollPrev();
  const current = slides[selected];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHovering(false)}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') return;
        clearTimeout(touchResume.current);
        setHovering(true);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'mouse') return;
        touchResume.current = setTimeout(() => setHovering(false), 4000);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      <div ref={viewportRef} className="overflow-hidden" tabIndex={0} aria-label={`${label}. Use the left and right arrow keys to move between projects.`}>
        <div className="flex touch-pan-y translate-x-[8%] sm:translate-x-[11%] lg:translate-x-[14%]">
          {slides.map((property, index) => (
            <div
              key={property.id}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${property.title}`}
              className="min-w-0 shrink-0 grow-0 basis-[84%] pl-3 sm:basis-[78%] lg:basis-[72%] lg:pl-5"
            >
              <div data-frame className="origin-center will-change-transform" style={index === 0 ? undefined : { transform: 'scale(0.92)' }}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-slide bg-surface-2 sm:aspect-[16/9] lg:aspect-[16/7]">
                  <div data-image className="absolute inset-y-0 -left-[16%] -right-[16%] will-change-transform">
                    <Image
                      src={property.media.cover.url}
                      alt={property.media.cover.alt}
                      fill
                      priority={index === 0}
                      quality={60}
                      placeholder="blur"
                      blurDataURL={property.media.cover.blurDataURL}
                      sizes="(min-width: 1024px) 72vw, (min-width: 640px) 78vw, 84vw"
                      className="object-cover"
                    />
                  </div>
                  <div data-dim aria-hidden="true" className="absolute inset-0 bg-scrim" style={{ opacity: index === 0 ? 0 : 0.45 }} />
                  <div data-plate className="absolute bottom-6 left-6 hidden lg:block" style={index === 0 ? undefined : { opacity: 0 }}>
                    <Plate property={property} overlay active={index === selected} />
                  </div>
                </div>
                <div className="lg:hidden" data-plate style={index === 0 ? undefined : { opacity: 0 }}>
                  <Plate property={property} overlay={false} active={index === selected} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-container items-center gap-3 px-4 sm:px-6 lg:px-8">
        <p className="tabular shrink-0 font-mono text-sm text-ink-muted" aria-live={running ? 'off' : 'polite'}>
          <span className="text-ink">{String(selected + 1).padStart(2, '0')}</span> / {String(slides.length).padStart(2, '0')}
          <span className="sr-only">: {current?.title}</span>
        </p>
        <ol className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Projects in this carousel">
          {slides.map((property, index) => (
            <li key={property.id} className="min-w-[132px] flex-1">
              <button type="button" onClick={() => go(index)} aria-current={index === selected ? 'true' : undefined} className="group block w-full pb-1 pt-2 text-left">
                <span className={`block truncate text-sm transition-colors duration-fast ${index === selected ? 'text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{property.title}</span>
                <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-line">
                  {index === selected && (
                    <span
                      key={selected}
                      className="block h-full origin-left bg-accent"
                      style={
                        reduced || slides.length < 2
                          ? { transform: 'scaleX(1)' }
                          : { animation: `progress ${AUTOPLAY_MS}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }
                      }
                      onAnimationEnd={next}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setPaused((p) => !p)} className="icon-btn hidden sm:inline-flex" aria-label={paused ? 'Resume autoplay' : 'Pause autoplay'}>
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={prev} className="icon-btn" aria-label="Previous project">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={next} className="icon-btn" aria-label="Next project">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
