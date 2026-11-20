'use client';

import { FileText, MessageCircle } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import { propertyWhatsApp } from '@/lib/contact';
import { absoluteUrl } from '@/lib/site';
import { openLeadSheet } from '@/lib/ui/stores';

// A slim strip at the end of the details: what the advisor can still send, with two ways to ask.
// The enquiry form itself opens in the side sheet (PropertyActions), not inline.
export function DetailsOnRequest({ property, settings }: { property: Property; settings: SiteSettings }) {
  const whatsapp = propertyWhatsApp({ title: property.title, url: absoluteUrl(`/properties/${property.slug}`) }, settings.contact.whatsapp);
  const items = [
    'Latest price sheet',
    property.media.floorPlans.length === 0 ? 'Floor plans' : null,
    'Units available',
    'Cost sheet & EMI',
    'Approval documents',
    property.nearby.length < 3 ? 'Nearby schools & offices' : null,
  ].filter((i): i is string => Boolean(i));

  return (
    <section id="details" aria-labelledby="details-title" className="scroll-mt-32 overflow-hidden rounded-2xl bg-forest text-forest-on">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-on/70">From the advisor</p>
          <h2 id="details-title" className="mt-1 text-base font-semibold leading-snug text-forest-on">
            Get the full details for {property.title}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-1">
            {items.map((item) => (
              <li key={item} className="rounded-full bg-forest-on/10 px-2 py-0.5 text-xs font-medium ring-1 ring-forest-on/15">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-forest-on/70">{settings.agent.name.split(' ')[0]} replies on WhatsApp, usually the same day.</p>
        </div>
        <div className="grid shrink-0 gap-2 sm:w-56">
          <button
            type="button"
            onClick={() => openLeadSheet('price-sheet', `Please share the full details for ${property.title}: price sheet, floor plans, availability, approvals and costs.`)}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-forest-on px-4 text-sm font-semibold text-forest transition-transform active:scale-[0.97]"
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Send me the details
          </button>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta"
            data-track-kind="whatsapp-details"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-forest-on ring-1 ring-forest-on/30 hover:bg-forest-on/10"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
