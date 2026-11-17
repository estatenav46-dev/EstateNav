import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/lib/auth/context';
import { AuthModal } from '@/components/auth/AuthModal';
import { WishlistSync } from '@/components/auth/WishlistSync';
import { Interactions } from '@/components/ui/Interactions';
import { VisitorTracker } from '@/components/privacy/VisitorTracker';
import { CookieBanner } from '@/components/privacy/CookieBanner';
import { WelcomeConcierge } from '@/components/concierge/WelcomeConcierge';
import { comingSoonZones, liveZones, zoneOfCorridor } from '@/lib/regions';
import { NEED_TILES } from '@/lib/categories';
import { sortListings } from '@/lib/listingFilters';
import { priceLabel } from '@/lib/property';
import { NavProgress } from '@/components/ui/NavProgress';
import { ZoneRegistry } from '@/components/layout/ZoneRegistry';
import { BlueprintBackdrop } from '@/components/layout/BlueprintBackdrop';
import { SiteHeader, type HeaderMenu } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { HideOnAdmin } from '@/components/layout/HideOnAdmin';
import { MobileDock } from '@/components/layout/MobileDock';
import { CompareTray } from '@/components/listings/CompareTray';
import { getCorridors, getPublishedProperties, getSettings } from '@/lib/data/cached';
import { SITE_URL } from '@/lib/site';

// Geist (SIL OFL, see app/fonts/LICENSE-Geist.txt), subset to Latin plus ₹ to keep the preload small.
const sans = localFont({ src: './fonts/Geist-Latin.woff2', variable: '--font-geist-sans', weight: '100 900', display: 'swap' });
// Mono only sets RERA numbers and areas, so it loads after the critical content.
const mono = localFont({ src: './fonts/GeistMono-Latin.woff2', variable: '--font-geist-mono', weight: '100 900', display: 'swap', preload: false });
// Headings: Plus Jakarta Sans, a clean geometric sans (variable weight). Kept on the --font-serif
// variable so every existing `font-serif` heading picks it up.
const serif = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'EstateNav | Verified Bengaluru homes, plots & workspaces', template: '%s | EstateNav' },
  description: 'A curated catalogue of verified Bengaluru homes, plots and workspaces — direct-developer pricing, zero buyer brokerage and RERA details you can check.',
  openGraph: {
    title: 'EstateNav | Verified Bengaluru homes, plots & workspaces',
    description: 'Direct-developer pricing, zero buyer brokerage and RERA details you can check.',
    url: SITE_URL,
    siteName: 'EstateNav',
    images: [{ url: '/logo-card.jpg', width: 1422, height: 1422, alt: 'EstateNav' }],
    locale: 'en_IN',
    type: 'website',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F6' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const [settings, corridors, properties] = await Promise.all([getSettings(), getCorridors(), getPublishedProperties()]);
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };
  // A tiny summary so the welcome concierge can count matches and show photos without loading listings.
  const catalogue = properties.map((p) => ({ id: p.id, zone: zoneOfCorridor(p.corridorId), seg: p.segment, rent: p.transaction === 'rent', price: p.priceMin, img: p.media.cover.url, title: p.title }));
  const ranked = sortListings(properties, 'relevance');
  const lead = ranked.find((p) => p.featured) ?? ranked[0];
  const menu: HeaderMenu = {
    zones: liveZones(properties).map((z) => {
      const inZone = ranked.filter((p) => zoneOfCorridor(p.corridorId) === z.id);
      return { id: z.id, name: z.name, short: z.short, areas: z.areas, count: inZone.length, cover: inZone[0]?.media.cover.url ?? null };
    }),
    soon: comingSoonZones(properties).map((z) => z.short),
    needs: NEED_TILES.filter((t) => ['apartments', 'plots', 'offices', 'ready', 'new-launch', 'under-1-5'].includes(t.id))
      .map((t) => ({ id: t.id, label: t.label, href: `/properties?${new URLSearchParams(t.query).toString()}`, count: properties.filter(t.matches).length, icon: t.icon }))
      .filter((t) => t.count > 0),
    featured: lead ? { title: lead.title, slug: lead.slug, place: `${lead.locality} · ${lead.corridorName}`, price: priceLabel(lead), cover: lead.media.cover.url } : null,
  };

  return (
    <html lang="en-IN" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <AuthProvider>
            <a href="#content" className="sr-only z-[100] rounded-lg bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
              Skip to content
            </a>
            <ZoneRegistry zones={corridors.flatMap((c) => (c.zone ? [{ id: c.id, zone: c.zone }] : []))} />
            <BlueprintBackdrop />
            <SiteHeader
              phone={settings.contact.phone}
              phoneDisplay={settings.contact.phoneDisplay}
              whatsapp={settings.contact.whatsapp}
              agentName={settings.agent.name}
              agentRera={settings.agent.reraNumber}
              menu={menu}
            />
            <div id="content" className="flex-1">
              {children}
            </div>
            {modal}
            <HideOnAdmin>
              <SiteFooter settings={settings} corridors={corridors} />
            </HideOnAdmin>
            <CompareTray />
            <MobileDock settings={settings} consent={consent} />
            <AuthModal />
            <WishlistSync />
            <Interactions />
            <NavProgress />
            <VisitorTracker />
            <CookieBanner />
            <WelcomeConcierge consent={consent} advisorName={settings.agent.name} catalogue={catalogue} />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
