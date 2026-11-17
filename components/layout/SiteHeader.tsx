'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown, Heart, Menu, MessageCircle, Phone, Search, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { UserMenu } from '@/components/auth/UserMenu';
import { NeedIcon, type NeedIconName } from '@/components/icons/NeedIcons';
import { shortlistStore } from '@/lib/ui/stores';
import { useAuth } from '@/lib/auth/context';
import { whatsAppLink } from '@/lib/contact';

export type HeaderMenu = {
  zones: { id: string; name: string; short: string; areas: string; count: number; cover: string | null }[];
  soon: string[];
  needs: { id: string; label: string; href: string; count: number; icon: NeedIconName }[];
  featured: { title: string; slug: string; place: string; price: string; cover: string } | null;
};

type HeaderProps = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  agentName: string;
  agentRera: string;
  menu: HeaderMenu;
};

const NAV = [
  { label: 'Apartments', href: '/properties?seg=residential' },
  { label: 'Plots', href: '/properties?seg=plot' },
  { label: 'Offices', href: '/properties?seg=commercial' },
  { label: 'New launches', href: '/properties?status=pre-launch,new-launch', wide: true },
];

function Wordmark() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="EstateNav home">
      <span className="relative h-10 w-10 overflow-hidden rounded-[14px] border border-line bg-surface shadow-[0_6px_16px_-10px_rgb(var(--shadow)/0.6)] transition-transform duration-slow ease-out group-hover:-rotate-6">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-full w-full object-cover" priority />
      </span>
      <span className="text-[1.3rem] font-bold tracking-[-0.03em]">
        Estate<span className="text-accent-ink">Nav</span>
      </span>
    </Link>
  );
}

