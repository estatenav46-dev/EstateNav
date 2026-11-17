'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, X } from 'lucide-react';
import { saveWelcomeLead } from '@/app/actions/visitors';
import { savePrefs, track, visitorId } from '@/lib/ui/visitor';
import { NeedIcon, type NeedIconName } from '@/components/icons/NeedIcons';
import { NumberRoll } from '@/components/ui/NumberRoll';
import { startNavProgress } from '@/components/ui/NavProgress';

export type CatalogueItem = { id: string; zone: string; seg: string; rent: boolean; price: number; img: string; title: string };
export type ConsentCopy = { text: string; version: string; privacyNote: string };

const STORE_KEY = 'estatenav:concierge';
/** First appearance, in ms after landing. */
export const FIRST_DELAY_MS = 5000;
/** After each "I'll browse first" the form returns later: 3, 10, then 30 minutes, then daily. */
const REMIND_MINUTES = [3, 10, 30];
const DAILY_MS = 24 * 60 * 60 * 1000;

type Stored = { state: 'done' | 'later'; at: string; count: number };

export function readConciergeState(): Stored | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? 'null');
    if (!raw) return null;
    return { state: raw.state === 'done' ? 'done' : 'later', at: raw.at, count: Number(raw.count) || 1 };
  } catch {
    return null;
  }
}

export function writeConciergeState(state: 'done' | 'later') {
  const previous = readConciergeState();
  const count = state === 'later' ? (previous?.state === 'later' ? previous.count + 1 : 1) : previous?.count ?? 0;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ state, at: new Date().toISOString(), count }));
  } catch {
    /* storage unavailable */
  }
}

/** When the dialog may open next (epoch ms), or null once the visitor has answered. */
export function nextConciergeAt(landedAt: number): number | null {
  const saved = readConciergeState();
  if (saved?.state === 'done') return null;
  const first = landedAt + FIRST_DELAY_MS;
  if (!saved) return first;
  const wait = saved.count <= REMIND_MINUTES.length ? REMIND_MINUTES[saved.count - 1] * 60_000 : DAILY_MS;
  return Math.max(first, new Date(saved.at).getTime() + wait);
}

const GOALS: { id: string; label: string; hint: string; icon: NeedIconName }[] = [
  { id: 'buy-home', label: 'A home to live in', hint: 'Apartments and villas', icon: 'first-home' },
  { id: 'invest', label: 'An investment', hint: 'Rental yield or growth', icon: 'budget' },
  { id: 'plot', label: 'A plot', hint: 'Build your own', icon: 'plot' },
  { id: 'office', label: 'Office space', hint: 'Lease or buy', icon: 'office' },
  { id: 'browsing', label: 'Just looking', hint: 'Show me everything', icon: 'launch' },
];
const REGIONS: { id: string; label: string; hint: string; heading: number | null }[] = [
  { id: 'north', label: 'North', hint: 'Hebbal · Devanahalli', heading: 0 },
  { id: 'east', label: 'East', hint: 'Whitefield · ORR · Varthur', heading: 90 },
  { id: 'south-east', label: 'South-East', hint: 'Sarjapur Road', heading: 135 },
  { id: 'south', label: 'South', hint: 'Electronic City', heading: 180 },
  { id: 'any', label: 'Anywhere good', hint: 'I am flexible', heading: null },
];
const BUDGETS = [
  { id: 'u1', label: 'Under ₹1 Cr', min: null, max: 10_000_000 },
  { id: '1-1.5', label: '₹1 – 1.5 Cr', min: 10_000_000, max: 15_000_000 },
  { id: '1.5-2', label: '₹1.5 – 2 Cr', min: 15_000_000, max: 20_000_000 },
  { id: '2+', label: '₹2 Cr and above', min: 20_000_000, max: null },
  { id: 'any', label: 'Not sure yet', min: null, max: null },
] as const;
const SEG: Record<string, string | null> = { 'buy-home': 'residential', invest: null, plot: 'plot', office: 'commercial', browsing: null };
const STEP_TITLE: Record<string, string> = {
  goal: 'What brings you here?',
  region: 'Which side of Bengaluru?',
  budget: 'A comfortable budget?',
  details: 'Where should we send your shortlist?',
};

