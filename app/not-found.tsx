import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="sheet-label">Sheet 404 · Not on the plan</p>
      <h1 className="mt-2 font-serif text-3xl">We couldn’t find that page</h1>
      <p className="mt-2 text-ink-muted">The link may be out of date, or the listing has been archived.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/properties" className="btn-primary">Browse listings</Link>
        <Link href="/" className="btn-secondary">Home</Link>
      </div>
    </main>
  );
}
