import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-logo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EstateNav — Smart Investments, Better Living, Great Possibilities',
  description: 'EstateNav: Smart Investments, Better Living, Great Possibilities. Institutional-grade research, Kaveri 2.0 title audits, and direct verified allocations across Bengaluru corridors.',
  keywords: [
    'Bengaluru Real Estate',
    'Codename New Dimension',
    'Sarjapur Road Apartments',
    'Whitefield Flats',
    'Kaveri 2.0 audited properties',
    'Direct developer pricing',
    'K-RERA registered projects',
  ],
  authors: [{ name: 'EstateNav Advisory' }],
  openGraph: {
    title: 'EstateNav — Navigate Bengaluru Real Estate with Data-Backed Certainty',
    description: 'Data-backed property discovery, transit radius matching, and direct developer allocations for high-income tech leads and NRI investors.',
    url: 'https://estatenav.vercel.app',
    siteName: 'EstateNav',
    images: [
      {
        url: 'https://estatenav.vercel.app/logo-card.jpg',
        width: 1422,
        height: 1422,
        alt: 'EstateNav Institutional Real Estate Advisory Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'EstateNav',
    description: 'Institutional-grade real estate advisory and direct developer allocations in Bengaluru.',
    url: 'https://estatenav.vercel.app',
    logo: 'https://estatenav.vercel.app/logo.png',
    image: 'https://estatenav.vercel.app/logo-card.jpg',
    areaServed: ['Sarjapur Road', 'Whitefield', 'Outer Ring Road', 'Hebbal', 'Electronic City'],
    knowsAbout: [
      'K-RERA Compliance',
      'Kaveri 2.0 Title Clearances',
      'Direct Developer Allocations',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91 97406 09562',
      contactType: 'Sales & Advisory Support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Kannada', 'Hindi'],
    },
  };

  return (
    <html lang="en" className={`dark scroll-smooth ${montserrat.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const _log = console.log;
                const _info = console.info;
                console.log = function(...args) {
                  if (typeof args[0] === 'string' && args[0].includes('[Fast Refresh]')) return;
                  _log.apply(console, args);
                };
                console.info = function(...args) {
                  if (typeof args[0] === 'string' && args[0].includes('[Fast Refresh]')) return;
                  _info.apply(console, args);
                };
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-canvas-950 text-slate-100 antialiased selection:bg-brand-500/20 selection:text-brand-300 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}

