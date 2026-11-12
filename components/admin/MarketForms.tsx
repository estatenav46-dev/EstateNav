'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { deleteMarketSnapshot, saveMarketSnapshot } from '@/app/actions/admin';
import { marketSnapshotSchema } from '@/lib/data/schemas';
import type { Corridor, MarketSnapshot } from '@/lib/data/types';

const input = 'field min-h-[40px] text-sm';

// One editable market figure. The schema requires a source and an as-of date, so nothing
// unsourced can be saved; the home ticker and explore page show only what is saved here.
export function MarketSnapshotForm({ snapshot, corridors, isNew = false }: { snapshot: MarketSnapshot; corridors: Corridor[]; isNew?: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<MarketSnapshot>({ resolver: zodResolver(marketSnapshotSchema), defaultValues: snapshot });
  const e = formState.errors;

  const save = async (values: MarketSnapshot) => {
    const record = isNew ? { ...values, id: `${values.corridorId}-${values.asOf.slice(0, 10)}` } : values;
    const result = await saveMarketSnapshot(record);
    setNote(result.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: [result.message, ...(result.issues ?? [])].join(' ') });
    if (result.ok) {
      if (isNew) reset(snapshot);
      router.refresh();
    }
  };
  const remove = async () => {
    if (!window.confirm('Remove this market figure from the site?')) return;
    const result = await deleteMarketSnapshot(snapshot.id);
    if (result.ok) router.refresh();
    else setNote({ ok: false, text: result.message });
  };

  return (
    <form onSubmit={handleSubmit(save)} className="panel grid gap-3 p-4 sm:grid-cols-[1.2fr_1fr_0.8fr_1.6fr_1fr_auto] sm:items-end" noValidate>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Corridor</span>
        <select className={input} {...register('corridorId')}>
          {corridors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Avg ₹/sq.ft</span>
        <input type="number" step="1" className={input} {...register('avgPricePerSqft', { valueAsNumber: true })} />
        {e.avgPricePerSqft && <span className="mt-1 block text-2xs text-danger">Enter a positive amount</span>}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">YoY %</span>
        <input type="number" step="0.1" className={input} {...register('yoyChangePct', { valueAsNumber: true })} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Source</span>
        <input className={input} placeholder="e.g. Sub-registrar guidance values" {...register('source')} />
        {e.source && <span className="mt-1 block text-2xs text-danger">A source is required</span>}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">As of</span>
        <input type="date" className={input} {...register('asOf')} />
        {e.asOf && <span className="mt-1 block text-2xs text-danger">{e.asOf.message}</span>}
      </label>
      <div className="flex items-center gap-1">
        <button type="submit" className="btn-secondary min-h-[40px] px-4">{isNew ? 'Add' : 'Save'}</button>
        {!isNew && (
          <button type="button" onClick={remove} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-surface-2" aria-label="Remove figure">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {note && <p role="status" className={`text-sm sm:col-span-6 ${note.ok ? 'text-accent-ink' : 'text-danger'}`}>{note.text}</p>}
    </form>
  );
}
