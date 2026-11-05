import type { Config } from 'tailwindcss';

// Every colour is a CSS variable (see app/globals.css) so the light "Site Plan" and
// dark "Blueprint" themes swap without touching components.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx,mdx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2') },
        ink: { DEFAULT: token('ink'), muted: token('ink-muted') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          ink: token('accent-ink'),
          soft: token('accent-soft'),
          on: token('on-accent'),
        },
        danger: token('danger'),
        scrim: token('scrim'),
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Manrope', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.55' }],
        xl: ['1.375rem', { lineHeight: '1.35' }],
        '2xl': ['1.75rem', { lineHeight: '1.2' }],
        '3xl': ['2.5rem', { lineHeight: '1.08' }],
        '4xl': ['3.5rem', { lineHeight: '1.04' }],
      },
      maxWidth: { container: '1360px' },
      borderRadius: { card: '16px', slide: '20px' },
      transitionDuration: { fast: '150ms', base: '240ms', slow: '400ms' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      spacing: { header: '72px' },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        progress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'draw-in': { to: { strokeDashoffset: '0' } },
        'pin-drop': {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.6)' },
          '60%': { opacity: '1', transform: 'translateY(1px) scale(1.06)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'pin-drop': 'pin-drop 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up': 'fade-up 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
