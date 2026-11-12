'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Calculator, Compass, ConciergeBell, Heart, Home, MessageCircle, Phone } from 'lucide-react';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import type { ConsentInfo } from '@/components/forms/LeadForm';
import { useScrollDirectionVisible } from '@/lib/ui/hooks';
import { shortlistStore } from '@/lib/ui/stores';
import { whatsAppLink } from '@/lib/contact';
import type { SiteSettings } from '@/lib/data/types';
import { ShortlistCartBar } from '@/components/shortlist/ShortlistCartBar';

const LeadForm = dynamic(() => import('@/components/forms/LeadForm').then((m) => m.LeadForm), {
  ssr: false,
  loading: () => <div className="skeleton h-48 rounded-xl" />,
});
const CostStudio = dynamic(() => import('@/components/property/CostStudio'), {
  ssr: false,
  loading: () => <div className="skeleton h-80 rounded-xl" />,
});

type Props = { settings: SiteSettings; consent: ConsentInfo };

const tab =
  'flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-ink-muted active:scale-95 transition-transform duration-fast';

// Phone-only bottom dock: Home · Explore · Calculator · Shortlist · Concierge
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
      {/* Floating Shortlist Cart Bar above dock */}
      <ShortlistCartBar />

      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md safe-bottom md:hidden"
        style={{ transform: visible ? 'none' : 'translateY(110%)', transition: 'transform var(--dur-base) var(--ease)' }}
      >
        <div className="flex px-1">
          <Link href="/" className={`${tab} ${pathname === '/' ? 'text-accent-ink font-semibold' : ''}`}>
            <Home className="h-5 w-5" aria-hidden="true" />
            Home
          </Link>

          <Link href="/properties" className={`${tab} ${pathname === '/properties' ? 'text-accent-ink font-semibold' : ''}`}>
            <Compass className="h-5 w-5" aria-hidden="true" />
            Explore
          </Link>

          <button type="button" onClick={() => setSheet('calculator')} className={`${tab} ${sheet === 'calculator' ? 'text-accent-ink font-semibold' : ''}`}>
            <Calculator className="h-5 w-5" aria-hidden="true" />
            Calculator
          </button>

          <Link href="/shortlist" className={`${tab} ${pathname === '/shortlist' ? 'text-accent-ink font-semibold' : ''}`}>
            <span className="relative">
              <Heart className="h-5 w-5" aria-hidden="true" />
              {shortlist.length > 0 && (
                <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-accent-on shadow-sm">
                  {shortlist.length}
                </span>
              )}
            </span>
            Shortlist
          </Link>

          <button type="button" onClick={() => setSheet('advisor')} className={`${tab} ${sheet === 'advisor' ? 'text-accent-ink font-semibold' : ''}`}>
            <ConciergeBell className="h-5 w-5" aria-hidden="true" />
            Concierge
          </button>
        </div>
      </nav>

      {/* Advisor Bottom Sheet */}
      <Sheet
        open={sheet === 'advisor'}
        onOpenChange={(open) => setSheet(open ? 'advisor' : null)}
        title={`Talk to ${agent.name}`}
        description="K-RERA registered agent · direct-developer pricing"
      >
        <div className="space-y-4 pb-6">
          <div className="grid gap-2">
            <a
              href={whatsAppLink(`Hi ${agent.name}, I'm browsing EstateNav and would like some advice.`, contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Connect with dedicated area advisor
            </a>
            <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary">
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call
            </a>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Karnataka Cost & EMI Studio</p>
                <p className="text-2xs text-ink-muted">Calculate stamp duty, registration & loan EMI</p>
              </div>
              <button
                type="button"
                onClick={() => setSheet('calculator')}
                className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1.5 text-xs font-medium text-accent-ink shadow-xs border border-line hover:border-accent"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>Open</span>
              </button>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-sm font-medium">Request a callback</p>
            <LeadForm
              consent={consent}
              source="dock"
              intent="callback"
              variant="compact"
              whatsapp={contact.whatsapp}
              advisorName={agent.name}
              submitLabel="Request callback"
            />
          </div>
        </div>
      </Sheet>

      {/* Calculator Bottom Sheet */}
      <Sheet
        open={sheet === 'calculator'}
        onOpenChange={(open) => setSheet(open ? 'calculator' : null)}
        title="Cost studio"
        description="EMI, Karnataka stamp duty, registration and Section 24(b)"
      >
        {sheet === 'calculator' && (
          <CostStudio
            costs={settings.costs}
            disclaimer={settings.disclaimers.costs}
            initialValue={12_500_000}
            idPrefix="dock-cost"
            stacked
          />
        )}
      </Sheet>
    </>
  );
}
