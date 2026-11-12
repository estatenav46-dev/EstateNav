'use client';

import { CalendarDays, FileText, MessageCircle } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import dynamic from 'next/dynamic';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { priceLabel, rateLabel } from '@/lib/property';
import { propertyWhatsApp } from '@/lib/contact';
import { absoluteUrl } from '@/lib/site';
import { useMediaQuery } from '@/lib/ui/hooks';
import { leadSheetStore, openLeadSheet } from '@/lib/ui/stores';

const LeadForm = dynamic(() => import('@/components/forms/LeadForm').then((m) => m.LeadForm), { ssr: false, loading: () => <div className="skeleton h-72 rounded-xl" /> });

type Props = { property: Property; settings: SiteSettings; advisorCard?: React.ReactNode };

// Desktop: sticky price-and-actions column. Phones: a sticky bottom bar (the dock steps aside).
export function PropertyActions({ property, settings, advisorCard }: Props) {
  const lead = leadSheetStore.useValue();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  const whatsapp = propertyWhatsApp({ title: property.title, url: absoluteUrl(`/properties/${property.slug}`) }, settings.contact.whatsapp);
  const rate = rateLabel(property);

  return (
    <>
      <div className="hidden lg:block">
        <div className="sticky top-[132px] space-y-4">
          <div className="panel p-5">
            <p className="sheet-label">{property.transaction === 'rent' ? 'Monthly rent' : 'Price'}</p>
            <p className="tabular mt-1 font-serif text-3xl leading-tight">{priceLabel(property)}</p>
            {rate && <p className="mt-1 text-sm text-ink-muted">{rate}{property.transaction === 'sale' ? ' from' : ''}</p>}
            <p className="mt-1 text-2xs text-ink-muted">Developer guide price · zero buyer brokerage</p>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-primary">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Schedule guided VIP site visit
              </button>
              <button type="button" onClick={() => openLeadSheet('price-sheet')} className="btn-secondary">
                <FileText className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Unlock direct developer pricing sheet
              </button>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <MessageCircle className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Connect with dedicated area advisor
              </a>
            </div>
          </div>
          {advisorCard}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-line bg-surface/95 px-3 pt-2 backdrop-blur-md safe-bottom lg:hidden">
        <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-primary px-3">
          VIP site visit
        </button>
        <button type="button" onClick={() => openLeadSheet('price-sheet')} className="btn-secondary px-3">
          Pricing sheet
        </button>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Connect with dedicated area advisor on WhatsApp">
          <MessageCircle className="h-5 w-5 text-accent-ink" aria-hidden="true" />
        </a>
      </div>

      <Sheet
        key={desktop ? 'side' : 'bottom'}
        open={lead.open}
        onOpenChange={(open) => leadSheetStore.set((s) => ({ ...s, open }))}
        direction={desktop ? 'right' : 'bottom'}
        title={lead.intent === 'site-visit' ? 'Schedule a guided VIP site visit' : 'Unlock the direct developer pricing sheet'}
        description={property.title}
        className="lg:max-w-[480px]"
      >
        <LeadForm
          key={`${lead.intent}-${lead.message}`}
          consent={consent}
          source="detail"
          property={{ slug: property.slug, title: property.title }}
          intent={lead.intent}
          intentChoices={['site-visit', 'price-sheet', 'loan-help']}
          whatsapp={settings.contact.whatsapp}
          advisorName={settings.agent.name}
          defaultMessage={lead.message}
        />
      </Sheet>
    </>
  );
}
