import { Building2, Calculator, Layers, Lock, MapPinned, MessageCircle, Ruler, ShieldCheck } from 'lucide-react';
import type { Property, SiteSettings } from '@/lib/data/types';
import { LazyLeadForm } from '@/components/forms/LazyLeadForm';
import { propertyWhatsApp } from '@/lib/contact';
import { absoluteUrl } from '@/lib/site';
import { Reveal } from '@/components/Reveal';

// Beyond the overview, project details are shared by the advisor: the visitor asks with a
// short form or on WhatsApp.
export function DetailsOnRequest({ property, settings }: { property: Property; settings: SiteSettings }) {
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  const whatsapp = propertyWhatsApp({ title: property.title, url: absoluteUrl(`/properties/${property.slug}`) }, settings.contact.whatsapp);
  const units = property.configurations.length;
  const plans = property.media.floorPlans.length;
  const items = [
    { icon: Layers, label: 'Unit types and prices', hint: units ? `${units} ${units === 1 ? 'configuration' : 'configurations'}` : 'Current price sheet' },
    { icon: Ruler, label: 'Floor plans', hint: plans ? `${plans} ${plans === 1 ? 'plan' : 'plans'}` : 'Unit layouts' },
    { icon: ShieldCheck, label: 'Approvals and title', hint: 'Khata, plan sanction, bank approvals' },
    { icon: MapPinned, label: 'Location and commute', hint: 'Map, nearby schools, office drive times' },
    { icon: Calculator, label: 'Cost sheet and EMI', hint: 'Stamp duty, registration, loan EMI' },
    { icon: Building2, label: 'Developer track record', hint: 'Delivered projects and timelines' },
  ];

  return (
    <section id="details" aria-labelledby="details-title" className="scroll-mt-[96px] border-t border-line py-10">
      <Reveal variant="zoom" className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative isolate overflow-hidden bg-forest p-6 text-forest-on sm:p-8">
            <div aria-hidden="true" className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-brass/25 blur-3xl" />
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest-on/70">
              <span aria-hidden="true" className="h-px w-8 bg-brass" /> Full project details
            </p>
            <h2 id="details-title" className="mt-3 font-serif text-[1.7rem] leading-[1.08] tracking-[-0.02em] text-forest-on sm:text-[2rem]">
              Everything else, <span className="text-brass">straight from the advisor.</span>
            </h2>
            <p className="mt-2 text-sm text-forest-on/75">
              Prices and availability change often, so {settings.agent.name.split(' ')[0]} shares the latest documents for {property.title} directly.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {items.map(({ icon: Icon, label, hint }) => (
                <li key={label} className="flex items-start gap-3 rounded-2xl bg-forest-on/[0.07] p-3 ring-1 ring-forest-on/10">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-on/10 text-brass">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {label} <Lock className="h-3 w-3 text-forest-on/50" aria-label="On request" />
                    </span>
                    <span className="block text-xs text-forest-on/65">{hint}</span>
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cta"
              data-track-kind="whatsapp-details"
              className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-forest-on px-6 text-sm font-semibold text-forest transition-[transform,box-shadow] duration-base hover:shadow-[0_14px_30px_-12px_rgb(0_0_0/0.5)] active:scale-[0.97] sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
            </a>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold">Or leave your number</p>
            <p className="mt-0.5 text-sm text-ink-muted">We send the full details on WhatsApp, usually the same day.</p>
            <div className="mt-5">
              <LazyLeadForm
                consent={consent}
                source="detail"
                intent="price-sheet"
                property={{ slug: property.slug, title: property.title }}
                variant="compact"
                whatsapp={settings.contact.whatsapp}
                advisorName={settings.agent.name}
                submitLabel="Send me the full details"
                defaultMessage={`Please share the full details for ${property.title}: unit types and prices, floor plans, approvals, location and costs.`}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
