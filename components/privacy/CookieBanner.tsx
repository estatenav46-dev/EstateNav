'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { consentStore, cookieSettingsStore, setConsent } from '@/lib/ui/visitor';

function HouseKey({ turning }: { turning: boolean }) {
  return (
    <svg viewBox="0 0 72 40" className={`h-10 w-[72px] ${turning ? 'key-turn' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 18 L18 6 L32 18 V34 H4 Z" fill="currentColor" fillOpacity="0.14" />
      <circle cx="18" cy="22" r="4" />
      <path d="M32 24 H66 M58 24 V31 M64 24 V29" />
    </svg>
  );
}

function Switch({ on, locked, onToggle, label }: { on: boolean; locked?: boolean; onToggle?: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-base ${on ? 'bg-brass' : 'bg-[rgb(var(--on-night)/0.2)]'} ${locked ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <span className={`switch-thumb h-5 w-5 rounded-full bg-white shadow ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// Shown until the visitor chooses; reopened from "Cookie settings" in the footer. Nothing
// beyond essential storage runs until "Accept all" or a saved choice with personalisation on.
export function CookieBanner() {
  const pathname = usePathname() ?? '';
  const consent = consentStore.useValue();
  const reopened = cookieSettingsStore.useValue();
  const [custom, setCustom] = useState(false);
  const [personal, setPersonal] = useState(true);
  const [leaving, setLeaving] = useState<null | boolean>(null);

  if (pathname.startsWith('/admin') || consent === undefined) return null;
  if (consent && !reopened && leaving === null) return null;

  const decide = (analytics: boolean) => {
    if (leaving !== null) return;
    setLeaving(analytics);
    window.setTimeout(() => {
      setConsent(analytics);
      setLeaving(null);
      setCustom(false);
    }, analytics ? 620 : 380);
  };

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className={`fixed inset-x-3 bottom-[84px] z-[60] mx-auto max-w-[460px] md:inset-x-auto md:bottom-6 md:left-6 md:mx-0 md:w-[440px] ${leaving !== null ? 'cookie-out' : 'cookie-in'}`}
      style={leaving ? { animationDelay: '240ms' } : undefined}
    >
      <div className="relative overflow-hidden rounded-card bg-[rgb(var(--night))] p-5 text-[rgb(var(--on-night))] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)] ring-1 ring-white/10 sm:p-6">

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--on-night)/0.6)]">
              <span aria-hidden="true" className="h-px w-6 bg-brass" /> Your privacy
            </p>
            <p className="mt-2 font-serif text-[1.45rem] leading-tight tracking-[-0.02em]">
              Your data, <span className="text-brass">your keys.</span>
            </p>
          </div>
          <span className="shrink-0 pt-1 text-brass">
            <HouseKey turning={leaving === true} />
          </span>
          {reopened && (
            <button type="button" onClick={() => cookieSettingsStore.set(false)} className="absolute -right-2 -top-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--on-night)/0.7)] hover:bg-white/10" aria-label="Close cookie settings">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="relative mt-3 text-sm leading-relaxed text-[rgb(var(--on-night)/0.72)]">
          Essential cookies keep EstateNav running. With your OK we also remember the areas and homes you explore, to line up better matches. Never sold; change it any time from the footer.
        </p>

        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${custom ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            {custom && (
            <ul className="divide-y divide-white/10 rounded-card bg-white/[0.05] ring-1 ring-white/10">
              <li className="flex items-center gap-4 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Essential</p>
                  <p className="text-xs text-[rgb(var(--on-night)/0.6)]">Sign-in, security and this choice. Always on.</p>
                </div>
                <Switch on locked label="Essential cookies, always on" />
              </li>
              <li className="flex items-center gap-4 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Personalisation</p>
                  <p className="text-xs text-[rgb(var(--on-night)/0.6)]">Areas and homes you view, for better matches.</p>
                </div>
                <Switch on={personal} onToggle={() => setPersonal((v) => !v)} label="Personalisation cookies" />
              </li>
            </ul>
            )}
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          {custom ? (
            <button type="button" onClick={() => decide(personal)} className="btn-primary min-h-[48px] flex-1 px-5">
              Save my choices
            </button>
          ) : (
            <>
              <button type="button" onClick={() => decide(true)} className="btn-primary min-h-[48px] flex-1 px-5">
                Accept all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => decide(false)} className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[var(--radius)] px-5 text-sm font-semibold ring-1 ring-white/25 transition-[background-color,transform] hover:-translate-y-px hover:bg-white/10 active:scale-[0.97]">
                Essential only
              </button>
            </>
          )}
        </div>
        <div className="relative mt-3 flex items-center justify-between text-xs text-[rgb(var(--on-night)/0.6)]">
          <button type="button" onClick={() => setCustom((v) => !v)} aria-expanded={custom} className="inline-flex min-h-[40px] items-center gap-1 font-semibold text-[rgb(var(--on-night)/0.85)] hover:text-[rgb(var(--on-night))]">
            {custom ? 'Fewer options' : 'Customise'}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-slow ${custom ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {consent && <span>Now: {consent.analytics ? 'all cookies' : 'essential only'}</span>}
        </div>
      </div>
    </div>
  );
}
