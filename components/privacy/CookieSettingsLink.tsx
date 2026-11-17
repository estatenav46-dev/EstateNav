'use client';

import { cookieSettingsStore } from '@/lib/ui/visitor';

export function CookieSettingsLink({ className = 'inline-flex min-h-[40px] items-center hover:text-ink' }: { className?: string }) {
  return (
    <button type="button" onClick={() => cookieSettingsStore.set(true)} className={className}>
      Cookie settings
    </button>
  );
}
