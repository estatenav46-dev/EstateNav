import type { Metadata } from 'next';
import { ArrowUpRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';
import { AdvisorTitleBlock } from '@/components/home/AdvisorBlock';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getPublishedProperty, getSettings } from '@/lib/data/cached';
import type { EnquiryIntent } from '@/lib/data/types';
import { LIST_PROPERTY_MESSAGE, listPropertyWhatsApp, whatsAppLink } from '@/lib/contact';
import { realEstateAgentJsonLd } from '@/lib/seo';

export function generateMetadata({ searchParams }: { searchParams: { intent?: string } }): Metadata {
  if (searchParams.intent === 'list-property') {
    return {
      title: 'List your property in Bangalore',
      description: 'Selling or renting out a flat, plot or office in Bengaluru? Share the details with EstateNav and an advisor will call you back.',
      alternates: { canonical: '/contact?intent=list-property' },
    };
  }
  return {
    title: 'Contact the advisor',
    description: 'Schedule a site visit, get a developer price sheet or ask about home loans with EstateNav, a K-RERA registered advisory.',
    alternates: { canonical: '/contact' },
  };
}

const INTENTS: EnquiryIntent[] = ['site-visit', 'price-sheet', 'loan-help', 'general'];

export default async function ContactPage({ searchParams }: { searchParams: { property?: string; intent?: string } }) {
  const [settings, corridors, property] = await Promise.all([getSettings(), getCorridors(), searchParams.property ? getPublishedProperty(searchParams.property) : Promise.resolve(null)]);
  // "List your property" (top strip) arrives as ?intent=list-property: stored as a general enquiry
  // with a starter message, so the admin inbox needs no new enquiry type.
  const listing = searchParams.intent === 'list-property';
  const intent = listing ? 'general' : (INTENTS as string[]).includes(searchParams.intent ?? '') ? (searchParams.intent as EnquiryIntent) : 'site-visit';
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  const { agent, contact } = settings;

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <JsonLd data={realEstateAgentJsonLd(settings, corridors.map((c) => c.name))} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <section aria-labelledby="contact-title">
          <p className="text-sm font-medium text-ink-muted">{listing ? 'For owners' : 'Enquiry'}</p>
          <h1 id="contact-title" className="mt-1 font-serif text-[2rem] leading-[1.08] sm:text-[2.5rem]">
            {listing ? 'List your property' : <>Talk to <span className="text-accent-ink">the advisor</span></>}
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
            {listing
              ? 'Selling or renting out a flat, plot or office in Bengaluru? Share the basics below and your EstateNav advisor will call you to talk it through.'
              : `${property ? `About ${property.title}. ` : ''}Tell us what you need — a site visit, the developer’s price sheet or help with a home loan. Your advisor replies personally.`}
          </p>
          <div className="panel mt-6 p-5 shadow-[0_30px_60px_-48px_rgb(var(--shadow)/0.6)] sm:p-7">
            <LeadForm
              key={listing ? 'list' : 'enquiry'}
              consent={consent}
              source="contact"
              property={listing || !property ? null : { slug: property.slug, title: property.title }}
              intent={intent}
              intentChoices={listing ? undefined : INTENTS}
              whatsapp={contact.whatsapp}
              advisorName={agent.name}
              defaultMessage={listing ? LIST_PROPERTY_MESSAGE : ''}
              submitLabel={listing ? 'Send property details' : undefined}
            />
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Advisor details">
          <AdvisorTitleBlock settings={settings} />
          <div className="grid grid-cols-2 gap-2">
            <a href={listing ? listPropertyWhatsApp(contact.whatsapp) : whatsAppLink(`Hi EstateNav, I'd like some advice${property ? ` on ${property.title}` : ''}.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
            <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary">
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call
            </a>
          </div>
          {/* TODO(client): office address and map once confirmed. */}
          <div className="flex gap-4 border-t border-line pt-6">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm leading-relaxed text-ink-muted">Office address is shared when your visit is confirmed. Site visits meet at the project.</p>
          </div>
          <div className="border-t border-line pt-6 text-sm">
            <p className="sheet-label">K-RERA registration</p>
            <p className="mt-2 break-all font-mono text-xs">{agent.reraNumber}</p>
            <p className="mt-1 font-mono text-xs text-ink-muted">Valid {agent.validFrom} to {agent.validTo}</p>
            <a href={agent.verifyUrl} target="_blank" rel="noopener noreferrer" className="arrow-host mt-2 inline-flex min-h-[44px] items-center gap-1 font-semibold text-accent-ink">
              Verify on the Karnataka RERA portal <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
