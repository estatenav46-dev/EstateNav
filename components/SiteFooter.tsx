import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Phone, MessageCircle, ExternalLink, MapPin } from 'lucide-react';
import { ADVISOR_NAME, ADVISOR_PHONE_DISPLAY, ADVISOR_RERA, getTelUrl, getWhatsAppUrl } from '@/lib/contact';

export function SiteFooter() {
  const whatsappUrl = getWhatsAppUrl();
  const telUrl = getTelUrl();

  const corridors = [
    { label: 'Sarjapur Road Corridor', href: '/properties?locality=Sarjapur' },
    { label: 'Whitefield & EPIP Zone', href: '/properties?locality=Whitefield' },
    { label: 'Electronic City Phase 1', href: '/properties?locality=Electronic+City' },
    { label: 'North Bengaluru (Hebbal / Devanahalli)', href: '/properties?locality=North+Bengaluru' },
    { label: 'Plotted Land Reserves', href: '/properties?category=plotted' },
    { label: 'Commercial & Office Spaces', href: '/properties?category=commercial' },
  ];

  return (
    <footer className="border-t border-[#E5E2DC] bg-[#F7F6F3]/80 pt-12 pb-24 md:pb-12 text-sm text-[#5B6470]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 3 Columns: Brand & Mission, Explore Corridors, Contact & Regulatory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Column 1: Brand & Advisory mandate */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-sm">
                <Image src="/logo.png" alt="EstateNav" width={40} height={40} className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1A1E23]">
                Estate<span className="text-[#047857]">Nav</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-[#5B6470]">
              Smart Investments, Better Living. Institutional-grade property discovery with direct-developer pricing across Bengaluru&apos;s primary residential, commercial, and plotted growth corridors.
            </p>

            <div className="inline-flex items-center gap-2 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-2 text-xs font-medium text-[#047857]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Zero-Brokerage Mandate · Authorized Channel Partner</span>
            </div>
          </div>

          {/* Column 2: Corridors & Inventory */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1E23]">
              Bengaluru Growth Corridors
            </h3>
            <ul className="space-y-2.5 text-sm">
              {corridors.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#047857] flex items-center gap-1.5 transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-[#047857] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Statutory RERA */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1E23]">
              Advisor Contact &amp; Compliance
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#047857] shrink-0" />
                <a href={telUrl} className="font-semibold text-[#1A1E23] hover:text-[#047857] transition-colors">
                  {ADVISOR_PHONE_DISPLAY}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#047857] shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#047857] hover:underline"
                >
                  Direct WhatsApp Chat
                </a>
              </div>

              {/* RERA Badge Box */}
              <div className="rounded-xl border border-[#E5E2DC] bg-white p-3.5 space-y-1.5 text-xs shadow-sm">
                <div className="flex items-center gap-1.5 font-semibold text-[#047857]">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>K-RERA Registered Agent: {ADVISOR_NAME}</span>
                </div>
                <p className="font-mono text-[11px] text-[#1A1E23] break-all">
                  {ADVISOR_RERA}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#5B6470] pt-1 border-t border-[#E5E2DC]">
                  <span>Valid: 16-09-2026 to 16-09-2031</span>
                  <a
                    href="https://rera.karnataka.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#047857] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Verify</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-[#E5E2DC] pt-6 text-xs leading-relaxed text-[#66717B]">
          <p>
            <strong className="text-[#1A1E23] font-medium">Statutory Disclosure:</strong> EstateNav is an independent real estate advisory portal and authorized channel partner platform operated by SV Praveen (K-RERA Registration No. {ADVISOR_RERA}), not the official developer website. Project details, pricing, and master layouts are displayed for institutional advisory under direct developer terms. Verify registration, title, approvals, availability, areas, and transaction documents with the relevant statutory authorities and developer.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-[#E5E2DC] pt-4 text-xs text-[#8E98A5]">
          <p>© 2026 EstateNav · Bengaluru Real Estate Advisory. All rights reserved.</p>
          <p>K-RERA Agent Registration: {ADVISOR_RERA}</p>
        </div>

      </div>
    </footer>
  );
}
