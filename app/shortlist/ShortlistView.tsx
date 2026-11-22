'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Columns3, Heart, LogIn, MessageCircle, Share2 } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { whatsAppLink } from '@/lib/contact';
import { priceLabel } from '@/lib/property';
import { absoluteUrl } from '@/lib/site';
import { authPromptStore, compareSheetStore, compareStore, shortlistStore, MAX_COMPARE } from '@/lib/ui/stores';
import { addToWishlist } from '@/lib/ui/wishlist';
import { useAuth } from '@/lib/auth/context';

// The signed-in visitor's saved homes (users/{uid}.shortlist). Guests are asked to sign in.
// A shared link (?ids=…) shows someone else's shortlist with an option to keep it.
export function ShortlistView({ properties, whatsapp, advisorName }: { properties: Property[]; whatsapp: string; advisorName: string }) {
  const params = useSearchParams();
  const { user, loading, setAuthModalOpen } = useAuth();
  const mine = shortlistStore.useValue();
  const shared = params.get('ids')?.split(',').filter(Boolean) ?? null;
  const ids = shared ?? mine;
  const items = ids.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  const [copied, setCopied] = useState(false);
  const shareUrl = absoluteUrl(`/shortlist?ids=${items.map((p) => p.id).join(',')}`);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'My EstateNav wishlist', url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      /* the visitor dismissed the share sheet */
    }
  };

  const compare = () => {
    compareStore.set(items.slice(0, MAX_COMPARE).map((p) => ({ id: p.id, slug: p.slug, title: p.title })));
    compareSheetStore.set(true);
  };

  const message = `Hi ${advisorName}, here is my EstateNav shortlist:\n${items.map((p, i) => `${i + 1}. ${p.title} (${p.locality}, ${priceLabel(p)}) ${absoluteUrl(`/properties/${p.slug}`)}`).join('\n')}\nCan we discuss these?`;

  if (!shared && (loading || !user)) {
    return (
      <main id="main" className="mx-auto max-w-container px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Wishlist', path: '/shortlist' }]} />
        {loading ? (
          <div className="skeleton mt-8 h-64 rounded-card" />
        ) : (
          <div className="panel mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <Heart className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-2 font-serif text-[2rem] leading-tight sm:text-[2.4rem]">Sign in to see your shortlist</h1>
            <p className="max-w-md text-[0.95rem] leading-relaxed text-ink-muted">Saved homes are kept with your account, so they are there on your phone and laptop alike.</p>
            <button
              type="button"
              onClick={() => {
                authPromptStore.set({ reason: 'Sign in to see and keep your saved homes.' });
                setAuthModalOpen(true);
              }}
              className="btn-primary mt-2"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Wishlist', path: '/shortlist' }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
        <div>
          <h1 className="font-serif text-[2.4rem] leading-[1.05] sm:text-[3rem]">{shared ? 'A shared wishlist' : 'Your wishlist'}</h1>
          <p className="mt-2 text-ink-muted">{items.length} {items.length === 1 ? 'project' : 'projects'}{shared ? '' : ' saved to your account'}</p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shared && (
              <button type="button" onClick={() => addToWishlist(items.map((p) => p.id))} className="btn-secondary">
                <Heart className="h-4 w-4" aria-hidden="true" /> Save to my shortlist
              </button>
            )}
            <button type="button" onClick={compare} disabled={items.length < 2} className="btn-secondary disabled:opacity-50">
              <Columns3 className="h-4 w-4" aria-hidden="true" /> Compare{items.length > MAX_COMPARE ? ` first ${MAX_COMPARE}` : ''}
            </button>
            <button type="button" onClick={share} className="btn-secondary">
              <Share2 className="h-4 w-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Share wishlist'}
            </button>
            <a href={whatsAppLink(message, whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send to advisor on WhatsApp
            </a>
          </div>
        )}
      </div>

      {items.length ? (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <ExploreCard property={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
            <Heart className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-2 font-serif text-[2rem] leading-tight">Nothing shortlisted yet</p>
          <p className="max-w-md text-[0.95rem] leading-relaxed text-ink-muted">Tap the heart on any project to keep it here, then compare or send the list to the advisor in one go.</p>
          <Link href="/properties" className="btn-primary mt-2">Browse listings</Link>
        </div>
      )}
    </main>
  );
}
