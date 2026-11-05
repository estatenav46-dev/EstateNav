import { MessageCircle, Phone, UserRound } from 'lucide-react';
import type { SiteSettings } from '@/lib/data/types';
import { LazyLeadForm as LeadForm } from '@/components/forms/LazyLeadForm';
import { whatsAppLink } from '@/lib/contact';

// The advisor's credentials, set out like the title block in the corner of a drawing.
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
      {/* TODO(client): replace with SV Praveen's photo (square, at least 400px). */}
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

export function AdvisorBlock({ settings }: { settings: SiteSettings }) {
  const { agent, contact } = settings;
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  return (
    <section aria-labelledby="advisor-title" className="mx-auto mt-24 max-w-container px-4 sm:px-6 lg:px-8">
      <p className="sheet-label">Sheet A-06 · Your advisor</p>
      <div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div>
          <h2 id="advisor-title" className="font-serif text-2xl sm:text-3xl">One registered advisor, start to finish.</h2>
          <p className="mt-3 max-w-md text-ink-muted">{agent.name} shortlists with you, checks the paperwork, joins the site visit and coordinates the booking under the developer’s own pricing.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={whatsAppLink(`Hi ${agent.name}, I'd like some advice on Bengaluru property.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp advisor
            </a>
            <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary">
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call {contact.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="space-y-6">
          <AdvisorTitleBlock settings={settings} />
          <div className="panel p-5">
            <p className="mb-4 font-medium">Request a callback</p>
            <LeadForm consent={consent} source="home" intent="callback" variant="inline" whatsapp={contact.whatsapp} advisorName={agent.name} submitLabel="Request callback" />
          </div>
        </div>
      </div>
    </section>
  );
}
