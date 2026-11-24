'use client';

import { usePathname } from 'next/navigation';
import { whatsAppLink } from '@/lib/contact';
import { compareStore, shortlistStore, whatsAppTopicStore } from '@/lib/ui/stores';
import { WhatsAppGlyph } from './WhatsAppGlyph';

// Floating WhatsApp button, bottom right. On phones it sits above the bottom dock and moves up
// when the wishlist bar or compare tray is showing; on project pages phones already have
// "Enquire on WhatsApp" in their bottom bar, so it shows from the desktop layout up there.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function WhatsAppFloat({ agentName: _agentName }: { agentName: string }) {
  const pathname = usePathname() ?? '';
  const topic = whatsAppTopicStore.useValue();
  const shortlist = shortlistStore.useValue();
  const compare = compareStore.useValue();
  if (pathname.startsWith('/admin')) return null;
  const project = /^\/properties\/[^/]+$/.test(pathname);
  const trayUp = (shortlist.length > 0 && pathname !== '/shortlist') || compare.length > 0;
  const text = topic ?? `Hi EstateNav, I'm browsing the site and have a question.`;

  return (
    <a
      href={whatsAppLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="cta"
      data-track-kind="whatsapp-float"
      aria-label={topic ? 'Enquire about this project on WhatsApp' : 'Chat with EstateNav on WhatsApp'}
      className={`group fixed right-3 z-40 items-center gap-3 transition-[bottom,transform] duration-base hover:-translate-y-0.5 md:right-6 md:bottom-6 ${project ? 'hidden lg:flex' : 'flex'} ${
        trayUp ? 'bottom-[calc(env(safe-area-inset-bottom)+9.5rem)]' : 'bottom-[calc(env(safe-area-inset-bottom)+5rem)]'
      }`}
    >
      <span className="pointer-events-none hidden whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-bg opacity-0 shadow-lg transition-opacity duration-base group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {topic ? 'Enquire about this project' : 'Chat on WhatsApp'}
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_-10px_rgb(0_0_0/0.45)] ring-1 ring-black/5">
        <WhatsAppGlyph size={34} />
      </span>
    </a>
  );
}
