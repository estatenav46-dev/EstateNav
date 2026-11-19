import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock, MessageCircle, Share2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { ArticleBody, articleHeadings } from '@/components/blog/ArticleBody';
import { BlogCard } from '@/components/blog/BlogCard';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { getPublishedBlogs, getPublishedProperties, getSettings } from '@/lib/data/cached';
import { blogDate, suggestedPosts } from '@/lib/blog';
import { whatsAppLink } from '@/lib/contact';
import { breadcrumbJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 300;

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
      authors: [post.author.name],
      images: post.cover ? [{ url: post.cover.url, alt: post.cover.alt }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { post, posts } = await findPost(params.slug);
  if (!post) notFound();
  const [properties, settings] = await Promise.all([getPublishedProperties(), getSettings()]);
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
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 lg:px-8">
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
          author: { '@type': 'Person', name: post.author.name },
          publisher: { '@type': 'Organization', name: 'EstateNav', logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') } },
          mainEntityOfPage: url,
          keywords: post.tags.join(', ') || undefined,
        }}
      />
      <Breadcrumbs items={crumbs} />

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <header className="max-w-3xl">
            <Link href={`/blogs?category=${encodeURIComponent(post.category)}`} className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
              {post.category}
            </Link>
            <h1 className="mt-3 font-serif text-[1.9rem] leading-[1.12] tracking-[-0.02em] sm:text-[2.3rem]">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="font-semibold text-ink">
                {post.author.name}
                {post.author.role && <span className="font-normal text-ink-muted"> · {post.author.role}</span>}
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
            <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-[22px] bg-surface-2">
              <Image src={post.cover.url} alt={post.cover.alt} fill priority sizes="(min-width: 1024px) 60vw, 100vw" quality={75} className="object-cover" />
            </div>
          )}

          <ArticleBody source={post.body} className="mt-8 max-w-[68ch]" />

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
            <section aria-labelledby="related-title" className="mt-12">
              <h2 id="related-title" className="text-lg font-semibold">
                Projects in this article
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <nav aria-label="On this page" className="hidden rounded-2xl border border-line bg-surface p-4 lg:block">
              <p className="sheet-label">On this page</p>
              <ol className="mt-2 space-y-1.5 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink-muted hover:text-accent-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {suggestions.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-3">
              <p className="sheet-label px-1.5 pt-1">Suggested reads</p>
              <ul className="mt-2 space-y-1">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <BlogCard post={p} variant="compact" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl bg-forest p-5 text-forest-on">
            <p className="text-sm font-semibold">Questions about a project?</p>
            <p className="mt-1 text-sm text-forest-on/75">{settings.agent.name} answers on WhatsApp, usually the same day. Zero buyer brokerage.</p>
            <div className="mt-4 grid gap-2">
              <a href={whatsAppLink(`Hi ${settings.agent.name}, I read "${post.title}" on EstateNav and have a question.`, settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-forest-on px-4 text-sm font-semibold text-forest">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
              </a>
              <Link href="/properties" className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-forest-on ring-1 ring-forest-on/30 hover:bg-forest-on/10">
                Explore projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mt-16 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 id="more-title" className="font-serif text-2xl">
              Keep reading
            </h2>
            <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline">
              All articles <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
