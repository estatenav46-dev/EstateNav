import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock, Star } from 'lucide-react';
import type { BlogPost } from '@/lib/data/types';
import { blogDate, coverRatio } from '@/lib/blog';

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
      <Link href={href} className="lift group grid h-full items-center overflow-hidden rounded-card border border-line bg-surface md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* The cover keeps its own shape (covers often carry text), so nothing is cropped. */}
        <div className="relative overflow-hidden bg-surface-2" style={{ aspectRatio: coverRatio(post.cover) }}>
          {post.cover && <Image src={post.cover.url} alt={post.cover.alt} fill priority={priority} sizes="(min-width: 768px) 55vw, 100vw" quality={70} className="lift-photo object-cover" />}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-900">
            {post.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />}
            {post.featured ? 'Featured' : 'Latest'}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-2.5 p-6">
          <Meta post={post} />
          <h2 className="font-serif text-[1.5rem] leading-[1.15] sm:text-[1.75rem]">{post.title}</h2>
          {post.excerpt && <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-ink-muted">{post.excerpt}</p>}
          <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink">
            Read the article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={href} className="group flex min-h-[44px] items-center gap-4 py-3">
        <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-[10px] bg-surface-2">
          {post.cover && <Image src={post.cover.url} alt="" fill sizes="96px" quality={50} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 font-serif text-[1.1rem] leading-snug transition-colors group-hover:text-accent-ink">{post.title}</span>
          <span className="mt-1 block text-xs text-ink-muted">
            {post.category} · {post.readMinutes} min
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex h-full flex-col">
      <div className="relative aspect-video overflow-hidden rounded-card bg-surface-2">
        {post.cover && <Image src={post.cover.url} alt={post.cover.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" quality={60} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <Meta post={post} />
        <h3 className="line-clamp-2 font-serif text-[1.35rem] leading-snug transition-colors group-hover:text-accent-ink">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-ink-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
