'use client';

import type { User } from 'firebase/auth';
import { loadWishlist, saveWishlist } from '@/app/actions/wishlist';
import { authPromptStore, shortlistStore } from './stores';

// Wishlist rules: only signed-in visitors can save homes. The list is stored on the account
// (users/{uid}.shortlist via a token-checked server action) and cached on the device per user.
const SERVER = process.env.NEXT_PUBLIC_DATA_SOURCE === 'firestore';
const LEGACY_KEY = 'estatenav:shortlist';
const cacheKey = (uid: string) => `estatenav:wishlist:${uid}`;
const REASON = 'Sign in to save homes to your wishlist. It stays with your account on every device.';

let user: User | null = null;
let ready = false;
let pending: string[] = [];
let openSignIn: () => void = () => {};
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const readLocal = (key: string): string[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

async function persist() {
  const current = user;
  if (!current) return;
  const ids = shortlistStore.get();
  try {
    window.localStorage.setItem(cacheKey(current.uid), JSON.stringify(ids));
  } catch {
    /* storage can be unavailable in private modes */
  }
  if (!SERVER) return;
  try {
    await saveWishlist(await current.getIdToken(), ids);
  } catch (error) {
    console.warn('Wishlist kept on this device; saving to the account failed.', error);
  }
}

const schedulePersist = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 400);
};

/** Called by WishlistSync whenever the signed-in user changes. */
export async function syncWishlist(next: User | null, signIn: () => void) {
  openSignIn = signIn;
  if (next?.uid === user?.uid && ready) return;
  user = next;
  ready = false;
  if (!next) {
    shortlistStore.set([]);
    return;
  }
  let ids = readLocal(cacheKey(next.uid));
  if (SERVER) {
    try {
      ids = await loadWishlist(await next.getIdToken());
    } catch (error) {
      console.warn('Could not load the account wishlist; using this device’s copy.', error);
    }
  }
  if (user?.uid !== next.uid) return;
  // Homes hearted on this device before accounts existed, and any tapped while signing in.
  const legacy = readLocal(LEGACY_KEY);
  const merged = Array.from(new Set([...ids, ...legacy, ...pending]));
  pending = [];
  shortlistStore.set(merged);
  ready = true;
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
  if (merged.length !== ids.length) schedulePersist();
}

/** Heart button: asks guests to sign in first (the home is saved once they do). */
export function toggleWishlist(id: string): boolean {
  if (!user || !ready) {
    if (!pending.includes(id)) pending.push(id);
    if (!user) {
      authPromptStore.set({ reason: REASON });
      openSignIn();
    }
    return false;
  }
  shortlistStore.set((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  schedulePersist();
  return true;
}

/** Adds several homes at once (e.g. a shared shortlist), with the same sign-in rule. */
export function addToWishlist(ids: string[]) {
  if (!user || !ready) {
    pending = Array.from(new Set([...pending, ...ids]));
    if (!user) {
      authPromptStore.set({ reason: REASON });
      openSignIn();
    }
    return;
  }
  shortlistStore.set((current) => Array.from(new Set([...current, ...ids])));
  schedulePersist();
}

/** Dismissing the sign-in dialog drops the home that was waiting to be saved. */
export function clearPendingWishlist() {
  if (!user) pending = [];
}
