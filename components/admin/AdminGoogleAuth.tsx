'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getClientAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

/**
 * Google Auth scaffold for EstateNav Admin.
 * Can be enabled by setting NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true in .env.local.
 * While false or unset, local testing bypasses login seamlessly.
 */
export function AdminGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

  useEffect(() => {
    if (!isEnabled) return;
    try {
      const auth = getClientAuth();
      return onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
    } catch {
      // Firebase auth uninitialized
    }
  }, [isEnabled]);

  // If Google Auth is disabled for local testing, don't show the gate
  if (!isEnabled) {
    return null;
  }

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign-in failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getClientAuth();
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed', err);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-surface-2 p-3 text-accent-ink">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-2xl">EstateNav Staff Login</h1>
        <p className="mt-2 text-xs text-ink-muted">Sign in with your Google account to access listings and enquiries.</p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="btn-primary mt-6 min-h-[44px] w-full flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-2xs text-ink-muted">
      <span>{user.email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-danger hover:underline flex items-center gap-1"
      >
        <LogOut className="h-3 w-3" />
        Sign out
      </button>
    </div>
  );
}

