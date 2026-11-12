import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/lib/auth/context';
import { AuthModal } from '@/components/auth/AuthModal';
import { WishlistSync } from '@/components/auth/WishlistSync';
import { BlueprintBackdrop } from '@/components/layout/BlueprintBackdrop';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { HideOnAdmin } from '@/components/layout/HideOnAdmin';
import { MobileDock } from '@/components/layout/MobileDock';
import { CompareTray } from '@/components/listings/CompareTray';
import { getCorridors, getSettings } from '@/lib/data/cached';
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
  const [settings, corridors] = await Promise.all([getSettings(), getCorridors()]);
  const consent = { text: settings.consentText, version: settings.consentVersion, privacyNote: settings.privacyNote };

  return (
    <html lang="en-IN" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <AuthProvider>
            <a href="#content" className="sr-only z-[100] rounded-lg bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
              Skip to content
            </a>
            <BlueprintBackdrop />
            <SiteHeader
              phone={settings.contact.phone}
              phoneDisplay={settings.contact.phoneDisplay}
              whatsapp={settings.contact.whatsapp}
              agentName={settings.agent.name}
              agentRera={settings.agent.reraNumber}
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
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
