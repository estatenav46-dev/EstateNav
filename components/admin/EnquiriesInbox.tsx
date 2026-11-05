'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Download, MessageCircle } from 'lucide-react';
import type { Enquiry, EnquiryStatus } from '@/lib/data/types';
import { updateEnquiry } from '@/app/actions/admin';
import { Sheet } from '@/components/ui/Sheet';
import { whatsAppLink } from '@/lib/contact';
import { INTENT_LABEL } from '@/lib/property';

const STATUSES: EnquiryStatus[] = ['new', 'contacted', 'visit-scheduled', 'closed', 'spam'];
const PILL: Record<EnquiryStatus, string> = {
  new: 'bg-accent text-accent-on',
  contacted: 'bg-accent-soft text-accent-ink',
  'visit-scheduled': 'bg-surface-2 text-ink ring-1 ring-accent-ink',
  closed: 'bg-surface-2 text-ink-muted',
  spam: 'bg-surface-2 text-danger',
};
const label = (s: EnquiryStatus) => s.replace('-', ' ');

function toCsv(rows: Enquiry[]) {
  const cols: (keyof Enquiry)[] = ['createdAt', 'name', 'phone', 'email', 'intent', 'preferredDate', 'propertyTitle', 'source', 'status', 'assignedTo', 'message', 'notes', 'consentVersion', 'consentAt'];
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
}

export function EnquiriesInbox({ enquiries, advisorName }: { enquiries: Enquiry[]; advisorName: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [intent, setIntent] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [pending, start] = useTransition();
  const rows = useMemo(
    () =>
      enquiries
        .filter((e) => !status || e.status === status)
        .filter((e) => !intent || e.intent === intent)
        .filter((e) => !q || `${e.name} ${e.phone} ${e.propertyTitle ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    [enquiries, status, intent, q],
  );
  const open = enquiries.find((e) => e.id === openId) ?? null;

  const change = (id: string, patch: Parameters<typeof updateEnquiry>[1]) =>
    start(async () => {
      await updateEnquiry(id, patch);
      router.refresh();
    });

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `estatenav-enquiries-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto font-serif text-2xl">Enquiries</h1>
        <button type="button" onClick={exportCsv} className="btn-secondary min-h-[40px] px-4">
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or property" aria-label="Search enquiries" className="field min-h-[40px] max-w-xs text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="field min-h-[40px] w-auto text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{label(s)}</option>)}
        </select>
        <select value={intent} onChange={(e) => setIntent(e.target.value)} aria-label="Intent" className="field min-h-[40px] w-auto text-sm">
          <option value="">All intents</option>
          {Object.entries(INTENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="text-left text-2xs text-ink-muted">
            <tr className="border-b border-line">
              <th className="px-3 py-2 font-normal">Received</th>
              <th className="px-3 py-2 font-normal">Name</th>
              <th className="px-3 py-2 font-normal">Phone</th>
              <th className="px-3 py-2 font-normal">Intent</th>
              <th className="px-3 py-2 font-normal">Property</th>
              <th className="px-3 py-2 font-normal">Source</th>
              <th className="px-3 py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2" onClick={() => { setOpenId(e.id); setNotes(e.notes); }}>
                <td className="px-3 py-2.5 font-mono text-2xs">{new Date(e.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="px-3 py-2.5">
                  <button type="button" className="text-left font-medium hover:text-accent-ink" onClick={(ev) => { ev.stopPropagation(); setOpenId(e.id); setNotes(e.notes); }}>{e.name}</button>
                </td>
                <td className="px-3 py-2.5 font-mono text-2xs">{e.phone}</td>
                <td className="px-3 py-2.5">{INTENT_LABEL[e.intent]}</td>
                <td className="px-3 py-2.5 text-ink-muted">{e.propertyTitle ?? '—'}</td>
                <td className="px-3 py-2.5 text-ink-muted">{e.source}</td>
                <td className="px-3 py-2.5"><span className={`rounded-full px-2.5 py-1 text-2xs capitalize ${PILL[e.status]}`}>{label(e.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-ink-muted">No enquiries match.</p>}
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpenId(null)} direction="right" title={open?.name ?? 'Enquiry'} description={open ? `${INTENT_LABEL[open.intent]} · ${open.propertyTitle ?? 'General enquiry'}` : undefined} className="max-w-[480px]">
        {open && (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2">
              <dt className="text-ink-muted">Phone</dt><dd className="font-mono">{open.phone}</dd>
              <dt className="text-ink-muted">Email</dt><dd>{open.email ?? '—'}</dd>
              <dt className="text-ink-muted">Preferred date</dt><dd>{open.preferredDate ?? '—'}</dd>
              <dt className="text-ink-muted">Source</dt><dd>{open.source}{open.utm.source ? ` · ${open.utm.source}/${open.utm.medium ?? ''}` : ''}</dd>
              <dt className="text-ink-muted">Consent</dt><dd className="text-2xs">{open.consentVersion} · {new Date(open.consentAt).toLocaleString('en-IN')}</dd>
              <dt className="text-ink-muted">Message</dt><dd className="whitespace-pre-wrap">{open.message || '—'}</dd>
            </dl>
            <label className="block">
              <span className="mb-1 block font-medium">Status</span>
              <select value={open.status} onChange={(e) => change(open.id, { status: e.target.value as EnquiryStatus })} className="field min-h-[40px] text-sm capitalize">
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-medium">Notes</span>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="field py-2 text-sm" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={() => change(open.id, { notes })} className="btn-secondary min-h-[40px] px-4">{pending ? 'Saving…' : 'Save notes'}</button>
              <a href={whatsAppLink(`Hi ${open.name}, this is ${advisorName} from EstateNav about your ${INTENT_LABEL[open.intent].toLowerCase()} request${open.propertyTitle ? ` for ${open.propertyTitle}` : ''}.`, open.phone)} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[40px] px-4">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Open WhatsApp
              </a>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
