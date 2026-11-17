'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { consentStore, flush, loadVisitorState, track } from '@/lib/ui/visitor';

// Loads consent and preferences, records page views (only with consent) and sends any queued
// signals when the tab is hidden. Elements can opt in with data-track="region" data-track-zone="east".
export function VisitorTracker() {
  const pathname = usePathname();
  const consent = consentStore.useValue();

  useEffect(() => {
    loadVisitorState();
    // Remember campaign tags from the landing URL for the welcome form.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('utm_source') && !sessionStorage.getItem('estatenav:utm')) {
        sessionStorage.setItem('estatenav:utm', JSON.stringify({ source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') }));
      }
    } catch {
      /* ignore */
    }
    const onHide = () => document.visibilityState === 'hidden' && flush(true);
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      const data: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith('track') && key !== 'track' && value) data[key.slice(5).toLowerCase()] = value;
      }
      track(el.dataset.track as 'region' | 'cta', data);
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', () => flush(true));
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    if (consent?.analytics && !pathname?.startsWith('/admin')) track('page_view');
  }, [pathname, consent?.analytics]);

  return null;
}
