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

type Props = { property: Property; settings: SiteSettings; advisorCard?: React.ReactNode; /** 'dock': a compact button row (used under the media panel) instead of the sticky price column. */ layout?: 'sidebar' | 'dock' };

// Desktop: sticky price-and-actions column. Phones: a sticky bottom bar (the dock steps aside).
export function PropertyActions({ property, settings, advisorCard, layout = 'sidebar' }: Props) {
  const lead = leadSheetStore.useValue();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  const whatsapp = propertyWhatsApp({ title: property.title, url: absoluteUrl(`/properties/${property.slug}`) }, settings.contact.whatsapp);
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
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Ask the area advisor on WhatsApp">
            <MessageCircle className="h-5 w-5 text-accent-ink" aria-hidden="true" />
          </a>
        </div>
      ) : (
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-3">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_40px_-32px_rgb(var(--shadow)/0.5)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{property.transaction === 'rent' ? 'Monthly rent' : 'Price'}</p>
            <p className="tabular mt-0.5 font-serif text-[1.45rem] leading-tight">
              {priceLabel(property)}
              {!property.priceOnRequest && <sup className="ml-0.5 text-xs text-brass">*</sup>}
            </p>
            {(rate || property.priceNote) && (
              <p className="mt-0.5 text-xs text-ink-muted">{[rate, property.priceOnRequest ? null : property.priceNote].filter(Boolean).join(' · ')}</p>
            )}
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={() => openLeadSheet('site-visit')} className="btn-primary w-full">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a site visit
              </button>
              <button type="button" onClick={() => openLeadSheet('price-sheet')} className="btn-secondary w-full">
                <FileText className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Get the price sheet
              </button>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full text-sm">
                <MessageCircle className="h-4 w-4 text-accent-ink" aria-hidden="true" /> WhatsApp the advisor
              </a>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-ink-muted">
              {property.priceOnRequest ? 'Prices on request. ' : '*Approximate developer guide price; T&C apply. '}Zero buyer brokerage · {settings.agent.name}, K-RERA registered agent.
            </p>
          </div>
          {advisorCard}
        </div>
      </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-line bg-surface px-3 pt-2 safe-bottom lg:hidden">
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