type Answers = { goal: string; region: string; budget: string };

function matching(catalogue: CatalogueItem[], a: Partial<Answers>) {
  const seg = a.goal ? SEG[a.goal] : null;
  const budget = BUDGETS.find((b) => b.id === a.budget);
  return catalogue.filter((p) => {
    if (a.region && a.region !== 'any' && p.zone !== a.region) return false;
    if (seg === 'residential' && (p.seg !== 'residential' || p.rent)) return false;
    if (seg && seg !== 'residential' && p.seg !== seg) return false;
    if (budget && !p.rent) {
      if (budget.min != null && p.price < budget.min) return false;
      if (budget.max != null && p.price > budget.max) return false;
    }
    return true;
  });
}

function Compass({ heading }: { heading: number | null }) {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.1" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 3" />
      {heading == null ? (
        <circle cx="20" cy="20" r="4" fill="currentColor" />
      ) : (
        <g transform={`rotate(${heading} 20 20)`}>
          <path d="M20 6 L25 21 L20 18 L15 21 Z" fill="currentColor" />
          <path d="M20 34 L23 22 L20 24 L17 22 Z" fill="currentColor" opacity="0.3" />
        </g>
      )}
    </svg>
  );
}

function Tile({ selected, onPick, index, children, className = '' }: { selected: boolean; onPick: () => void; index: number; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      data-ripple
      style={{ '--i': index } as CSSProperties}
      className={`group relative flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition-[transform,border-color,background-color,box-shadow] duration-base ease-out active:scale-[0.97] sm:p-3.5 ${
        selected
          ? 'border-accent bg-accent-soft shadow-[0_16px_30px_-20px_rgb(var(--accent)/0.9)]'
          : 'border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_16px_30px_-24px_rgb(var(--shadow)/0.6)]'
      } ${className}`}
    >
      {children}
      <span className={`ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-base ${selected ? 'scale-100 border-accent bg-accent text-accent-on' : 'scale-90 border-line-strong text-transparent group-hover:scale-100'}`}>
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
    </button>
  );
}

type Props = {
  variant: 'modal' | 'inline';
  consent: ConsentCopy;
  advisorName: string;
  catalogue: CatalogueItem[];
  onClose?: () => void;
  onDone?: () => void;
  /** Inline only: leaves the thank-you screen (the page then shows the picks). */
  onFinish?: () => void;
  titleId?: string;
};

