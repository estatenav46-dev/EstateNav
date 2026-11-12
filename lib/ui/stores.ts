'use client';

import { useSyncExternalStore } from 'react';

// Small browser stores shared across the header, cards, dock and pages. Compare and recent
// searches persist in localStorage; the wishlist is saved to the signed-in user's account.

type Listener = () => void;

function createStore<T>(initial: T, storageKey?: string) {
  let value = initial;
  let loaded = !storageKey;
  const listeners = new Set<Listener>();

  const load = () => {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(storageKey!);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* storage can be unavailable in private modes */
    }
  };

  const set = (next: T | ((current: T) => T)) => {
    load();
    value = typeof next === 'function' ? (next as (current: T) => T)(value) : next;
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        /* ignore quota and privacy-mode errors */
      }
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        loaded = false;
        load();
        listener();
      }
    };
    if (storageKey) window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      if (storageKey) window.removeEventListener('storage', onStorage);
    };
  };

  const get = () => {
    load();
    return value;
  };

  const useValue = () => useSyncExternalStore(subscribe, get, () => initial);
  return { get, set, subscribe, useValue };
}

// The wishlist belongs to the signed-in user (see lib/ui/wishlist.ts); this is its in-memory copy.
export const shortlistStore = createStore<string[]>([]);
/** Why the sign-in dialog opened (e.g. to save a home), shown above the form. */
export const authPromptStore = createStore<{ reason: string }>({ reason: '' });
export type CompareItem = { id: string; slug: string; title: string };
export const compareStore = createStore<CompareItem[]>([], 'estatenav:compare');
export const recentSearchStore = createStore<{ label: string; href: string }[]>([], 'estatenav:recent');
/** Whether the homepage hero search is on screen; the header shows its compact pill when it is not. */
export const heroSearchStore = createStore<{ visible: boolean; summary: string }>({ visible: true, summary: '' });

export const MAX_COMPARE = 3;



export function toggleCompare(item: CompareItem): boolean {
  let accepted = true;
  compareStore.set((items) => {
    if (items.some((x) => x.id === item.id)) return items.filter((x) => x.id !== item.id);
    if (items.length >= MAX_COMPARE) {
      accepted = false;
      return items;
    }
    return [...items, item];
  });
  return accepted;
}

export function rememberSearch(entry: { label: string; href: string }) {
  recentSearchStore.set((list) => [entry, ...list.filter((e) => e.href !== entry.href)].slice(0, 5));
}

/** Opens the compare sheet from anywhere (tray button, shortlist page). */
export const compareSheetStore = createStore<boolean>(false);

/** Opens the property lead sheet (site visit, price sheet) from anywhere on a detail page. */
export const leadSheetStore = createStore<{ open: boolean; intent: 'site-visit' | 'price-sheet'; message: string }>({ open: false, intent: 'site-visit', message: '' });
export const openLeadSheet = (intent: 'site-visit' | 'price-sheet', message = '') => leadSheetStore.set({ open: true, intent, message });
