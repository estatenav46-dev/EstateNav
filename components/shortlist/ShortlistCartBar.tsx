'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { shortlistStore } from '@/lib/ui/stores';
import { ADVISOR_NAME, ADVISOR_WHATSAPP } from '@/lib/contact';

export function ShortlistCartBar() {
  const pathname = usePathname() ?? '';
  const shortlist = shortlistStore.useValue();

  // Hide on admin routes or if already on the shortlist page
  if (pathname.startsWith('/admin') || pathname === '/shortlist' || shortlist.length === 0) {
    return null;
  }

  const count = shortlist.length;
  const whatsappText = encodeURIComponent(
    `Hi ${ADVISOR_NAME}, I have shortlisted ${count} ${
      count === 1 ? 'property' : 'properties'
    } on EstateNav and would like to receive the pricing sheets and schedule a site visit.`
  );
  const whatsappUrl = `https://wa.me/${ADVISOR_WHATSAPP.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  return (
    <aside
      aria-label="Shortlist summary"
      className="fixed inset-x-3 bottom-[76px] z-30 mx-auto max-w-lg transition-transform duration-base md:bottom-6 md:right-6 md:left-auto md:w-auto"
    >
      <div className="flex items-center justify-between gap-3 rounded-full border border-accent/40 bg-surface/95 p-2 pl-4 shadow-xl backdrop-blur-md ring-1 ring-accent/20">
        <Link href="/shortlist" className="flex items-center gap-2 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-on shadow-sm">
            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold text-ink group-hover:text-accent-ink sm:text-sm">
            <strong className="font-bold text-accent-ink">{count}</strong> {count === 1 ? 'home' : 'homes'} shortlisted
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-xs font-semibold text-accent-on transition-all hover:bg-accent-hover active:scale-95"
            aria-label="Send shortlisted properties to advisor on WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Send to advisor</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  );
}

