'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { authPromptStore } from '@/lib/ui/stores';
import { clearPendingWishlist } from '@/lib/ui/wishlist';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const prompt = authPromptStore.useValue();

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    authPromptStore.set({ reason: '' });
    setError(null);
    setResetSent(false);
  };

  // Closing without signing in drops the home that was waiting to be saved.
  const dismiss = () => {
    clearPendingWishlist();
    handleClose();
  };

  const getFriendlyError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 'Invalid email or password.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists. Try signing in.';
        case 'auth/weak-password':
          return 'Password must be at least 6 characters long.';
        case 'auth/popup-closed-by-user':
          return 'Google sign-in popup was closed before completion.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        default:
          return (err as { message?: string }).message || 'Authentication failed. Please try again.';
      }
    }
    return 'An unexpected error occurred.';
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        handleClose();
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        handleClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-fade-in">
      <div className="panel bg-surface max-w-md w-full p-6 shadow-2xl relative border-line">
        {/* Close Button */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-surface-2 text-ink-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          {prompt.reason && (
            <p role="status" className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-xs font-medium text-accent-ink">{prompt.reason}</p>
          )}
          <span className="font-mono text-2xs uppercase tracking-wider text-accent-ink font-semibold">
            EstateNav Account
          </span>
          <h2 className="text-xl font-bold tracking-tight text-ink mt-0.5">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {mode === 'signin' && 'Sign in to access your saved shortlisted properties and advisory notes.'}
            {mode === 'signup' && 'Join EstateNav to track Hyderabad verified projects and commute radars.'}
            {mode === 'forgot' && 'Enter your email address and we will send you a password reset link.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Reset Email Sent Confirmation */}
        {resetSent && (
          <div className="mb-4 p-3 rounded-lg bg-accent-soft border border-accent-ink/20 text-accent-ink text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Reset link sent!</p>
              <p className="mt-0.5 text-ink-muted">Please check your inbox at {email}.</p>
            </div>
          </div>
        )}

        {mode !== 'forgot' && (
          <>
            {/* Google One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-line bg-surface hover:bg-surface-2 text-ink text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-surface px-2 text-ink-muted">Or continue with email</span>
              </div>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-2xs font-semibold text-ink uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-ink-muted absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-surface text-ink placeholder:text-ink-muted/40 border border-line rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-2xs font-semibold text-ink uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-surface text-ink placeholder:text-ink-muted/40 border border-line rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-2xs font-semibold text-ink uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setResetSent(false);
                    }}
                    className="text-2xs text-accent-ink hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-surface text-ink placeholder:text-ink-muted/40 border border-line rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-ink-muted hover:text-ink focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode switcher footer */}
        <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-muted">
          {mode === 'signin' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-semibold text-accent-ink hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-semibold text-accent-ink hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setResetSent(false);
                }}
                className="font-semibold text-accent-ink hover:underline ml-1"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

