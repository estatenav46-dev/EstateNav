import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { Corridor, SiteSettings } from '@/lib/data/types';
import { whatsAppLink } from '@/lib/contact';
import { ZONES } from '@/lib/regions';
import { CookieSettingsLink } from '@/components/privacy/CookieSettingsLink';
import { BackToTop, FooterCta } from './FooterBits';

const TYPES = [
  { label: 'Apartments', href: '/properties?seg=residential' },
  { label: 'Plots', href: '/properties?seg=plot' },
  { label: 'Offices', href: '/properties?seg=commercial' },
  { label: 'New launches', href: '/properties?status=pre-launch,new-launch' },
  { label: 'Ready to move', href: '/properties?pos=ready' },
];

const link = 'inline-flex min-h-[36px] items-center text-[rgb(var(--on-night)/0.7)] transition-colors hover:text-[rgb(var(--on-night))]';
const heading = 'text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--on-night)/0.45)]';

// Statutory footer. The agent block, registration number, validity and the portal
// disclosure are mandatory on every public page.
export function SiteFooter({ settings, corridors }: { settings: SiteSettings; corridors: Corridor[] }) {
  const { agent, contact } = settings;
  const live = ZONES.filter((z) => z.available);
  const soon = ZONES.filter((z) => !z.available);

  return (
    <footer className="relative overflow-hidden bg-[rgb(var(--night))] pb-28 pt-16 text-sm text-[rgb(var(--on-night))] md:pb-10 md:pt-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-20 h-[360px] w-[360px] rounded-full bg-brass/15 blur-[120px]" />
      <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <FooterCta agentName={agent.name} whatsapp={contact.whatsapp} />

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="space-y-5">
            <p className="text-2xl font-bold tracking-[-0.03em]">
              Estate<span className="text-brass">Nav</span>
            </p>
            <p className="max-w-xs leading-relaxed text-[rgb(var(--on-night)/0.65)]">
              A small, verified catalogue of Bengaluru homes, plots and workspaces, at direct-developer pricing with no buyer brokerage.
            </p>
            <div className="flex flex-col gap-1">
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className={`${link} gap-2 font-mono`}>
                <Phone className="h-4 w-4 text-brass" aria-hidden="true" /> {contact.phoneDisplay}
              </a>
              <a href={whatsAppLink(`Hi ${agent.name}, I'm browsing EstateNav and would like some advice.`, contact.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${link} gap-2`}>
                <MessageCircle className="h-4 w-4 text-brass" aria-hidden="true" /> Connect with dedicated area advisor
              </a>
            </div>
            <p className="text-[rgb(var(--on-night)/0.65)]">
              Partner Developer: <span className="text-[rgb(var(--on-night))]">{settings.partnerDeveloper}</span>
            </p>
          </div>

          <nav aria-label="Regions">
            <p className={heading}>Regions</p>
            <ul className="mt-3 grid">
              <li>
                <Link href="/properties" className={link}>All of Bengaluru</Link>
              </li>
              {live.map((z) => (
                <li key={z.id}>
                  <Link href={`/properties?zone=${z.id}`} className={link}>{z.name}</Link>
                </li>
              ))}
              {soon.map((z) => (
                <li key={z.id} className="inline-flex min-h-[36px] items-center gap-2 text-[rgb(var(--on-night)/0.4)]">
                  {z.name} <span className="rounded-full px-1.5 text-[10px] ring-1 ring-[rgb(var(--on-night)/0.2)]">Soon</span>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Property types">
            <p className={heading}>Property types</p>
            <ul className="mt-3 grid">
              {TYPES.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className={link}>{t.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Corridors">
            <p className={heading}>Corridors</p>
            <ul className="mt-3 grid">
              {corridors.map((c) => (
                <li key={c.id}>
                  <Link href={`/properties?corridor=${c.id}`} className={link}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <p className={heading}>Help</p>
            <ul className="mt-3 grid">
              <li>
                <Link href="/contact" className={link}>Contact us</Link>
              </li>
              <li>
                <Link href="/contact?intent=site-visit" className={link}>Book a site visit</Link>
              </li>
              <li>
                <Link href="/shortlist" className={link}>Your wishlist</Link>
              </li>
              <li>
                <a href="/sitemap.xml" className={link}>Sitemap</a>
              </li>
              <li>
                <CookieSettingsLink className={link} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 grid gap-4 rounded-[24px] bg-[rgb(var(--on-night)/0.05)] p-5 ring-1 ring-[rgb(var(--on-night)/0.1)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brass/15 text-brass">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-[rgb(var(--on-night)/0.5)]">RERA Registered Agent</dt>
              <dd className="mt-0.5 font-semibold">{agent.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-[rgb(var(--on-night)/0.5)]">K-RERA registration</dt>
              <dd className="mt-0.5 break-all font-mono text-xs">{agent.reraNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-[rgb(var(--on-night)/0.5)]">Validity</dt>
              <dd className="mt-0.5 font-mono text-xs">
                {agent.validFrom} to {agent.validTo}
              </dd>
            </div>
          </dl>
          <a href={agent.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 justify-self-start rounded-full px-4 text-sm font-semibold text-brass ring-1 ring-brass/40 transition-colors hover:bg-brass/10">
            Verify on K-RERA <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-8 space-y-2 text-xs leading-relaxed text-[rgb(var(--on-night)/0.5)]">
          <p className="text-[rgb(var(--on-night)/0.75)]">{settings.disclaimers.portal}</p>
          <p>{settings.disclaimers.listing}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[rgb(var(--on-night)/0.12)] pt-6 text-xs text-[rgb(var(--on-night)/0.55)]">
          <span>© {new Date().getFullYear()} EstateNav · Bengaluru</span>
          <BackToTop />
        </div>
      </div>

      <div data-scrub="enter" data-scrub-span="0.9" aria-hidden="true" className="relative mt-6 overflow-hidden">
        <p className="sc-rise select-none whitespace-nowrap text-center font-serif text-[22vw] font-bold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(var(--on-night)/0.18)] sm:text-[19vw]">
          EstateNav
        </p>
      </div>
    </footer>
  );
}
