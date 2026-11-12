'use client';

import { useState } from 'react';
import { MessageCircle, Phone, ShieldCheck, ChevronDown, UserCheck, UserRound } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/types';
import { LazyLeadForm as LeadForm } from '@/components/forms/LazyLeadForm';
import { whatsAppLink } from '@/lib/contact';

// The advisor's credentials title block used across detail pages and contact page.
export function AdvisorTitleBlock({ settings, compact = false }: { settings: SiteSettings; compact?: boolean }) {
  const { agent, contact } = settings;
  const rows = [
    ['Advisor', agent.name],
    ['Role', agent.title],
    ['K-RERA reg.', agent.reraNumber],
    ['Validity', `${agent.validFrom} to ${agent.validTo}`],
    ['Partner', settings.partnerDeveloper],
    ['Phone', contact.phoneDisplay],
  ];
  return (
    <div className={`grid border border-ink/70 bg-surface text-sm ${compact ? 'grid-cols-1' : 'grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]'}`}>
      <div style={{ gridRow: 'span 6' }} className={`${compact ? 'hidden' : 'flex'} flex-col items-center justify-center gap-2 border-r border-ink/70 bg-surface-2 p-3 text-ink-muted`}>
        <UserRound className="h-10 w-10" aria-hidden="true" />
        <span className="text-center font-mono text-[10px] uppercase tracking-wider">Photo</span>
      </div>
      {rows.slice(0, compact ? 4 : rows.length).map(([label, value], i) => (
        <div key={label} className={`grid grid-cols-[88px_minmax(0,1fr)] ${i ? 'border-t border-ink/70' : ''}`}>
          <span className="border-r border-ink/70 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">{label}</span>
          <span className={`px-3 py-2 ${label === 'K-RERA reg.' || label === 'Phone' || label === 'Validity' ? 'break-all font-mono text-2xs leading-5' : ''}`}>{value}</span>
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
    <section className="mx-auto max-w-container px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8" aria-label="Talk to the advisor">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Advisor Identity & K-RERA credentials */}
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <UserCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-ink sm:text-lg">{agent.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">
                  <ShieldCheck className="h-3 w-3" />
                  <span>K-RERA Registered Advisor</span>
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                K-RERA: {agent.reraNumber} · Valid: {agent.validFrom} to {agent.validTo}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Direct developer pricing · Zero buyer brokerage · Complete paperwork assistance
              </p>
            </div>
          </div>

          {/* Action Buttons: WhatsApp + Call + Callback Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={whatsAppLink(
                `Hi ${agent.name}, I am browsing EstateNav and would like advice on Bengaluru properties.`,
                contact.whatsapp
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-semibold text-accent-on transition-all hover:bg-accent-hover active:scale-95 sm:text-sm"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Connect with dedicated area advisor</span>
            </a>
            <a
              href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink transition-all hover:border-line-strong hover:bg-surface-2 active:scale-95 sm:text-sm"
            >
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" />
              <span>Call</span>
            </a>
            <button
              type="button"
              onClick={() => setShowCallback(!showCallback)}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-line bg-surface-2 px-3 text-xs font-medium text-ink transition-all hover:bg-surface active:scale-95"
            >
              <span>Request Callback</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCallback ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Callback Lead Form */}
        {showCallback && (
          <div className="mt-4 border-t border-line pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Request a Callback</h3>
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
    </section>
  );
}
