import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { BlogCard } from '@/components/blog/BlogCard';
import { getPublishedBlogs } from '@/lib/data/cached';
import { leadPost } from '@/lib/blog';
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
  const lead = active ? null : leadPost(posts);
  const rest = (active ? posts.filter((p) => p.category === active) : posts).filter((p) => p.id !== lead?.id);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
  ];

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Blog', name: 'EstateNav blog', url: absoluteUrl('/blogs') }} />
      <Breadcrumbs items={crumbs} />

      <header className="mt-4 max-w-2xl">
        <p className="sheet-label">Blog</p>
        <h1 className="mt-1 font-serif text-3xl leading-tight tracking-[-0.02em]">
          Bengaluru property, <span className="text-accent-ink">explained.</span>
        </h1>
        <p className="mt-2 text-ink-muted">Guides on checking K-RERA, approvals and prices, home loans, and the areas worth a look, written by the advisor who takes you on the site visit.</p>
      </header>

      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-line-strong bg-surface p-12 text-center">
          <Newspaper className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="font-semibold">The first articles are on their way.</p>
          <Link href="/properties" className="btn-secondary">
            Explore projects meanwhile
          </Link>
        </div>
      ) : (
        <>
          {lead && (
            <div className="mt-8">
              <BlogCard post={lead} variant="lead" priority />
            </div>
          )}

          {categories.length > 1 && (
            <nav aria-label="Blog categories" className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
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
            <section aria-label={active ? `${active} articles` : 'More articles'} className="mt-6">
              {!active && <h2 className="mb-4 text-lg font-semibold">More to read</h2>}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
