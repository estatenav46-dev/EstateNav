'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Archive, Copy, Pencil, Plus, Star } from 'lucide-react';
import type { Corridor, Property, PublishStatus } from '@/lib/data/types';
import { duplicateProperty, setPropertyFeatured, setPropertyStatus } from '@/app/actions/admin';
import { SEGMENT_LABEL } from '@/lib/property';

const STATUS_STYLE: Record<PublishStatus, string> = {
  published: 'bg-accent-soft text-accent-ink',
  draft: 'bg-surface-2 text-ink',
  archived: 'bg-surface-2 text-ink-muted line-through',
};

export function PropertiesTable({ properties, corridors }: { properties: Property[]; corridors: Corridor[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [segment, setSegment] = useState('');
  const [corridor, setCorridor] = useState('');
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');

  const rows = useMemo(
    () =>
      properties
        .filter((p) => !q || `${p.title} ${p.locality} ${p.slug}`.toLowerCase().includes(q.toLowerCase()))
        .filter((p) => !status || p.status === status)
        .filter((p) => !segment || p.segment === segment)
        .filter((p) => !corridor || p.corridorId === corridor)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.featuredRank - b.featuredRank),
    [properties, q, status, segment, corridor],
  );

  const act = (fn: () => Promise<{ ok: boolean; message?: string }>, done: string) =>
    start(async () => {
      const result = await fn();
      setMessage(result.ok ? done : result.message ?? 'Failed');
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto font-serif text-2xl">Properties</h1>
        <Link href="/admin/properties/new" className="btn-primary min-h-[40px] px-4">
          <Plus className="h-4 w-4" aria-hidden="true" /> New property
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, locality or slug" aria-label="Search properties" className="field min-h-[40px] max-w-xs text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="field min-h-[40px] w-auto text-sm">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} aria-label="Segment" className="field min-h-[40px] w-auto text-sm">
          <option value="">All segments</option>
          {(['residential', 'plot', 'commercial'] as const).map((s) => (
            <option key={s} value={s}>{SEGMENT_LABEL[s]}</option>
          ))}
        </select>
        <select value={corridor} onChange={(e) => setCorridor(e.target.value)} aria-label="Corridor" className="field min-h-[40px] w-auto text-sm">
          <option value="">All corridors</option>
          {corridors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <p role="status" className="min-h-[1.25rem] text-2xs text-ink-muted">{pending ? 'Saving…' : message}</p>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="text-left text-2xs text-ink-muted">
            <tr className="border-b border-line">
              <th className="w-20 px-3 py-2 font-normal">Cover</th>
              <th className="px-3 py-2 font-normal">Title</th>
              <th className="px-3 py-2 font-normal">Segment</th>
              <th className="px-3 py-2 font-normal">Status</th>
              <th className="px-3 py-2 font-normal">Featured</th>
              <th className="px-3 py-2 font-normal">Updated</th>
              <th className="px-3 py-2 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <span className="relative block h-12 w-16 overflow-hidden rounded-md bg-surface-2">
                    <Image src={p.media.cover.url} alt="" fill sizes="64px" className="object-cover" unoptimized={p.media.cover.url.startsWith('blob:')} />
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/properties/${p.id}`} className="font-medium hover:text-accent-ink">{p.title}</Link>
                  <p className="text-2xs text-ink-muted">{p.locality} · {p.corridorName}</p>
                </td>
                <td className="px-3 py-2">{SEGMENT_LABEL[p.segment]}{p.transaction === 'rent' ? ' · rent' : ''}</td>
                <td className="px-3 py-2">
                  <select
                    value={p.status}
                    onChange={(e) => act(() => setPropertyStatus(p.id, e.target.value as PublishStatus), `${p.title} is now ${e.target.value}.`)}
                    aria-label={`Status of ${p.title}`}
                    className={`rounded-full border-0 px-2.5 py-1 text-2xs ${STATUS_STYLE[p.status]}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => act(() => setPropertyFeatured(p.id, !p.featured), p.featured ? 'Removed from featured.' : 'Featured.')} aria-pressed={p.featured} aria-label={`${p.featured ? 'Unfeature' : 'Feature'} ${p.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-2">
                    <Star className={`h-4 w-4 ${p.featured ? 'fill-[rgb(var(--accent))] text-accent-ink' : 'text-ink-muted'}`} aria-hidden="true" />
                  </button>
                </td>
                <td className="px-3 py-2 font-mono text-2xs text-ink-muted">{p.updatedAt}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/properties/${p.id}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-2" aria-label={`Edit ${p.title}`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button type="button" onClick={() => act(() => duplicateProperty(p.id), 'Duplicated as a draft.')} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-2" aria-label={`Duplicate ${p.title}`}>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" disabled={p.status === 'archived'} onClick={() => act(() => setPropertyStatus(p.id, 'archived'), 'Archived.')} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-40" aria-label={`Archive ${p.title}`}>
                      <Archive className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-ink-muted">No properties match.</p>}
      </div>
    </div>
  );
}
