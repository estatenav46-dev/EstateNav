'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { shortlistStore } from '@/lib/ui/stores';
import { LogOut, Heart, Calendar, ChevronDown, LogIn } from 'lucide-react';

export function UserMenu() {
  const { user, loading, logout, setAuthModalOpen } = useAuth();
  const shortlist = shortlistStore.useValue();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => setAuthModalOpen(true)}
        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-surface-2"
      >
        <LogIn className="w-3.5 h-3.5 text-accent-ink" />
        <span>Sign In</span>
      </button>
    );
  }

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface pl-1.5 pr-3 transition-colors hover:border-ink"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User profile'}
            className="w-7 h-7 rounded-full object-cover border border-line"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent text-on-accent text-xs font-bold flex items-center justify-center">
            {initial}
          </div>
        )}
        <span className="text-xs font-semibold text-ink max-w-[100px] truncate hidden md:inline-block">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="pop-in absolute right-0 top-full z-50 mt-2 w-64 rounded-[20px] border border-line bg-surface p-2 shadow-[0_28px_70px_-24px_rgb(var(--shadow)/0.55)]">
          <div className="px-3 py-2 border-b border-line mb-1">
            <p className="text-xs font-bold text-ink truncate">{user.displayName || 'EstateNav User'}</p>
            <p className="text-2xs text-ink-muted font-mono truncate">{user.email}</p>
          </div>

          <Link
            href="/shortlist"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center justify-between rounded-xl px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            <span className="flex items-center gap-2.5">
              <Heart className="h-4 w-4 text-accent-ink" />
              <span>My wishlist</span>
            </span>
            {shortlist.length > 0 && (
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent-ink">
                {shortlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/contact?intent=site-visit"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 text-sm text-ink transition-colors hover:bg-surface-2"
          >
            <Calendar className="h-4 w-4 text-accent-ink" />
            <span>Book a site visit</span>
          </Link>

          <div className="border-t border-line my-1" />

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

