'use client';

import { createStore } from './stores';

// Consent, visitor id and personalisation signals.
// - Nothing is tracked until the visitor chooses "Accept all" in the cookie banner.
// - Signals are batched to /api/track (Firestore visitors/{id}) and mirrored on the device
//   as a small interest profile used for the "Picked for you" rail.

export type Consent = { analytics: boolean; decidedAt: string; version: string };
export const CONSENT_VERSION = '2026-11';
const CONSENT_KEY = 'estatenav:consent';
const VID_KEY = 'estatenav:vid';
const PROFILE_KEY = 'estatenav:profile';
const PREFS_KEY = 'estatenav:prefs';

/** undefined = not read yet, null = no decision. */
export const consentStore = createStore<Consent | null | undefined>(undefined);
export const cookieSettingsStore = createStore<boolean>(false);

export type Profile = { interest: Record<string, Record<string, number>>; viewed: string[] };
export type Prefs = { goal: string; region: string; budget: string; name?: string };
export const profileStore = createStore<Profile>({ interest: {}, viewed: [] });
export const prefsStore = createStore<Prefs | null>(null);
/** Opens the welcome concierge dialog from anywhere (hero prompt, home brief section). */
export const conciergeStore = createStore<boolean>(false);

const read = <T,>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) */
  }
};
const remove = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export function loadVisitorState() {
  const consent = read<Consent>(CONSENT_KEY);
  consentStore.set(consent && consent.version === CONSENT_VERSION ? consent : null);
  if (consent?.analytics) profileStore.set(read<Profile>(PROFILE_KEY) ?? { interest: {}, viewed: [] });
  prefsStore.set(read<Prefs>(PREFS_KEY));
}

export const analyticsAllowed = () => Boolean(consentStore.get()?.analytics);

export function setConsent(analytics: boolean) {
  const value: Consent = { analytics, decidedAt: new Date().toISOString(), version: CONSENT_VERSION };
  write(CONSENT_KEY, value);
  consentStore.set(value);
  cookieSettingsStore.set(false);
  if (!analytics) {
    // Withdrawing consent clears the personalisation data kept on this device.
    queue = [];
    remove(PROFILE_KEY);
    profileStore.set({ interest: {}, viewed: [] });
  }
}

/** Random id for this browser. Created only when needed (consented tracking or a submitted form). */
export function visitorId(): string {
  let id = read<string>(VID_KEY);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    write(VID_KEY, id);
  }
  return id;
}

export function savePrefs(prefs: Prefs) {
  write(PREFS_KEY, prefs);
  prefsStore.set(prefs);
}

// ---- Event queue ----
type EventType = 'page_view' | 'property_view' | 'search' | 'filter' | 'region' | 'wishlist' | 'compare' | 'cta';
type QueuedEvent = { type: EventType; path: string; at: string; data?: Record<string, string | number | boolean> };
let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

export function track(type: EventType, data?: Record<string, string | number | boolean | null | undefined>) {
  if (!analyticsAllowed()) return;
  const clean = data ? Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 160) : v])) as Record<string, string | number | boolean> : undefined;
  queue.push({ type, path: `${window.location.pathname}${window.location.search}`.slice(0, 200), at: new Date().toISOString(), data: clean });
  updateProfile(type, clean);
  if (queue.length >= 20) flush();
  else {
    clearTimeout(timer);
    timer = setTimeout(() => flush(), 5000);
  }
}

export function flush(useBeacon = false) {
  if (!queue.length || !analyticsAllowed()) return;
  const batch = queue.splice(0, 30);
  const body = JSON.stringify({ vid: visitorId(), events: batch });
  try {
    if (useBeacon && navigator.sendBeacon) navigator.sendBeacon('/api/track', body);
    else void fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  } catch {
    /* tracking must never break the page */
  }
  if (queue.length) flush(useBeacon);
}

function updateProfile(type: EventType, data?: Record<string, string | number | boolean>) {
  const profile = { ...profileStore.get(), interest: { ...profileStore.get().interest } };
  for (const key of ['zone', 'seg', 'budget', 'bhk', 'corridor']) {
    const value = data?.[key];
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const bucket = { ...(profile.interest[key] ?? {}) };
    bucket[String(value)] = (bucket[String(value)] ?? 0) + (type === 'property_view' ? 2 : 1);
    profile.interest[key] = bucket;
  }
  if (type === 'property_view' && typeof data?.id === 'string') profile.viewed = [data.id, ...profile.viewed.filter((v) => v !== data.id)].slice(0, 12);
  profileStore.set(profile);
  write(PROFILE_KEY, profile);
}

/** Highest-scoring value for an interest key, e.g. top('zone') -> 'east'. */
export function topInterest(profile: Profile, key: string): string | null {
  const entries = Object.entries(profile.interest[key] ?? {});
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/** Price bucket used in signals (same ids as the welcome form budget). */
export function budgetBucket(price: number, rent = false): string {
  if (rent) return 'rent';
  if (price < 10_000_000) return 'u1';
  if (price < 15_000_000) return '1-1.5';
  if (price < 20_000_000) return '1.5-2';
  return '2+';
}
