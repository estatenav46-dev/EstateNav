import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/lib/data/types';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCarousel } from '@/components/blog/BlogCarousel';
import { featuredPosts } from '@/lib/blog';
import { SectionHeading } from './SectionHeading';

// Latest articles on the home page; hidden until the first post is published.
export function FromTheBlog({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  const lead = featuredPosts(posts);
  const leadIds = new Set(lead.map((p) => p.id));
  const rest = posts.filter((p) => !leadIds.has(p.id)).slice(0, 4);

  return (
    <section aria-labelledby="blog-title" className="mx-auto max-w-container px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <SectionHeading
        index="04"
        kicker="From the blog"
        id="blog-title"
        title={<>Know before <span className="text-accent-ink">you visit.</span></>}
        action={
          <Link href="/blogs" className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
            All articles
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong transition-[transform,border-color] duration-base group-hover:translate-x-1 group-hover:border-ink">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        }
      />
      <div className={`mt-6 grid gap-6 sm:mt-7 lg:gap-10 ${rest.length ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : ''}`}>
        <BlogCarousel posts={lead} />
        {rest.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {rest.map((p) => (
              <li key={p.id}>
                <BlogCard post={p} variant="compact" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
