import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/lib/data/types';
import { blogDate } from '@/lib/blog';

function Meta({ post, light = false }: { post: BlogPost; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs ${light ? 'text-white/75' : 'text-ink-muted'}`}>
      <span className={`font-semibold ${light ? 'text-brass' : 'text-accent-ink'}`}>{post.category}</span>
      <span aria-hidden="true">·</span>
      <span>{blogDate(post.publishedAt)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden="true" /> {post.readMinutes} min read
      </span>
    </p>
  );
}

// Blog post card in three sizes: the lead story, a grid card and a compact row (suggestions).
export function BlogCard({ post, variant = 'grid', priority = false }: { post: BlogPost; variant?: 'lead' | 'grid' | 'compact'; priority?: boolean }) {
  const href = `/blogs/${post.slug}`;

  if (variant === 'lead') {
    return (
      <Link href={href} className="group grid overflow-hidden rounded-[22px] border border-line bg-surface transition-shadow duration-base hover:shadow-[0_30px_60px_-40px_rgb(var(--shadow)/0.6)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/10] bg-surface-2 md:aspect-auto md:min-h-[300px]">
          {post.cover && <Image src={post.cover.url} alt={post.cover.alt} fill priority={priority} sizes="(min-width: 768px) 55vw, 100vw" quality={70} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-900">{post.featured ? 'Featured' : 'Latest'}</span>
        </div>
        <div className="flex flex-col justify-center gap-3 p-5 sm:p-7">
          <Meta post={post} />
          <h2 className="font-serif text-2xl leading-tight tracking-[-0.02em] sm:text-[1.75rem]">{post.title}</h2>
          {post.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>}
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink">
            Read the article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={href} className="group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface-2/70">
        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
          {post.cover && <Image src={post.cover.url} alt="" fill sizes="80px" quality={50} className="object-cover" />}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent-ink">{post.title}</span>
          <span className="mt-0.5 block text-[11px] text-ink-muted">
            {post.category} · {post.readMinutes} min
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,box-shadow] duration-base hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-36px_rgb(var(--shadow)/0.6)]">
      <div className="relative aspect-[16/9] bg-surface-2">
        {post.cover && <Image src={post.cover.url} alt={post.cover.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" quality={60} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Meta post={post} />
        <h3 className="line-clamp-2 text-[1.05rem] font-semibold leading-snug group-hover:text-accent-ink">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-ink-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
