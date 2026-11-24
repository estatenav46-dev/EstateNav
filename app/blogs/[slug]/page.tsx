import type { Metadata } from 'next';
import { publicAuthor } from '@/lib/blog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock, MessageCircle, Share2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { ArticleBody, articleHeadings } from '@/components/blog/ArticleBody';
import { BlogCard } from '@/components/blog/BlogCard';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { getListingCards, getPublishedBlogs, getSettings } from '@/lib/data/cached';
import { blogDate, suggestedPosts } from '@/lib/blog';
import { whatsAppLink } from '@/lib/contact';
import { breadcrumbJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedBlogs();
  return posts.map((p) => ({ slug: p.slug }));
}

async function findPost(slug: string) {
  const posts = await getPublishedBlogs();
  return { post: posts.find((p) => p.slug === slug) ?? null, posts };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { post } = await findPost(params.slug);
  if (!post) return { title: 'Article not found' };
  const title = post.seo.title || post.title;
  const description = post.seo.description || post.excerpt;
  return {
    title: { absolute: `${title} | EstateNav` },
    description,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [publicAuthor(post.author).name],
      images: post.cover ? [{ url: post.cover.url, alt: post.cover.alt }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { post, posts } = await findPost(params.slug);
  if (!post) notFound();
  const [properties, settings] = await Promise.all([getListingCards(), getSettings()]);
  const related = post.relatedPropertyIds.map((id) => properties.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const suggestions = suggestedPosts(post, posts, 4);
  const more = posts.filter((p) => p.id !== post.id && !suggestions.some((s) => s.id === p.id)).slice(0, 3);
  const headings = articleHeadings(post.body);
  const url = absoluteUrl(`/blogs/${post.slug}`);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
    { name: post.title, path: `/blogs/${post.slug}` },
  ];

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.cover ? [post.cover.url] : undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: { '@type': publicAuthor(post.author).name === 'EstateNav Advisory' ? 'Organization' : 'Person', name: publicAuthor(post.author).name },
          publisher: { '@type': 'Organization', name: 'EstateNav', logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') } },
          mainEntityOfPage: url,
          keywords: post.tags.join(', ') || undefined,
        }}
      />
      <Breadcrumbs items={crumbs} />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <article className="min-w-0">
          <header className="max-w-3xl">
            <Link href={`/blogs?category=${encodeURIComponent(post.category)}`} className="inline-flex min-h-[32px] items-center rounded-full bg-accent-soft px-3 text-xs font-semibold text-accent-ink">
              {post.category}
            </Link>
            <h1 className="mt-4 font-serif text-[2.2rem] leading-[1.08] sm:text-[3rem]">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink-muted sm:text-xl">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-4 text-sm text-ink-muted">
              <span className="font-semibold text-ink">
                {publicAuthor(post.author).name}
                {publicAuthor(post.author).role && <span className="font-normal text-ink-muted"> · {publicAuthor(post.author).role}</span>}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {blogDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.readMinutes} min read
              </span>
            </div>
          </header>

          {post.cover && (
            <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-card bg-surface-2">
              <Image src={post.cover.url} alt={post.cover.alt} fill priority sizes="(min-width: 1024px) 60vw, 100vw" quality={75} className="object-cover" />
            </div>
          )}

          <ArticleBody source={post.body} className="mt-10 max-w-[68ch]" />

          <div className="mt-10 flex max-w-[68ch] flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted">
                  #{t}
                </li>
              ))}
            </ul>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[40px] text-sm">
              <Share2 className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Share on WhatsApp
            </a>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-14">
              <h2 id="related-title" className="font-serif text-[1.75rem] leading-tight">
                Projects in this article
              </h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((p) => (
                  <li key={p.id}>
                    <ExploreCard property={p} sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="More to read">
          {headings.length >= 2 && (
            <nav aria-label="On this page" className="hidden border-l border-line pl-5 lg:block">
              <p className="sheet-label">On this page</p>
              <ol className="mt-3 space-y-2 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink-muted transition-colors hover:text-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {suggestions.length > 0 && (
            <section className="border-t border-line pt-5">
              <p className="sheet-label">Suggested reads</p>
              <ul className="mt-1 divide-y divide-line">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <BlogCard post={p} variant="compact" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-card bg-forest p-6 text-forest-on">
            <p className="font-serif text-xl leading-tight">Questions about a project?</p>
            <p className="mt-2 text-sm leading-relaxed text-forest-on/75">Our advisor answers on WhatsApp, usually the same day. Zero buyer brokerage.</p>
            <div className="mt-4 grid gap-2">
              <a href={whatsAppLink(`Hi EstateNav, I read "${post.title}" on EstateNav and have a question.`, settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[var(--radius)] bg-forest-on px-4 text-sm font-semibold text-forest transition-transform hover:-translate-y-px active:scale-[0.97]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
              </a>
              <Link href="/properties" className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold text-forest-on ring-1 ring-forest-on/30 transition-[background-color,transform] hover:-translate-y-px hover:bg-forest-on/10 active:scale-[0.97]">
                Explore projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mt-20 border-t border-line pt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 id="more-title" className="font-serif text-[2rem] leading-tight sm:text-[2.5rem]">
              Keep reading
            </h2>
            <Link href="/blogs" className="arrow-host inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-accent-ink">
              All articles <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <li key={p.id}>
                <BlogCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
