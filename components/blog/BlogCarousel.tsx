'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { BlogPost } from '@/lib/data/types';
import { BlogCard } from './BlogCard';

const INTERVAL = 6500;

/**
 * The featured posts (starred in the admin) rotating in the lead slot. Slides stack in one grid
 * cell so the card keeps the height of the tallest one; it pauses on hover or focus, and does not
 * auto-play when the visitor prefers reduced motion.
 */
export function BlogCarousel({ posts, priority = false }: { posts: BlogPost[]; priority?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const hovering = useRef(false);
  const count = posts.length;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setStopped(true);
  }, []);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || stopped) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, stopped, count, go]);

  if (!count) return null;
  if (count === 1) return <BlogCard post={posts[0]} variant="lead" priority={priority} />;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured articles"
      className="relative"
      onMouseEnter={() => ((hovering.current = true), setPaused(true))}
      onMouseLeave={() => ((hovering.current = false), setPaused(false))}
      onFocus={() => setPaused(true)}
      onBlur={() => !hovering.current && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      <div className="grid">
        {posts.map((post, i) => {
          const active = i === index;
          return (
            <div
              key={post.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ inert: active ? undefined : '' } as any)}
              className={`[grid-area:1/1] transition-[opacity,transform] duration-500 ease-out ${active ? 'z-10 translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'}`}
            >
              <BlogCard post={post} variant="lead" priority={priority && i === 0} />
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a featured article">
          {posts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show “${post.title}”`}
              onClick={() => go(i)}
              className="group flex h-6 items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-accent' : 'w-3 bg-line-strong group-hover:bg-ink-muted'}`} />
            </button>
          ))}
          <span className="ml-1.5 font-mono text-[11px] text-ink-muted">
            {index + 1}/{count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setStopped((s) => !s)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-surface-2" aria-label={stopped ? 'Play the carousel' : 'Pause the carousel'}>
            {stopped ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => go(index - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-surface-2" aria-label="Previous featured article">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(index + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-surface-2" aria-label="Next featured article">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