function MegaMenu({ menu, onNavigate }: { menu: HeaderMenu; onNavigate: () => void }) {
  return (
    <div className="mx-auto grid max-w-container gap-8 px-8 pb-8 pt-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,3.2fr)_minmax(0,3.6fr)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Explore by region</p>
        <ul className="stagger mt-3 grid grid-cols-2 gap-2.5">
          {menu.zones.map((z, i) => (
            <li key={z.id} style={{ '--i': i } as CSSProperties}>
              <Link href={`/properties?zone=${z.id}`} onClick={onNavigate} className="group relative flex h-[92px] overflow-hidden rounded-2xl bg-forest text-white">
                {z.cover && <Image src={z.cover} alt="" fill sizes="220px" quality={45} className="object-cover opacity-80 transition-[transform,opacity] duration-700 ease-out group-hover:scale-110 group-hover:opacity-100" />}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <span className="relative flex min-w-0 flex-1 flex-col justify-end p-3.5">
                  <span className="flex items-center gap-1.5 text-base font-semibold">
                    {z.name}
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-base group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </span>
                  <span className="block truncate text-xs text-white/75">{z.count} {z.count === 1 ? 'project' : 'projects'} · {z.areas}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {menu.soon.length > 0 && <p className="mt-3 text-xs text-ink-muted">{menu.soon.join(' and ')} Bengaluru: coming soon.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Browse by need</p>
        <ul className="stagger mt-3 grid gap-0.5">
          {menu.needs.map((n, i) => (
            <li key={n.id} style={{ '--i': i + 2 } as CSSProperties}>
              <Link href={n.href} onClick={onNavigate} className="group flex min-h-[44px] items-center gap-3 rounded-xl px-2 text-sm font-medium transition-colors hover:bg-surface-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand text-forest transition-colors group-hover:bg-accent group-hover:text-accent-on dark:text-brass">
                  <NeedIcon name={n.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">{n.label}</span>
                <span className="tabular text-xs text-ink-muted">{n.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {menu.featured && (
        <a href={`/properties/${menu.featured.slug}`} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className="group relative block min-h-[260px] overflow-hidden rounded-3xl bg-forest text-white">
          <Image src={menu.featured.cover} alt="" fill sizes="360px" quality={55} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/20">Featured project</span>
          <span className="absolute inset-x-0 bottom-0 p-5">
            <span className="block font-serif text-xl leading-tight">{menu.featured.title}</span>
            <span className="mt-1 block text-xs text-white/75">{menu.featured.place}</span>
            <span className="mt-3 flex items-center justify-between">
              <span className="font-semibold">{menu.featured.price}*</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest transition-transform duration-slow group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

export function SiteHeader({ phone, phoneDisplay, whatsapp, agentName, agentRera, menu }: HeaderProps) {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const shortlist = shortlistStore.useValue();
  const { user } = useAuth();
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const megaRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    setDrawer(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(false);
    const onDown = (e: PointerEvent) => !megaRef.current?.contains(e.target as Node) && setMega(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [mega]);

  if (pathname?.startsWith('/admin')) return null;

  const hover = (open: boolean) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMega(open), open ? 90 : 220);
  };
  const toSearch = () => {
    if (pathname !== '/') return;
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    window.setTimeout(() => document.getElementById('hero-search-input')?.focus({ preventScroll: true }), 450);
  };

  return (
    <header className="site-header sticky top-0 z-50 h-header" data-compact={compact}>
      <div aria-hidden="true" className="absolute inset-0 bg-bg transition-opacity duration-base" style={{ opacity: compact || mega ? 0 : 1 }} />
      <div aria-hidden="true" className={`site-header__chrome absolute inset-0 border-b border-line bg-bg/[0.97] ${mega ? '!opacity-100' : ''}`} />
      <div ref={megaRef} onPointerLeave={(e) => e.pointerType === 'mouse' && hover(false)}>
        <div className="site-header__inner relative mx-auto flex h-header max-w-container items-center gap-2 px-4 sm:px-6 lg:gap-6 lg:px-8">
          <Wordmark />

          <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex">
            <button
              type="button"
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((v) => !v)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && hover(true)}
              className={`group inline-flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold transition-colors ${mega ? 'bg-ink text-bg' : 'text-ink hover:bg-surface-2'}`}
            >
              Explore
              <ChevronDown className={`h-4 w-4 transition-transform duration-slow ease-out ${mega ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onPointerEnter={() => hover(false)}
                className={`group relative h-11 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink ${'wide' in item ? 'hidden xl:inline-flex' : 'inline-flex'}`}
              >
                {item.label}
                <span aria-hidden="true" className="absolute inset-x-3.5 bottom-2 h-[2px] origin-left scale-x-0 rounded-full bg-accent transition-transform duration-slow ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {pathname === '/' ? (
              <button type="button" onClick={toSearch} className="hidden h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 sm:inline-flex" aria-label="Search homes">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
              </button>
            ) : (
              <Link href="/properties" className="hidden h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 sm:inline-flex" aria-label="Search homes">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/shortlist"
              className={`relative inline-flex h-11 items-center justify-center gap-2 rounded-full text-ink transition-colors ${user ? 'border border-line px-3 hover:border-ink md:px-4' : 'w-11 hover:bg-surface-2'}`}
              aria-label={`Wishlist${shortlist.length ? `, ${shortlist.length} saved` : ''}`}
            >
              <Heart className={`h-[18px] w-[18px] ${user && shortlist.length ? 'fill-accent text-accent' : ''}`} strokeWidth={1.9} aria-hidden="true" />
              {user && <span className="hidden text-sm font-semibold md:inline">Wishlist</span>}
              {shortlist.length > 0 && (
                <span
                  key={shortlist.length}
                  className={`heart-pop min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-accent-on ${user ? 'md:static md:ring-0' : ''} absolute right-1 top-1 ring-2 ring-bg`}
                >
                  {shortlist.length}
                </span>
              )}
            </Link>
            <ThemeToggle className="hidden !h-11 !w-11 !rounded-full sm:inline-flex" />
            <a href={tel} className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 font-mono text-sm text-ink transition-colors hover:bg-surface-2 2xl:inline-flex">
              <Phone className="h-4 w-4 text-accent-ink" strokeWidth={1.75} aria-hidden="true" />
              {phoneDisplay}
            </a>
            <div className="ml-1 hidden sm:inline-flex">
              <UserMenu />
            </div>
            <Link href="/contact?intent=site-visit" className="btn-primary ml-2 hidden min-h-[44px] px-5 lg:inline-flex">
              Book a site visit <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => setDrawer(true)} className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg transition-transform active:scale-[0.94] lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
              <Menu className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>
        </div>

        {mega && (
          <div id="mega-menu" className="mega-in absolute inset-x-0 top-full hidden border-b border-line bg-bg shadow-[0_40px_80px_-40px_rgb(var(--shadow)/0.45)] lg:block">
            <MegaMenu menu={menu} onNavigate={() => setMega(false)} />
          </div>
        )}
      </div>
      <span data-scroll-progress aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-accent via-accent to-brass" style={{ transform: 'scaleX(0)' }} />

      <Sheet open={drawer} onOpenChange={setDrawer} direction="right" title="Menu" className="max-w-[440px]">
        <div className="stagger space-y-6">
          <section style={{ '--i': 0 } as CSSProperties}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Regions</p>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {menu.zones.map((z) => (
                <li key={z.id}>
                  <Link href={`/properties?zone=${z.id}`} className="relative flex h-20 overflow-hidden rounded-2xl bg-forest text-white">
                    {z.cover && <Image src={z.cover} alt="" fill sizes="200px" quality={40} className="object-cover opacity-75" />}
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                    <span className="relative mt-auto p-3">
                      <span className="block text-sm font-semibold">{z.short}</span>
                      <span className="block text-[11px] text-white/75">{z.count} {z.count === 1 ? 'project' : 'projects'}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section style={{ '--i': 1 } as CSSProperties}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Browse</p>
            <ul className="mt-1 divide-y divide-line">
              {menu.needs.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} className="flex min-h-[52px] items-center gap-3 text-base font-medium">
                    <NeedIcon name={n.icon} className="h-5 w-5 text-accent-ink" />
                    <span className="flex-1">{n.label}</span>
                    <span className="text-xs text-ink-muted">{n.count}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shortlist" className="flex min-h-[52px] items-center gap-3 text-base font-medium">
                  <Heart className="h-5 w-5 text-accent-ink" aria-hidden="true" />
                  <span className="flex-1">Your wishlist</span>
                  {shortlist.length > 0 && <span className="rounded-full bg-accent px-2 text-xs font-semibold text-accent-on">{shortlist.length}</span>}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex min-h-[52px] items-center gap-3 text-base font-medium">
                  <MessageCircle className="h-5 w-5 text-accent-ink" aria-hidden="true" />
                  <span className="flex-1">Contact</span>
                </Link>
              </li>
            </ul>
          </section>
          <section style={{ '--i': 2 } as CSSProperties} className="space-y-2">
            <div className="pb-1 sm:hidden">
              <UserMenu />
            </div>
            <Link href="/contact?intent=site-visit" className="btn-primary w-full">
              Book a site visit <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <a href={whatsAppLink(`Hi ${agentName}, I'm browsing EstateNav and would like some advice.`, whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </a>
              <a href={tel} className="btn-secondary px-3">
                <Phone className="h-4 w-4" aria-hidden="true" /> Call
              </a>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <p className="text-sm text-ink-muted">Theme</p>
              <ThemeToggle />
            </div>
            <p className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-ink-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <span>
                K-RERA agent {agentName} · <span className="font-mono">{agentRera}</span>
              </span>
            </p>
          </section>
        </div>
      </Sheet>
    </header>
  );
}
