'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="sheet-label">Something went wrong</p>
      <h1 className="mt-2 font-serif text-3xl">This page couldn’t load</h1>
      <p className="mt-2 text-ink-muted">Please try again. Listings and the advisor are still a tap away.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <a href="/properties" className="btn-secondary">Browse listings</a>
      </div>
    </main>
  );
}
