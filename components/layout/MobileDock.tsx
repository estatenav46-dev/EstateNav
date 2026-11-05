'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Calculator, Compass, Heart, Map, MessageCircle, Phone, UserRound } from 'lucide-react';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import type { ConsentInfo } from '@/components/forms/LeadForm';
import { useScrollDirectionVisible } from '@/lib/ui/hooks';
import { shortlistStore } from '@/lib/ui/stores';
import { whatsAppLink } from '@/lib/contact';
import type { SiteSettings } from '@/lib/data/types';

const LeadForm = dynamic(() => import('@/components/forms/LeadForm').then((m) => m.LeadForm), { ssr: false, loading: () => <div className="skeleton h-48 rounded-xl" /> });
const CostStudio = dynamic(() => import('@/components/property/CostStudio'), { ssr: false, loading: () => <div className="skeleton h-80 rounded-xl" /> });

type Props = { settings: SiteSettings; consent: ConsentInfo };

const tab = 'flex h-16 flex-1 flex-col items-center justify-center gap-1 text-2xs text-ink-muted active:scale-95 transition-transform duration-fast';

// Phone-only bottom dock. It tucks away while scrolling down, returns on scroll up, and
// steps aside on property detail pages where the sticky action bar takes its place.
export function MobileDock({ settings, consent }: Props) {
  const pathname = usePathname() ?? '';
  const visible = useScrollDirectionVisible();
  const shortlist = shortlistStore.useValue();
  const [sheet, setSheet] = useState<'advisor' | 'calculator' | null>(null);
  const hidden = pathname.startsWith('/admin') || /^\/properties\/[^/]+$/.test(pathname);
  if (hidden) return null;
  const { contact, agent } = settings;

  return (
    <>
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md safe-bottom md:hidden"
        style={{ transform: visible ? 'none' : 'translateY(110%)', transition: 'transform var(--dur-base) var(--ease)' }}
      >
        <div className="flex px-1">
          <Link href="/properties" className={`${tab} ${pathname === '/properties' ? 'text-accent-ink' : ''}`}>
            <Compass className="h-5 w-5" aria-hidden="true" />
            Explore
          </Link>
          <Link href="/#corridors" className={tab}>
            <Map className="h-5 w-5" aria-hidden="true" />
            Corridors
          </Link>
          <Link href="/shortlist" className={`${tab} ${pathname === '/shortlist' ? 'text-accent-ink' : ''}`}>
            <span className="relative">
              <Heart className="h-5 w-5" aria-hidden="true" />
              {shortlist.length > 0 && (
                <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-medium leading-[18px] text-accent-on">{shortlist.length}</span>
              )}
            </span>
            Shortlist
          </Link>
          <button type="button" onClick={() => setSheet('calculator')} className={tab}>
            <Calculator className="h-5 w-5" aria-hidden="true" />
            Calculator
          </button>
          <button type="button" onClick={() => setSheet('advisor')} className={tab}>
            <UserRound className="h-5 w-5" aria-hidden="true" />
            Advisor
          </button>
        </div>
      </nav>

      <Sheet open={sheet === 'advisor'} onOpenChange={(open) => setSheet(open ? 'advisor' : null)} title={`Talk to ${agent.name}`} description="K-RERA registered agent · direct-developer pricing">
        <div className="grid grid-cols-2 gap-2">
          <a href={whatsAppLink(`Hi ${agent.name}, I'm browsing EstateNav and would like some advice.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
          </a>
          <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary">
            <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call
          </a>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-3 text-sm font-medium">Request a callback</p>
          <LeadForm consent={consent} source="dock" intent="callback" variant="compact" whatsapp={contact.whatsapp} advisorName={agent.name} submitLabel="Request callback" />
        </div>
      </Sheet>

      <Sheet open={sheet === 'calculator'} onOpenChange={(open) => setSheet(open ? 'calculator' : null)} title="Cost studio" description="EMI, interest and Karnataka purchase costs" fullHeight>
        {sheet === 'calculator' && <CostStudio costs={settings.costs} disclaimer={settings.disclaimers.costs} initialValue={10_000_000} idPrefix="dock-cost" />}
      </Sheet>
    </>
  );
}
