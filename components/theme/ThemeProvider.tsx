'use client';

import { ThemeProvider as NextThemes } from 'next-themes';
import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./motionFeatures').then((m) => m.default);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </MotionConfig>
      </LazyMotion>
    </NextThemes>
  );
}
