'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { shortlistStore } from '@/lib/ui/stores';
import { User, LogOut, Bookmark, Calendar, ChevronDown, LogIn } from 'lucide-react';

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
        className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-semibold transition-colors"
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
        className="inline-flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-surface-2 transition-colors border border-line/60"
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
        <div className="panel absolute right-0 top-full mt-2 w-60 p-2 shadow-xl border-line animate-fade-up z-50 bg-surface">
          <div className="px-3 py-2 border-b border-line mb-1">
            <p className="text-xs font-bold text-ink truncate">{user.displayName || 'EstateNav User'}</p>
            <p className="text-2xs text-ink-muted font-mono truncate">{user.email}</p>
          </div>

          <Link
            href="/shortlist"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs rounded-md hover:bg-surface-2 text-ink transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-accent-ink" />
              <span>Saved Shortlist</span>
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
            className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-surface-2 text-ink transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-accent-ink" />
            <span>Schedule Site Visit</span>
          </Link>

          <div className="border-t border-line my-1" />

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-danger/10 text-danger transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

