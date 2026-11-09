'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Check, Loader2 } from 'lucide-react';
import { seedFirestoreDatabase } from '@/app/actions/admin';

export function SeedDatabaseButton({ dataSource }: { dataSource: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!confirm('This will seed the Firestore database with initial properties, developers, and corridors. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await seedFirestoreDatabase();
      if (res.ok) {
        setMessage(`Successfully seeded ${res.data.properties} properties to Firestore!`);
        router.refresh();
      } else {
        setMessage(`Error: ${res.message}`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to seed database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium flex items-center gap-2">
          <Database className="h-4 w-4 text-accent-ink" />
          Firestore Database Sync
        </p>
        <p className="text-2xs text-ink-muted">
          Current data source: <span className="font-mono font-bold">{dataSource}</span>. Seed initial verified listings and corridors directly to your Firestore project.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {message && (
          <span className="text-2xs text-accent-ink font-medium">
            {message}
          </span>
        )}
        <button
          type="button"
          onClick={handleSeed}
          disabled={loading}
          className="btn-secondary min-h-[36px] px-3 text-xs flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Seeding Firestore...
            </>
          ) : (
            <>
              <Database className="h-3.5 w-3.5" />
              Import Seed to Firestore
            </>
          )}
        </button>
      </div>
    </div>
  );
}

