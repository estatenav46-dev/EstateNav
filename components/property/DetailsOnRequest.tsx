'use client';

import { FileText, MessageCircle } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import { projectEnquiryLink } from '@/lib/contact';
import { enquiryFromProperty } from '@/lib/enquiry';
import { openLeadSheet } from '@/lib/ui/stores';

// A slim strip at the end of the details: what the advisor can still send, with two ways to ask.
// The enquiry form itself opens in the side sheet (PropertyActions), not inline.
export function DetailsOnRequest({ property, settings }: { property: Property; settings: SiteSettings }) {
  const whatsapp = projectEnquiryLink(enquiryFromProperty(property), settings.agent.name, settings.contact.whatsapp);
  const items = [
    'Latest price sheet',
    property.media.floorPlans.length === 0 ? 'Floor plans' : null,
    'Units available',
    'Cost sheet & EMI',
    'Approval documents',
    property.nearby.length < 3 ? 'Nearby schools & offices' : null,
  ].filter((i): i is string => Boolean(i));

  return (
    <section id="details" aria-labelledby="details-title" className="scroll-mt-32 overflow-hidden rounded-card bg-forest text-forest-on">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-brass">From the advisor</p>
          <h2 id="details-title" className="mt-2 font-serif text-[1.5rem] leading-tight text-forest-on sm:text-[1.75rem]">
            Get the full details for {property.title}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {items.map((item) => (
              <li key={item} className="rounded-full bg-forest-on/10 px-2.5 py-1 text-xs font-medium ring-1 ring-forest-on/15">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-forest-on/70">{settings.agent.name.split(' ')[0]} replies on WhatsApp, usually the same day.</p>
        </div>
        <div className="grid shrink-0 gap-2 sm:w-60">
          <button
            type="button"
            onClick={() => openLeadSheet('price-sheet', `Please share the full details for ${property.title}: price sheet, floor plans, availability, approvals and costs.`)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius)] bg-forest-on px-4 text-sm font-semibold text-forest transition-transform hover:-translate-y-px active:scale-[0.97]"
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Send me the details
          </button>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-track="cta"
            data-track-kind="whatsapp-details"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold text-forest-on ring-1 ring-forest-on/30 transition-[background-color,transform] hover:-translate-y-px hover:bg-forest-on/10 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
