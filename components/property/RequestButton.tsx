'use client';

import { openLeadSheet } from '@/lib/ui/stores';

export function RequestButton({ intent, message, children, className = 'btn-secondary' }: { intent: 'site-visit' | 'price-sheet'; message?: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={() => openLeadSheet(intent, message)} className={className}>
      {children}
    </button>
  );
}
