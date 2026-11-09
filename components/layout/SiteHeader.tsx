'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, MessageCircle, Phone, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { UserMenu } from '@/components/auth/UserMenu';
import { heroSearchStore, shortlistStore } from '@/lib/ui/stores';
import { whatsAppLink } from '@/lib/contact';

type HeaderProps = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  agentName: string;
  agentRera: string;
};

const NAV = [
  { label: 'Buy', href: '/properties?seg=residential' },
  { label: 'Rent', href: '/properties?seg=rent' },
  { label: 'Plots', href: '/properties?seg=plot' },
  { label: 'Commercial', href: '/properties?seg=commercial' },
  { label: 'New Launch', href: '/properties?status=pre-launch,new-launch' },
];
const EXPLORE = [
  { label: 'All listings', href: '/properties' },
  { label: 'Corridors', href: '/#corridors' },
  { label: 'Shortlist', href: '/shortlist' },
  { label: 'Contact', href: '/contact' },
];

function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)} className="inline-flex h-12 items-center gap-1 rounded-lg px-3 text-sm text-ink hover:bg-surface-2">
        Explore <ChevronDown className={`h-4 w-4 transition-transform duration-fast ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="panel absolute left-0 top-full mt-1 w-52 animate-fade-up p-1.5 shadow-[0_18px_40px_-20px_rgb(var(--shadow)/0.35)]">
          {EXPLORE.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setOpen(false)} className="flex min-h-[44px] items-center rounded-lg px-3 text-sm hover:bg-surface-2">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="EstateNav home">
      <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-line bg-surface">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-full w-full object-cover" priority />
      </span>
      <span className="text-xl font-semibold tracking-tight">
        Estate<span className="text-accent-ink">Nav</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ phone, phoneDisplay, whatsapp, agentName, agentRera }: HeaderProps) {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const heroSearch = heroSearchStore.useValue();
  const shortlist = shortlistStore.useValue();
  const isHome = pathname === '/';
  const showPill = isHome && !heroSearch.visible;
  const tel = `tel:${phone.replace(/[^0-9+]/g, '')}`;

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCompact(window.scrollY > 80));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => setDrawer(false), [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  const backToSearch = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    window.setTimeout(() => document.getElementById('hero-search-input')?.focus({ preventScroll: true }), reduce ? 0 : 450);
  };

  return (
    <header className="site-header sticky top-0 z-50 h-header" data-compact={compact}>
      <div aria-hidden="true" className="absolute inset-0 bg-bg transition-opacity duration-base" style={{ opacity: compact ? 0 : 1 }} />
      <div aria-hidden="true" className="site-header__chrome absolute inset-0 border-b border-line bg-bg/85 backdrop-blur-md" />
      <div className="site-header__inner relative mx-auto flex h-full max-w-container items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Wordmark />
        <span className="hidden whitespace-nowrap rounded-full border border-accent-ink/30 bg-accent-soft px-2.5 py-1 font-mono text-2xs text-accent-ink xl:inline-block">Direct developer</span>

        <div className="relative hidden min-w-0 flex-1 justify-center lg:flex">
          <nav
            aria-label="Primary"
            className="flex items-center transition-[opacity,transform] duration-base ease-out"
            style={{ opacity: showPill ? 0 : 1, transform: showPill ? 'translateY(-6px)' : 'none', pointerEvents: showPill ? 'none' : 'auto' }}
            aria-hidden={showPill}
          >
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} tabIndex={showPill ? -1 : undefined} className="inline-flex h-12 items-center whitespace-nowrap rounded-lg px-3 text-sm text-ink hover:bg-surface-2">
                {item.label}
              </Link>
            ))}
            <ExploreMenu />
          </nav>
          <button
            type="button"
            onClick={backToSearch}
            tabIndex={showPill ? 0 : -1}
            aria-hidden={!showPill}
            className="absolute inset-y-0 my-auto inline-flex h-11 max-w-[420px] items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-ink-muted shadow-[0_8px_24px_-16px_rgb(var(--shadow)/0.4)] transition-[opacity,transform] duration-base ease-out hover:border-line-strong"
            style={{ opacity: showPill ? 1 : 0, transform: showPill ? 'none' : 'translateY(8px)', pointerEvents: showPill ? 'auto' : 'none' }}
          >
            <Search className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <span className="truncate">{heroSearch.summary || 'Search homes, plots and workspaces'}</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          <a href={tel} className="group relative hidden h-12 w-12 items-center justify-center rounded-xl text-ink hover:bg-surface-2 lg:inline-flex xl:hidden" aria-label={`Call ${agentName}, ${phoneDisplay}`}>
            <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            <span role="tooltip" className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-2xs text-bg opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100">
              {phoneDisplay}
            </span>
          </a>
          <a href={tel} className="hidden h-12 items-center gap-2 whitespace-nowrap rounded-xl px-3 font-mono text-sm text-ink hover:bg-surface-2 xl:inline-flex">
            <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            {phoneDisplay}
          </a>
          <Link href="/contact?intent=site-visit" className="btn-primary ml-1 hidden lg:inline-flex">
            Schedule site visit
          </Link>
          <div className="ml-1 hidden sm:inline-flex">
            <UserMenu />
          </div>
          <button type="button" onClick={() => setDrawer(true)} className="icon-btn border-transparent lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer} direction="right" title="Menu" className="max-w-[420px]">
        <nav aria-label="Mobile" className="-mx-1 flex flex-col">
          {[...NAV, ...EXPLORE].map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-[48px] items-center justify-between rounded-lg px-3 text-base hover:bg-surface-2">
              {item.label}
              {item.href === '/shortlist' && shortlist.length > 0 && <span className="rounded-full bg-accent px-2 text-2xs font-medium text-accent-on">{shortlist.length}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="pb-1 sm:hidden">
            <UserMenu />
          </div>
          <Link href="/contact?intent=site-visit" className="btn-primary w-full">Schedule site visit</Link>
          <div className="grid grid-cols-2 gap-2">
            <a href={whatsAppLink(`Hi ${agentName}, I'm browsing EstateNav and would like some advice.`, whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <MessageCircle className="h-4 w-4 text-accent-ink" aria-hidden="true" /> WhatsApp
            </a>
            <a href={tel} className="btn-secondary">
              <Phone className="h-4 w-4 text-accent-ink" aria-hidden="true" /> Call
            </a>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <p className="text-sm text-ink-muted">Theme</p>
            <ThemeToggle />
          </div>
          <p className="pt-1 font-mono text-2xs leading-relaxed text-ink-muted">
            K-RERA agent {agentName} · {agentRera}
          </p>
        </div>
      </Sheet>
    </header>
  );
}
