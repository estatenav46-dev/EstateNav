'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LazySheet as Sheet } from '@/components/ui/LazySheet';
import { CompareTable } from './CompareTable';
import { getPropertiesByIds } from '@/app/actions/enquiries';
import type { Property } from '@/lib/data/types';
import { compareSheetStore, compareStore, MAX_COMPARE, toggleCompare } from '@/lib/ui/stores';

// Slides up once something is ticked for comparison; the table loads on demand.
export function CompareTray() {
  const pathname = usePathname() ?? '';
  const items = compareStore.useValue();
  const open = compareSheetStore.useValue();
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setProperties(null);
    getPropertiesByIds(items.map((i) => i.id)).then((list) => !cancelled && setProperties(list));
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  if (pathname.startsWith('/admin')) return null;
  const show = items.length > 0;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-3 md:bottom-5"
        style={{ transform: show ? 'none' : 'translateY(140%)', opacity: show ? 1 : 0, transition: 'transform var(--dur-slow) var(--ease), opacity var(--dur-base) var(--ease)' }}
        aria-hidden={!show}
      >
        <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2 pl-4 shadow-[0_18px_40px_-18px_rgb(var(--shadow)/0.45)] backdrop-blur-md">
          <p className="shrink-0 text-sm">
            Compare <span className="font-mono text-ink-muted">{items.length}/{MAX_COMPARE}</span>
          </p>
          <ul className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => toggleCompare(item)} className="chip max-w-[200px] text-2xs" aria-label={`Remove ${item.title} from compare`} tabIndex={show ? 0 : -1}>
                  <span className="truncate">{item.title}</span>
                  <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" disabled={items.length < 2} onClick={() => compareSheetStore.set(true)} className="btn-primary shrink-0 disabled:opacity-50" tabIndex={show ? 0 : -1}>
            {items.length < 2 ? 'Pick one more' : 'Compare'}
          </button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={(value) => compareSheetStore.set(value)} title="Compare projects" description="Rows that differ are marked." fullHeight>
        <div className="mx-auto max-w-5xl">
          {properties ? <CompareTable properties={properties} /> : <div className="skeleton h-96 rounded-xl" />}
          <button type="button" onClick={() => { compareStore.set([]); compareSheetStore.set(false); }} className="btn-ghost mt-4">
            Clear comparison
          </button>
        </div>
      </Sheet>
    </>
  );
}
