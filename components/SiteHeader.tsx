'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, MessageCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { ADVISOR_NAME, ADVISOR_PHONE_DISPLAY, ADVISOR_RERA, getTelUrl, getWhatsAppUrl } from '@/lib/contact';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Buy', href: '/properties?for=buy' },
    { label: 'Rent', href: '/properties?for=rent' },
    { label: 'New Launch', href: '/properties?possession=new-launch' },
    { label: 'Plots', href: '/properties?category=plotted' },
    { label: 'Commercial', href: '/properties?category=commercial' },
    { label: 'All Listings', href: '/properties' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E2DC] bg-white/95 backdrop-blur-md transition-shadow">
      <div className="mx-auto flex h-18 sm:h-20 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Mark with Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="EstateNav home">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#E5E2DC] bg-[#F7F6F3] shadow-sm transition-transform group-hover:scale-105">
              <Image src="/logo.png" alt="EstateNav" width={44} height={44} className="h-full w-full object-cover" priority />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1E23]">
                Estate<span className="text-[#047857]">Nav</span>
              </span>
              <span className="hidden xl:inline-block ml-2 text-[10px] font-medium uppercase tracking-wider text-[#047857] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
                Direct Developer
              </span>
            </div>
          </Link>

          {/* Desktop Subline */}
          <span className="hidden lg:inline-block ml-3 border-l border-[#E5E2DC] pl-3 text-xs text-[#5B6470]">
            Smart Investments, Better Living
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#1A1E23] hover:text-[#047857] hover:bg-[#F7F6F3] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={getTelUrl()}
            className="flex items-center gap-2 rounded-xl border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1A1E23] hover:border-[#047857] hover:text-[#047857] transition-all shadow-sm"
            title={`Call Advisor ${ADVISOR_NAME}`}
          >
            <Phone className="h-3.5 w-3.5 text-[#047857]" />
            <span className="font-mono">{ADVISOR_PHONE_DISPLAY}</span>
          </a>

          <Link href="/contact" className="btn-primary min-h-[44px] text-sm px-4 shadow-sm">
            Book a site visit
          </Link>
        </div>

        {/* Mobile Header Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href={getTelUrl()}
            aria-label={`Call advisor ${ADVISOR_NAME}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E2DC] bg-[#F7F6F3] text-[#047857] active:scale-95 transition-transform"
          >
            <Phone className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E2DC] bg-white text-[#1A1E23] active:scale-95 transition-transform"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E2DC] bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-[#F0FDF4] p-3 text-xs text-[#047857]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="font-medium">K-RERA Registered Advisor · {ADVISOR_NAME}</span>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-xl px-3.5 text-base font-medium text-[#1A1E23] hover:bg-[#F7F6F3] active:bg-[#F0FDF4] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-[#8E98A5]" />
              </Link>
            ))}
          </nav>

          <div className="mt-4 space-y-2.5 pt-3 border-t border-[#E5E2DC]">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full min-h-[48px]"
            >
              Book a site visit
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[48px] justify-center text-[#047857]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={getTelUrl()}
                className="btn-secondary min-h-[48px] justify-center"
              >
                <Phone className="h-4 w-4 text-[#047857]" />
                <span>Call Advisor</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

