import type { Metadata } from 'next';
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';
import { AdvisorTitleBlock } from '@/components/home/AdvisorBlock';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCorridors, getPublishedProperty, getSettings } from '@/lib/data/cached';
import type { EnquiryIntent } from '@/lib/data/types';
import { whatsAppLink } from '@/lib/contact';
import { realEstateAgentJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact the advisor',
  description: 'Schedule a site visit, get a developer price sheet or ask about home loans with SV Praveen, K-RERA registered agent.',
  alternates: { canonical: '/contact' },
};

const INTENTS: EnquiryIntent[] = ['site-visit', 'price-sheet', 'loan-help', 'general'];

export default async function ContactPage({ searchParams }: { searchParams: { property?: string; intent?: string } }) {
  const [settings, corridors, property] = await Promise.all([getSettings(), getCorridors(), searchParams.property ? getPublishedProperty(searchParams.property) : Promise.resolve(null)]);
  const intent = (INTENTS as string[]).includes(searchParams.intent ?? '') ? (searchParams.intent as EnquiryIntent) : 'site-visit';
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  const { agent, contact } = settings;

  return (
    <main id="main" className="mx-auto max-w-container px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <JsonLd data={realEstateAgentJsonLd(settings, corridors.map((c) => c.name))} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <section aria-labelledby="contact-title">
          <p className="sheet-label">Sheet C-01 · Enquiry</p>
          <h1 id="contact-title" className="mt-2 font-serif text-3xl sm:text-4xl">Talk to the advisor</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            {property ? `About ${property.title}. ` : ''}Tell us what you need — a site visit, the developer’s price sheet or help with a home loan. {agent.name} replies personally.
          </p>
          <div className="panel mt-6 p-5 sm:p-7">
            <LeadForm consent={consent} source="contact" property={property ? { slug: property.slug, title: property.title } : null} intent={intent} intentChoices={INTENTS} whatsapp={contact.whatsapp} advisorName={agent.name} />
          </div>
        </section>

        <aside className="space-y-6" aria-label="Advisor details">
          <AdvisorTitleBlock settings={settings} />
          <div className="grid grid-cols-2 gap-2">
            <a href={whatsAppLink(`Hi ${agent.name}, I'd like some advice${property ? ` on ${property.title}` : ''}.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
            <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary">
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call
            </a>
          </div>
          {/* TODO(client): office address and map once confirmed. */}
          <figure className="panel overflow-hidden">
            <svg viewBox="0 0 400 180" className="h-40 w-full bg-surface-2 text-line-strong" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M0 120C80 110 140 70 220 74S340 120 400 100M60 0v180M0 50h400M260 0l40 180" />
              <path d="M200 64c-10-14-16-22-16-30a16 16 0 0132 0c0 8-6 16-16 30z" stroke="rgb(var(--accent-ink))" strokeWidth="2" />
              <circle cx="200" cy="34" r="5" stroke="rgb(var(--accent-ink))" />
            </svg>
            <figcaption className="px-4 py-3 text-sm text-ink-muted">Office address is shared when your visit is confirmed. Site visits meet at the project.</figcaption>
          </figure>
          <div className="panel p-4 text-sm">
            <p className="font-medium">K-RERA registration</p>
            <p className="mt-1 break-all font-mono text-2xs">{agent.reraNumber}</p>
            <p className="mt-1 font-mono text-2xs text-ink-muted">Valid {agent.validFrom} to {agent.validTo}</p>
            <a href={agent.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-[40px] items-center gap-1 text-accent-ink hover:underline">
              Verify on the Karnataka RERA portal <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
