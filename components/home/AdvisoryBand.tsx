'use client';

import { useState } from 'react';
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/types';
import { LazyLeadForm as LeadForm } from '@/components/forms/LazyLeadForm';
import { whatsAppLink } from '@/lib/contact';
import { Reveal, Words } from '@/components/Reveal';

const PROMISES = [
  { title: 'Zero buyer brokerage', body: 'You pay the developer’s price. Our fee comes from the developer, never from you.' },
  { title: 'The developer’s own price list', body: 'Official allotment decks and price sheets, not a reseller’s markup.' },
  { title: 'K-RERA details you can check', body: 'Registration numbers and approvals shown, with links to verify them yourself.' },
  { title: 'Site visits around your week', body: 'Guided visits planned for you, weekdays or weekends.' },
];

// Dark advisory band: what working with EstateNav means, and the registered advisor in person.
export function AdvisoryBand({ settings }: { settings: SiteSettings }) {
  const { agent, contact } = settings;
  const [callback, setCallback] = useState(false);
  const initials = agent.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2);
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };

  return (
    <section aria-labelledby="advisory-title" data-scrub="enter" data-scrub-span="0.85" className="mt-3 px-2 pb-3 sm:mt-4 sm:px-4 sm:pb-4">
      <div className="sc-inset relative isolate overflow-hidden rounded-[28px] bg-forest text-forest-on sm:rounded-[40px]">
      <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-brass/20 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgb(var(--on-forest))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--on-forest))_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="mx-auto grid max-w-container gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <Reveal variant="words">
            <p className="rw-fade flex items-center gap-3 text-sm font-medium text-forest-on/70">
              <span className="font-mono text-xs text-brass">05</span>
              <span aria-hidden="true" className="rw-line h-px w-10 bg-brass/70" />
              Advisory
            </p>
            <h2 id="advisory-title" className="mt-3 max-w-xl font-serif text-[2.15rem] leading-[1.04] tracking-[-0.035em] text-forest-on sm:text-[3rem]">
              <Words>
                <>One registered advisor, from <span className="text-brass">first call to keys.</span></>
              </Words>
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {PROMISES.map((p, i) => (
              <Reveal as="li" key={p.title} index={i} className="border-t border-forest-on/15 py-5">
                <span className="font-mono text-xs text-brass">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-forest-on">{p.title}</h3>
                <p className="mt-1 text-sm text-forest-on/70">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal variant="zoom" className="lg:pt-10">
          <div className="rounded-[28px] bg-forest-on/[0.06] p-6 ring-1 ring-forest-on/15 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest-on/10 font-serif text-xl ring-2 ring-brass ring-offset-4 ring-offset-forest">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-xl font-semibold">{agent.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-forest-on/70">
                  <ShieldCheck className="h-4 w-4 text-brass" aria-hidden="true" /> K-RERA registered agent
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-y border-forest-on/15 py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-forest-on/60">K-RERA no.</dt>
                <dd className="break-all text-right font-mono text-xs">{agent.reraNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-on/60">Valid</dt>
                <dd className="font-mono text-xs">{agent.validFrom} to {agent.validTo}</dd>
              </div>
            </dl>
            <div className="mt-6 grid gap-2">
              <a
                href={whatsAppLink(`Hi ${agent.name}, I'm browsing EstateNav and would like advice on Bengaluru properties.`, contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                data-ripple
                data-track="cta"
                data-track-kind="whatsapp"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-forest-on px-5 text-sm font-semibold text-forest transition-[transform,box-shadow] duration-base hover:shadow-[0_14px_30px_-12px_rgb(0_0_0/0.5)] active:scale-[0.97]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Connect with dedicated area advisor
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} data-ripple className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-forest-on/25 transition-colors hover:bg-forest-on/10">
                  <Phone className="h-4 w-4 text-brass" aria-hidden="true" /> Call
                </a>
                <button type="button" onClick={() => setCallback((v) => !v)} aria-expanded={callback} data-ripple className="inline-flex min-h-[48px] items-center justify-center rounded-full px-4 text-sm font-semibold ring-1 ring-forest-on/25 transition-colors hover:bg-forest-on/10">
                  {callback ? 'Hide form' : 'Request callback'}
                </button>
              </div>
            </div>
            {callback && (
              <div className="step-in mt-4 rounded-2xl bg-surface p-4 text-ink">
                <LeadForm consent={consent} source="home" intent="callback" variant="compact" whatsapp={contact.whatsapp} advisorName={agent.name} submitLabel="Request callback" />
              </div>
            )}
          </div>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
