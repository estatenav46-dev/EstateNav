import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/lib/data/types';
import { BlogCard } from '@/components/blog/BlogCard';
import { leadPost } from '@/lib/blog';
import { SectionHeading } from './SectionHeading';

// Latest articles on the home page; hidden until the first post is published.
export function FromTheBlog({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  const lead = leadPost(posts)!;
  const rest = posts.filter((p) => p.id !== lead.id).slice(0, 3);

  return (
    <section aria-labelledby="blog-title" className="mx-auto max-w-container px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <SectionHeading
        index="04"
        kicker="From the blog"
        id="blog-title"
        title={<>Know before <span className="text-accent-ink">you visit.</span></>}
        action={
          <Link href="/blogs" className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink hover:text-accent-ink">
            All articles
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line transition-transform duration-base group-hover:translate-x-1 group-hover:border-accent">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        }
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BlogCard post={lead} variant="lead" />
        {rest.length > 0 && (
          <ul className="space-y-1 rounded-[22px] border border-line bg-surface p-3">
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
