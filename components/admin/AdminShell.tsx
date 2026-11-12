'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Inbox, LayoutDashboard, Map, Settings, Users, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/developers', label: 'Developers', icon: Users },
  { href: '/admin/corridors', label: 'Corridors', icon: Map },
  { href: '/admin/market', label: 'Market data', icon: TrendingUp },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children, dataSource }: { children: React.ReactNode; dataSource: string }) {
  const pathname = usePathname() ?? '';
  return (
    <div className="flex min-h-screen bg-bg text-sm">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <Link href="/admin" className="flex h-14 items-center gap-2 border-b border-line px-4 font-semibold">
          Estate<span className="-ml-2 text-accent-ink">Nav</span>
          <span className="ml-auto rounded bg-surface-2 px-1.5 py-0.5 font-mono text-2xs text-ink-muted">admin</span>
        </Link>
        <nav aria-label="Admin" className="flex-1 space-y-0.5 p-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 ${active ? 'bg-accent-soft text-accent-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <p className="border-t border-line p-4 text-2xs text-ink-muted">Data source: <span className="font-mono">{dataSource}</span></p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur">
          <nav aria-label="Admin sections" className="no-scrollbar flex gap-1 overflow-x-auto md:hidden">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-2 py-1.5 text-ink-muted hover:text-ink">{label}</Link>
            ))}
          </nav>
          {dataSource === 'mock' && <span className="hidden rounded-full border border-line px-2.5 py-1 text-2xs text-ink-muted sm:inline">Mock data · edits reset when the server restarts</span>}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Link href="/" className="btn-ghost min-h-[40px] px-3">View site</Link>
          </div>
        </header>
        <main id="main" className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
