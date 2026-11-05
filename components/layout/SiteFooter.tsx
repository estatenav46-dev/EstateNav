import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Corridor, SiteSettings } from '@/lib/data/types';
import { whatsAppLink } from '@/lib/contact';

// Statutory footer. The agent block, registration number, validity and the portal
// disclosure are mandatory on every public page.
export function SiteFooter({ settings, corridors }: { settings: SiteSettings; corridors: Corridor[] }) {
  const { agent, contact } = settings;
  return (
    <footer className="mt-24 border-t border-line bg-surface-2/60 pb-28 pt-14 text-sm text-ink-muted md:pb-12">
      <div className="mx-auto grid max-w-container gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <p className="text-xl font-semibold tracking-tight text-ink">
            Estate<span className="text-accent-ink">Nav</span>
          </p>
          <p className="max-w-sm leading-relaxed">
            A small, verified catalogue of Bengaluru homes, plots and workspaces, offered at direct-developer pricing with no buyer brokerage.
          </p>
          <p className="text-ink">Partner Developer: {settings.partnerDeveloper}</p>
        </div>

        <nav aria-label="Corridors" className="space-y-3">
          <p className="sheet-label">Corridors</p>
          <ul className="grid gap-1">
            {corridors.map((corridor) => (
              <li key={corridor.id}>
                <Link href={`/properties?corridor=${corridor.id}`} className="inline-flex min-h-[40px] items-center hover:text-ink">
                  {corridor.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shortlist" className="inline-flex min-h-[40px] items-center hover:text-ink">Your shortlist</Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="sheet-label">Advisor &amp; registration</p>
          <dl className="panel divide-y divide-line text-sm">
            <div className="px-4 py-3">
              <dt className="text-2xs text-ink-muted">RERA Registered Agent</dt>
              <dd className="mt-0.5 text-ink">{agent.name}</dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-2xs text-ink-muted">K-RERA registration</dt>
              <dd className="mt-0.5 break-all font-mono text-2xs text-ink">{agent.reraNumber}</dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-2xs text-ink-muted">Validity</dt>
              <dd className="mt-0.5 flex items-center justify-between gap-3 font-mono text-2xs text-ink">
                <span>
                  {agent.validFrom} to {agent.validTo}
                </span>
                <a href={agent.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 font-sans text-sm text-accent-ink hover:underline">
                  Verify <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex min-h-[40px] items-center font-mono text-ink hover:text-accent-ink">{contact.phoneDisplay}</a>
            <a href={whatsAppLink(`Hi ${agent.name}, I'm browsing EstateNav and would like some advice.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center text-accent-ink hover:underline">
              WhatsApp advisor
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-container space-y-2 border-t border-line px-4 pt-6 text-2xs leading-relaxed sm:px-6 lg:px-8">
        <p className="text-ink">{settings.disclaimers.portal}</p>
        <p>{settings.disclaimers.listing}</p>
        <p>© {new Date().getFullYear()} EstateNav · Bengaluru</p>
      </div>
    </footer>
  );
}
