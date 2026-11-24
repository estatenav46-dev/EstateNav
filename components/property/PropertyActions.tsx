'use client';

import { CalendarDays, FileText } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import dynamic from 'next/dynamic';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { priceLabel, rateLabel } from '@/lib/property';
import { projectEnquiryLink } from '@/lib/contact';
import { enquiryFromProperty } from '@/lib/enquiry';
import { WhatsAppGlyph } from '@/components/contact/WhatsAppGlyph';
import { useMediaQuery } from '@/lib/ui/hooks';
import { leadSheetStore, openLeadSheet } from '@/lib/ui/stores';

const LeadForm = dynamic(() => import('@/components/forms/LeadForm').then((m) => m.LeadForm), { ssr: false, loading: () => <div className="skeleton h-72 rounded-xl" /> });

type Props = { property: Property; settings: SiteSettings; advisorCard?: React.ReactNode; /** 'dock': a compact button row (used under the media panel) instead of the sticky price column. */ layout?: 'sidebar' | 'dock' };

// Desktop: sticky price-and-actions column. Phones: a sticky bottom bar (the dock steps aside).
export function PropertyActions({ property, settings, advisorCard, layout = 'sidebar' }: Props) {
  const lead = leadSheetStore.useValue();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  // Opens WhatsApp to the official number with this project's name, builder and key facts filled in.
  const whatsapp = projectEnquiryLink(enquiryFromProperty(property), settings.agent.name, settings.contact.whatsapp);
  const waDisc = (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
      <WhatsAppGlyph size={18} />
    </span>
  );
  const rate = rateLabel(property);

  return (
    <>
      {layout === 'dock' ? (
        <div className="mt-3 hidden gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-primary">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a site visit
          </button>
          <button type="button" onClick={() => openLeadSheet('price-sheet')} className="btn-secondary">
            <FileText className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Price sheet
          </button>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-track="cta" data-track-kind="whatsapp-project" className="icon-btn" aria-label={`Enquire about ${property.title} on WhatsApp`}>
            <WhatsAppGlyph size={22} />
          </a>
        </div>
      ) : (
      <div className="hidden lg:block">
        <div className="sticky top-28 space-y-3">
          <div className="rounded-card border border-line bg-surface p-6 shadow-[0_30px_60px_-44px_rgb(var(--shadow)/0.6)]">
            <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{property.transaction === 'rent' ? 'Monthly rent' : 'Price'}</p>
            <p className="tabular mt-1.5 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
              {priceLabel(property)}
              {!property.priceOnRequest && <sup className="ml-0.5 text-sm text-brass">*</sup>}
            </p>
            {(rate || property.priceNote) && (
              <p className="mt-1 text-sm text-ink-muted">{[rate, property.priceOnRequest ? null : property.priceNote].filter(Boolean).join(' · ')}</p>
            )}
            <div className="mt-5 grid gap-2">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-track="cta" data-track-kind="whatsapp-project" className="btn-whatsapp min-h-[48px] w-full">
                {waDisc} Enquire now on WhatsApp
              </a>
              <p className="pb-1 text-center text-xs text-ink-muted">Opens WhatsApp with this project&apos;s details filled in.</p>
              <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-secondary min-h-[46px] w-full">
                <CalendarDays className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Book a site visit
              </button>
              <button type="button" onClick={() => openLeadSheet('price-sheet')} className="btn-ghost min-h-[42px] w-full text-sm">
                <FileText className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Get the price sheet
              </button>
            </div>
            <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
              {property.priceOnRequest ? 'Prices on request. ' : '*Approximate developer guide price; T&C apply. '}Zero buyer brokerage · K-RERA registered agent.
            </p>
          </div>
          {advisorCard}
        </div>
      </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-2 border-t border-line bg-surface/95 px-3 pt-2.5 shadow-[0_-12px_30px_-24px_rgb(var(--shadow)/0.5)] backdrop-blur-md safe-bottom lg:hidden">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-track="cta" data-track-kind="whatsapp-project" className="btn-whatsapp gap-2 px-3" aria-label={`Enquire about ${property.title} on WhatsApp`}>
          {waDisc} Enquire now
        </a>
        <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-secondary px-3">
          Site visit
        </button>
        <button type="button" onClick={() => openLeadSheet('price-sheet')} className="icon-btn" aria-label="Get the price sheet">
          <FileText className="h-5 w-5 text-accent-ink" aria-hidden="true" />
        </button>
      </div>

      <Sheet
        key={desktop ? 'side' : 'bottom'}
        open={lead.open}
        onOpenChange={(open) => leadSheetStore.set((s) => ({ ...s, open }))}
        direction={desktop ? 'right' : 'bottom'}
        title={lead.intent === 'site-visit' ? 'Book a site visit' : 'Get the price sheet'}
        description={property.title}
        compact={desktop}
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
