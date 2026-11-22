import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCarousel } from '@/components/blog/BlogCarousel';
import { getPublishedBlogs } from '@/lib/data/cached';
import { featuredPosts } from '@/lib/blog';
import { breadcrumbJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog: Bengaluru property guides and market notes',
  description: 'Plain-language guides on buying a home in Bengaluru: K-RERA checks, Khata and approvals, home loans, locality guides and project spotlights from EstateNav.',
  alternates: { canonical: '/blogs' },
};

export default async function BlogsPage({ searchParams }: { searchParams: { category?: string } }) {
  const posts = await getPublishedBlogs();
  const categories = Array.from(new Set(posts.map((p) => p.category))).map((c) => ({ name: c, count: posts.filter((p) => p.category === c).length }));
  const active = categories.some((c) => c.name === searchParams.category) ? searchParams.category! : '';
  const lead = active ? [] : featuredPosts(posts);
  const leadIds = new Set(lead.map((p) => p.id));
  const rest = (active ? posts.filter((p) => p.category === active) : posts).filter((p) => !leadIds.has(p.id));
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
  ];

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Blog', name: 'EstateNav blog', url: absoluteUrl('/blogs') }} />
      <Breadcrumbs items={crumbs} />

      <header className="mt-6 max-w-3xl">
        <p className="sheet-label flex items-center gap-2.5"><span aria-hidden="true" className="h-px w-8 bg-brass/60" /> Blog</p>
        <h1 className="mt-3 font-serif text-[2.4rem] leading-[1.04] sm:text-[3.4rem]">
          Bengaluru property, <span className="text-accent-ink">explained.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">Guides on checking K-RERA, approvals and prices, home loans, and the areas worth a look, written by the advisor who takes you on the site visit.</p>
      </header>

      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-16 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-muted"><Newspaper className="h-6 w-6" aria-hidden="true" /></span>
          <p className="mt-2 font-serif text-[1.75rem]">The first articles are on their way.</p>
          <Link href="/properties" className="btn-secondary">
            Explore projects meanwhile
          </Link>
        </div>
      ) : (
        <>
          {lead.length > 0 && (
            <div className="mt-10">
              <BlogCarousel posts={lead} priority />
            </div>
          )}

          {categories.length > 1 && (
            <nav aria-label="Blog categories" className="no-scrollbar mt-12 flex gap-2 overflow-x-auto pb-1">
              <Link href="/blogs" scroll={false} aria-current={!active ? 'page' : undefined} data-active={!active} className="chip shrink-0">
                All <span className="font-mono text-2xs text-ink-muted">{posts.length}</span>
              </Link>
              {categories.map((c) => (
                <Link key={c.name} href={`/blogs?category=${encodeURIComponent(c.name)}`} scroll={false} aria-current={active === c.name ? 'page' : undefined} data-active={active === c.name} className="chip shrink-0">
                  {c.name} <span className="font-mono text-2xs text-ink-muted">{c.count}</span>
                </Link>
              ))}
            </nav>
          )}

          {rest.length > 0 && (
            <section aria-label={active ? `${active} articles` : 'More articles'} className="mt-8">
              {!active && <h2 className="mb-6 font-serif text-[1.75rem] leading-tight">More to read</h2>}
              <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {rest.map((p) => (
                  <li key={p.id}>
                    <BlogCard post={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
