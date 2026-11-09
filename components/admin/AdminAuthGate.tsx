'use client';

import { useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { LogIn, LogOut, ShieldCheck, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

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

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Bypass setting: if NEXT_PUBLIC_REQUIRE_AUTH is not 'true', allow local preview
  const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true';

  useEffect(() => {
    try {
      const auth = getClientAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  // If auth is bypassed for local testing, render directly
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Initial auth checking state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
      </div>
    );
  }

  // Handlers
  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setActionLoading(true);
    setError(null);
    const auth = getClientAuth();

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      // Make common Firebase auth errors friendly
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getClientAuth();
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
    }
  };

  // If user is authenticated, render the admin layout with signout bar
  if (user) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-surface px-4 py-2 text-2xs">
          <span className="text-ink-muted">
            Signed in as: <strong className="text-ink font-mono">{user.email}</strong>
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-danger hover:bg-surface-2 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Not authenticated: Show Login Gate
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl">EstateNav Staff Login</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Sign in to manage listings, developers, corridors, and customer inquiries.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Google Sign-In */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={actionLoading}
            className="btn-secondary min-h-[44px] w-full flex items-center justify-center gap-2.5 font-medium"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <span className="relative bg-surface px-2 text-2xs uppercase tracking-wider text-ink-muted">
            or with email
          </span>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-2xs font-medium text-ink-muted mb-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@estatenav.in"
                className="field min-h-[40px] pl-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-medium text-ink-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field min-h-[40px] pl-9 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="btn-primary min-h-[42px] w-full flex items-center justify-center gap-2 text-sm mt-2 font-medium"
          >
            {actionLoading ? (
              'Please wait...'
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" /> Create Staff Account
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In with Email
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-2xs text-accent-ink hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : 'Need a new account? Create one with email'}
          </button>
        </div>
      </div>
    </main>
  );
}

// Re-export for any existing imports
export const AdminGoogleAuth = AdminAuthGate;