// The welcome concierge: three taps (goal, region, budget), then name and mobile. A live
// count and photos of matching homes on the left answer back with every tap.
export function ConciergeCard({ variant, consent, advisorName, catalogue, onClose, onDone, onFinish, titleId = 'concierge-title' }: Props) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Answers>({ goal: '', region: '', budget: '' });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const advance = useRef<ReturnType<typeof setTimeout>>();

  const steps = answers.goal === 'office' ? ['goal', 'region', 'details', 'done'] : ['goal', 'region', 'budget', 'details', 'done'];
  const current = steps[Math.min(step, steps.length - 1)];
  const questions = steps.length - 1;
  const matches = useMemo(() => matching(catalogue, answers), [catalogue, answers]);
  const photos = (matches.length ? matches : catalogue).slice(0, 3);
  const firstName = name.trim().split(/\s+/)[0];
  const advisorFirst = advisorName.split(' ')[0];
  const chosen = [
    GOALS.find((g) => g.id === answers.goal)?.label,
    REGIONS.find((r) => r.id === answers.region && r.id !== 'any')?.label,
    BUDGETS.find((b) => b.id === answers.budget && b.id !== 'any')?.label,
  ].filter(Boolean) as string[];

  useEffect(() => () => clearTimeout(advance.current), []);
  useEffect(() => {
    if (step === 0 && current === 'goal') return;
    body.current?.querySelector<HTMLElement>('[data-step-focus]')?.focus({ preventScroll: true });
  }, [step, current]);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };
  const pick = (key: keyof Answers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    clearTimeout(advance.current);
    advance.current = setTimeout(() => go(step + 1), 280);
  };

  const matchesHref = () => {
    const params = new URLSearchParams();
    if (answers.region && answers.region !== 'any') params.set('zone', answers.region);
    const seg = SEG[answers.goal];
    if (seg) params.set('seg', seg);
    const budget = BUDGETS.find((b) => b.id === answers.budget);
    if (budget?.min != null) params.set('min', String(budget.min));
    if (budget?.max != null) params.set('max', String(budget.max));
    return `/properties${params.toString() ? `?${params}` : ''}`;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    let utm = { source: null, medium: null, campaign: null };
    try {
      utm = JSON.parse(sessionStorage.getItem('estatenav:utm') ?? 'null') ?? utm;
    } catch {
      /* ignore */
    }
    const result = await saveWelcomeLead(visitorId(), {
      name,
      phone,
      goal: answers.goal,
      region: answers.region || 'any',
      budget: answers.budget || 'any',
      consentText: consent.text,
      consentVersion: consent.version,
      page: pathname,
      utm,
      website: trap,
    });
    setBusy(false);
    if (!result.ok) {
      setError({ field: result.field, message: result.message });
      return;
    }
    savePrefs({ goal: answers.goal, region: answers.region || 'any', budget: answers.budget || 'any', name: firstName });
    track('cta', { kind: 'welcome', zone: answers.region, budget: answers.budget });
    writeConciergeState('done');
    onDone?.();
    go(steps.length - 1);
  };

  const heading = (text: string) => (
    <h3 id={titleId} tabIndex={-1} data-step-focus className="font-serif text-[1.6rem] leading-[1.1] tracking-[-0.02em] outline-none sm:text-[1.9rem]">
      {text}
    </h3>
  );

  return (
    <div className={`grid overflow-hidden rounded-[32px] bg-surface md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${variant === 'inline' ? 'border border-line shadow-[0_50px_100px_-60px_rgb(var(--shadow)/0.6)]' : 'shadow-[0_60px_120px_-40px_rgb(0_0_0/0.6)]'}`}>
      <aside className="relative isolate flex flex-col overflow-hidden bg-forest p-5 text-forest-on sm:p-7 md:min-h-[520px] md:p-8">
        <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brass/25 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgb(var(--on-forest))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--on-forest))_1px,transparent_1px)] [background-size:40px_40px]" />
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest-on/70">
          <span aria-hidden="true" className="h-px w-8 bg-brass" /> EstateNav concierge
        </p>
        <p className="mt-3 font-serif text-[1.65rem] leading-[1.05] tracking-[-0.03em] text-forest-on sm:text-[2.1rem]">
          Tell us what you&apos;re after. <span className="text-brass">We&apos;ll do the shortlisting.</span>
        </p>

        <div className="mt-5 flex items-end gap-3 md:mt-8">
          <span className="font-serif text-[3.25rem] leading-none tracking-[-0.04em] text-forest-on sm:text-[4rem]">
            <NumberRoll value={matches.length} />
          </span>
          <span className="pb-1.5 text-sm text-forest-on/75" aria-live="polite">
            verified {matches.length === 1 ? 'home matches' : 'homes match'}
            <br className="hidden sm:block" /> {chosen.length ? 'your answers so far' : 'before you answer'}
          </span>
        </div>
        {chosen.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chosen.map((c) => (
              <li key={c} className="slide-up rounded-full bg-forest-on/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-forest-on/20">{c}</li>
            ))}
          </ul>
        )}

        <div className="relative mt-auto hidden h-[170px] md:block" aria-hidden="true">
          {photos.map((p, i) => (
            <div
              key={`${p.id}-${matches.length}`}
              className="absolute bottom-0 h-[150px] w-[46%]"
              style={{ left: `${i * 26}%`, transform: `rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -12 : 0}px)`, zIndex: i === 1 ? 3 : 2 - i }}
            >
              <div className="slide-up relative h-full w-full overflow-hidden rounded-2xl shadow-[0_20px_40px_-16px_rgb(0_0_0/0.6)] ring-4 ring-forest" style={{ animationDelay: `${i * 70}ms` }}>
                <Image src={p.img} alt="" fill sizes="200px" quality={50} className="object-cover" />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2.5 border-t border-forest-on/15 pt-4 text-xs text-forest-on/75">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-on/10 text-[11px] font-bold ring-2 ring-brass">
            {advisorName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2)}
          </span>
          <span>
            <strong className="font-semibold text-forest-on">{advisorName}</strong> · K-RERA registered agent, replies on WhatsApp
          </span>
        </p>
      </aside>

      <div ref={body} className="relative flex min-w-0 flex-col p-5 sm:p-8">
        <div className="flex items-center gap-3">
          {current !== 'done' ? (
            <>
              <p className="tabular shrink-0 text-xs font-semibold text-ink-muted">
                Step {Math.min(step + 1, questions)} of {questions}
              </p>
              <ol className="flex flex-1 gap-1.5" aria-hidden="true">
                {Array.from({ length: questions }, (_, i) => (
                  <li key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className={`block h-full origin-left rounded-full bg-gradient-to-r from-accent to-brass transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${i <= step ? 'scale-x-100' : 'scale-x-0'}`} />
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <span className="flex-1" />
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink" aria-label="Close">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div key={current} className={`mt-5 flex flex-1 flex-col ${dir === 1 ? 'step-in' : 'step-back'}`}>
          {current === 'goal' && (
            <>
              {heading(STEP_TITLE.goal)}
              <p className="mt-1.5 text-sm text-ink-muted">Pick one. About 20 seconds in all, no sign-up.</p>
              <div className="stagger mt-5 grid gap-2.5 sm:grid-cols-2">
                {GOALS.map((g, i) => (
                  <Tile key={g.id} index={i} selected={answers.goal === g.id} onPick={() => pick('goal', g.id)} className={g.id === 'browsing' ? 'sm:col-span-2' : ''}>
                    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-base ${answers.goal === g.id ? 'bg-accent text-accent-on' : 'bg-sand text-forest group-hover:bg-accent group-hover:text-accent-on dark:text-brass'}`}>
                      <NeedIcon name={g.icon} className="h-[22px] w-[22px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{g.label}</span>
                      <span className="block truncate text-xs text-ink-muted">{g.hint}</span>
                    </span>
                  </Tile>
                ))}
              </div>
            </>
          )}

          {current === 'region' && (
            <>
              {heading(STEP_TITLE.region)}
              <p className="mt-1.5 text-sm text-ink-muted">West and Central Bengaluru are coming soon.</p>
              <div className="stagger mt-5 grid grid-cols-2 gap-2.5">
                {REGIONS.map((r, i) => {
                  const n = matching(catalogue, { ...answers, region: r.id, budget: '' }).length;
                  return (
                    <Tile key={r.id} index={i} selected={answers.region === r.id} onPick={() => pick('region', r.id)} className={r.id === 'any' ? 'col-span-2' : ''}>
                      <span className={`shrink-0 transition-colors ${answers.region === r.id ? 'text-accent-ink' : 'text-forest dark:text-brass'}`}>
                        <Compass heading={r.heading} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{r.label}</span>
                        <span className="block truncate text-xs text-ink-muted">{n} {n === 1 ? 'home' : 'homes'} · {r.hint}</span>
                      </span>
                    </Tile>
                  );
                })}
              </div>
            </>
          )}

          {current === 'budget' && (
            <>
              {heading(STEP_TITLE.budget)}
              <p className="mt-1.5 text-sm text-ink-muted">Developer guide prices; your advisor confirms the final sheet.</p>
              <div className="stagger mt-5 grid gap-2.5 sm:grid-cols-2">
                {BUDGETS.map((b, i) => {
                  const n = matching(catalogue, { ...answers, budget: b.id }).length;
                  return (
                    <Tile key={b.id} index={i} selected={answers.budget === b.id} onPick={() => pick('budget', b.id)} className={b.id === 'any' ? 'sm:col-span-2' : ''}>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{b.label}</span>
                        <span className="block text-xs text-ink-muted">{n} {n === 1 ? 'match' : 'matches'}</span>
                      </span>
                    </Tile>
                  );
                })}
              </div>
            </>
          )}

          {current === 'details' && (
            <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
              {heading(STEP_TITLE.details)}
              <p className="mt-1.5 text-sm text-ink-muted">
                {matches.length > 0 ? `${matches.length} ${matches.length === 1 ? 'home fits' : 'homes fit'} so far. ` : 'Nothing listed yet, but we can look for you. '}
                {advisorFirst} will share them on WhatsApp.
              </p>
              <div className="mt-5 grid gap-3">
                <label className="relative block">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder=" "
                    aria-invalid={error?.field === 'name'}
                    className="peer h-[60px] w-full rounded-2xl border border-line bg-surface px-4 pt-5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-base focus:border-accent-ink focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.12)] aria-[invalid=true]:border-danger"
                  />
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-ink-muted transition-all duration-base peer-focus:top-[17px] peer-focus:text-[11px] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-[17px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold">
                    Your name
                  </span>
                </label>
                <label className="relative block">
                  <span className="pointer-events-none absolute left-4 top-[31px] text-base font-semibold text-ink">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder=" "
                    aria-invalid={error?.field === 'phone'}
                    className="peer h-[60px] w-full rounded-2xl border border-line bg-surface pl-[3.4rem] pr-4 pt-5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-base focus:border-accent-ink focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.12)] aria-[invalid=true]:border-danger"
                  />
                  <span className="pointer-events-none absolute left-4 top-[17px] text-[11px] font-semibold text-ink-muted">Mobile (WhatsApp)</span>
                </label>
                <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
              </div>
              {error && (
                <p role="alert" className="slide-up mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  {error.message}
                </p>
              )}
              <button type="submit" disabled={busy} className="btn-primary mt-5 min-h-[56px] w-full text-[0.95rem] disabled:opacity-70">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {busy ? 'Saving…' : 'Show my matches'}
                {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="mt-3 flex gap-2 text-[11px] leading-relaxed text-ink-muted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span>
                  {consent.privacyNote} {consent.text}
                </span>
              </p>
            </form>
          )}

          {current === 'done' && (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <svg viewBox="0 0 52 52" className="draw-check h-20 w-20 text-accent" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="currentColor" opacity="0.12" />
                <path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {heading(`Thank you${firstName ? `, ${firstName}` : ''}.`)}
              <p className="mt-2 max-w-sm text-sm text-ink-muted">
                {matches.length > 0 ? `${matches.length} ${matches.length === 1 ? 'home matches' : 'homes match'} what you told us.` : 'We will look for homes that match.'} {advisorName} will reach you on WhatsApp or a call.
              </p>
              <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    startNavProgress();
                    router.push(matchesHref());
                  }}
                  className="btn-primary min-h-[54px]"
                >
                  {matches.length > 0 ? `See my ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}` : 'Browse all homes'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                {(onClose || onFinish) && (
                  <button type="button" onClick={onClose ?? onFinish} className="btn-ghost">
                    {onClose ? 'Keep browsing' : 'Show my picks here'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {current !== 'done' && (
          <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
            <button type="button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-ink-muted transition-opacity hover:text-ink disabled:pointer-events-none disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
            {onClose ? (
              <button type="button" onClick={onClose} className="min-h-[44px] font-semibold text-ink-muted hover:text-ink">
                I&apos;ll browse first
              </button>
            ) : (
              <span className="text-xs text-ink-muted">Saved securely. Never sold.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
