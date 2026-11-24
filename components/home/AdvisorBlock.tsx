'use client';

import { useState } from 'react';
import { MessageCircle, Phone, ShieldCheck, ChevronDown, UserCheck, UserRound } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/types';
import { LazyLeadForm as LeadForm } from '@/components/forms/LazyLeadForm';
import { whatsAppLink } from '@/lib/contact';
import { Reveal } from '@/components/Reveal';

// The advisor's credentials title block used across detail pages and contact page.
export function AdvisorTitleBlock({ settings, compact = false }: { settings: SiteSettings; compact?: boolean }) {
  const { agent, contact } = settings;
  const rows = [
    ['Advisor', 'Your EstateNav advisor'],
    ['Role', agent.title],
    ['Pricing', 'Direct-developer, zero buyer brokerage'],
    ['Phone', contact.phoneDisplay],
    ['Email', contact.email],
  ];
  return (
    <div className={`grid overflow-hidden rounded-card border border-line bg-surface text-sm ${compact ? 'grid-cols-1' : 'grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]'}`}>
      <div style={{ gridRow: 'span 5' }} className={`${compact ? 'hidden' : 'flex'} flex-col items-center justify-center gap-2 border-r border-line bg-surface-2 p-3 text-ink-muted`}>
        <UserRound className="h-10 w-10" aria-hidden="true" />
        <span className="text-center font-mono text-[10px] uppercase tracking-wider">Photo</span>
      </div>
      {rows.slice(0, compact ? 4 : rows.length).map(([label, value], i) => (
        <div key={label} className={`grid grid-cols-[96px_minmax(0,1fr)] ${i ? 'border-t border-line' : ''}`}>
          <span className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</span>
          <span className={`px-3 py-2.5 ${label === 'Phone' || label === 'Email' ? 'break-all font-mono text-2xs leading-5' : ''}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// Slim quick-commerce advisor card for the homepage
export function AdvisorBlock({ settings }: { settings: SiteSettings }) {
  const { agent, contact } = settings;
  const [showCallback, setShowCallback] = useState(false);
  const consent = {
    text: settings.consentText,
    version: settings.consentVersion,
    privacyNote: settings.privacyNote,
  };

  return (
    <section className="mx-auto max-w-container px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8" aria-label="Talk to the advisor">
      <Reveal>
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm transition-[border-color,box-shadow] duration-base hover:border-line-strong">
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Advisor Identity & K-RERA credentials */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card border border-line bg-surface-2 text-ink">
                  <UserCheck className="h-7 w-7 text-accent-ink" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-ink">
                      Private Client Advisory Desk
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-mono text-ink">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent-ink" strokeWidth={1.75} />
                      <span>K-RERA Certified</span>
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif text-xl font-bold text-ink sm:text-2xl">Your EstateNav advisor</h2>
                  <p className="mt-0.5 font-mono text-xs text-ink-muted">
                    License: {agent.reraNumber} · Valid: {agent.validFrom} to {agent.validTo}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted sm:text-sm">
                    Direct developer price sheets · Zero buyer brokerage · Title verification &amp; Kaveri scrutiny
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp + Call + Callback Toggle */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href={whatsAppLink(
                    `Hi EstateNav, I am browsing the site and would like advice on Bengaluru properties.`,
                    contact.whatsapp
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary min-h-[44px] gap-2 rounded-xl px-5 text-xs font-semibold sm:text-sm active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>WhatsApp Advisor</span>
                </a>
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-secondary min-h-[44px] gap-2 rounded-xl px-4 text-xs font-semibold sm:text-sm active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4 text-accent-ink" strokeWidth={1.75} aria-hidden="true" />
                  <span>Call Desk</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowCallback(!showCallback)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 text-xs font-semibold text-ink transition-colors hover:border-line-strong active:scale-[0.98]"
                >
                  <span>Request Callback</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCallback ? 'rotate-180' : ''}`} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Collapsible Callback Lead Form */}
            {showCallback && (
              <div className="mt-6 border-t border-line pt-6">
                <h3 className="mb-3 font-serif text-sm font-bold text-ink">Schedule a Dedicated Advisory Callback</h3>
                <LeadForm
                  consent={consent}
                  source="home"
                  intent="callback"
                  variant="compact"
                  whatsapp={contact.whatsapp}
                  advisorName={agent.name}
                  submitLabel="Request callback"
                />
              </div>
            )}
          </div>

          {/* Bottom Security / Trust Assurance Strip */}
          <div className="grid grid-cols-1 divide-y divide-line border-t border-line bg-surface-2/60 px-5 py-3 sm:grid-cols-3 sm:divide-y-0 sm:divide-x text-center sm:text-left text-2xs text-ink-muted">
            <span className="py-1 sm:px-2">✓ Zero-Spam Privacy Protocol: Direct advisory only</span>
            <span className="py-1 sm:px-2">✓ Guided VIP Site Visits with direct builder allocation</span>
            <span className="py-1 sm:px-2">✓ Complete legal title vetting and Kaveri portal check</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
