'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { saveCorridor, saveDeveloper, saveSettings } from '@/app/actions/admin';
import { corridorSchema, developerSchema, siteSettingsSchema } from '@/lib/data/schemas';
import type { Corridor, Developer, SiteSettings } from '@/lib/data/types';

const input = 'field min-h-[40px] text-sm';
const nullableNumber = { setValueAs: (v: unknown) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v)) };
const nullableText = { setValueAs: (v: unknown) => (v === '' || v == null ? null : v) };

function Row({ label, error, children, wide }: { label: string; error?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-2xs text-danger">{error}</span>}
    </label>
  );
}

function useSaver<T>(save: (v: unknown) => Promise<{ ok: boolean; message?: string; issues?: string[] }>) {
  const router = useRouter();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (values: T) => {
    const result = await save(values);
    setNote(result.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: [result.message, ...(result.issues ?? [])].join(' ') });
    if (result.ok) router.refresh();
  };
  const Note = () => (note ? <p role="status" className={`text-sm ${note.ok ? 'text-accent-ink' : 'text-danger'}`}>{note.text}</p> : null);
  return { run, Note };
}

export function DeveloperForm({ developer }: { developer: Developer }) {
  const { register, control, handleSubmit, formState } = useForm<Developer>({ resolver: zodResolver(developerSchema), defaultValues: developer });
  const sources = useFieldArray({ control, name: 'sources' });
  const { run, Note } = useSaver<Developer>(saveDeveloper);
  const e = formState.errors;
  return (
    <form onSubmit={handleSubmit(run)} className="panel space-y-4 p-5" noValidate>
      <h2 className="font-medium">{developer.name}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Display name" error={e.name?.message}><input className={input} {...register('name')} /></Row>
        <Row label="Legal name" error={e.legalName?.message}><input className={input} {...register('legalName')} /></Row>
        <Row label="About" wide><textarea rows={3} className={`${input} py-2`} {...register('about')} /></Row>
        <Row label="Website" error={e.website?.message}><input className={input} {...register('website', nullableText)} /></Row>
        <Row label="Years active"><input type="number" className={input} {...register('yearsActive', nullableNumber)} /></Row>
        <Row label="Sq.ft delivered"><input type="number" className={input} {...register('sqftDelivered', nullableNumber)} /></Row>
        <Row label="Construction method"><input className={input} {...register('constructionTech', nullableText)} /></Row>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Sources <span className="font-normal text-ink-muted">— a fact shows on the site only when it has a source here</span></p>
          <button type="button" onClick={() => sources.append({ field: 'yearsActive', label: '', url: null, asOf: new Date().toISOString().slice(0, 10) })} className="btn-secondary min-h-[36px] px-3"><Plus className="h-4 w-4" aria-hidden="true" /> Add</button>
        </div>
        {sources.fields.map((s, i) => (
          <div key={s.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1.4fr_1.4fr_1fr_auto] sm:items-end">
            <Row label="Fact">
              <select className={input} {...register(`sources.${i}.field`)}>
                <option value="yearsActive">Years active</option>
                <option value="sqftDelivered">Sq.ft delivered</option>
                <option value="constructionTech">Construction method</option>
              </select>
            </Row>
            <Row label="Source" error={e.sources?.[i]?.label?.message}><input className={input} {...register(`sources.${i}.label`)} /></Row>
            <Row label="URL"><input className={input} {...register(`sources.${i}.url`, nullableText)} /></Row>
            <Row label="As of"><input type="date" className={input} {...register(`sources.${i}.asOf`)} /></Row>
            <button type="button" onClick={() => sources.remove(i)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-surface-2" aria-label="Remove source"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={formState.isSubmitting} className="btn-primary min-h-[40px] px-4">Save developer</button>
        <Note />
      </div>
    </form>
  );
}

export function CorridorForm({ corridor }: { corridor: Corridor }) {
  const { register, handleSubmit, formState } = useForm<Corridor>({ resolver: zodResolver(corridorSchema), defaultValues: corridor });
  const { run, Note } = useSaver<Corridor>(saveCorridor);
  return (
    <form onSubmit={handleSubmit(run)} className="panel grid gap-3 p-4 sm:grid-cols-[1fr_2fr_90px_auto] sm:items-end" noValidate>
      <Row label="Name" error={formState.errors.name?.message}><input className={input} {...register('name')} /></Row>
      <Row label="Description"><input className={input} {...register('description')} /></Row>
      <Row label="Order"><input type="number" className={input} {...register('order', { valueAsNumber: true })} /></Row>
      <div className="flex items-center gap-2">
        <button type="submit" className="btn-secondary min-h-[40px] px-4">Save</button>
        <Note />
      </div>
      <p className="font-mono text-2xs text-ink-muted sm:col-span-4">id {corridor.id} · map path “{corridor.svgPathId}”</p>
    </form>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { register, handleSubmit, formState } = useForm<SiteSettings>({ resolver: zodResolver(siteSettingsSchema), defaultValues: settings });
  const { run, Note } = useSaver<SiteSettings>(saveSettings);
  const e = formState.errors;
  return (
    <form onSubmit={handleSubmit(run)} className="space-y-6" noValidate>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-medium sm:col-span-2">Contact</h2>
        <Row label="Phone (dialable)"><input className={input} {...register('contact.phone')} /></Row>
        <Row label="Phone (display)"><input className={input} {...register('contact.phoneDisplay')} /></Row>
        <Row label="WhatsApp number"><input className={input} {...register('contact.whatsapp')} /></Row>
        <Row label="Email" error={e.contact?.email?.message}><input className={input} {...register('contact.email')} /></Row>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-medium sm:col-span-2">RERA agent block</h2>
        <Row label="Agent name"><input className={input} {...register('agent.name')} /></Row>
        <Row label="Title"><input className={input} {...register('agent.title')} /></Row>
        <Row label="K-RERA registration" wide><input className={`${input} font-mono`} {...register('agent.reraNumber')} /></Row>
        <Row label="Valid from"><input className={input} {...register('agent.validFrom')} /></Row>
        <Row label="Valid to"><input className={input} {...register('agent.validTo')} /></Row>
        <Row label="Partner developer (text only)" wide><input className={input} {...register('partnerDeveloper')} /></Row>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-medium sm:col-span-2">Purchase cost rates</h2>
        <Row label="Stamp duty (%)"><input type="number" step="0.01" className={input} {...register('costs.stampDutyPct', { valueAsNumber: true })} /></Row>
        <Row label="Registration (%)"><input type="number" step="0.01" className={input} {...register('costs.registrationPct', { valueAsNumber: true })} /></Row>
        <Row label="Source"><input className={input} {...register('costs.source')} /></Row>
        <Row label="As of" error={e.costs?.asOf?.message}><input type="date" className={input} {...register('costs.asOf')} /></Row>
        <Row label="Note" wide><input className={input} {...register('costs.note')} /></Row>
      </section>
      <section className="panel grid gap-4 p-5">
        <h2 className="font-medium">Disclaimers &amp; consent</h2>
        <Row label="Portal disclosure (footer, verbatim)"><textarea rows={2} className={`${input} py-2`} {...register('disclaimers.portal')} /></Row>
        <Row label="Listing disclaimer"><textarea rows={2} className={`${input} py-2`} {...register('disclaimers.listing')} /></Row>
        <Row label="Cost studio disclaimer"><textarea rows={2} className={`${input} py-2`} {...register('disclaimers.costs')} /></Row>
        <Row label="Commute disclaimer"><textarea rows={2} className={`${input} py-2`} {...register('disclaimers.commute')} /></Row>
        <Row label="Consent version" error={e.consentVersion?.message}><input className={`${input} font-mono`} {...register('consentVersion')} /></Row>
        <Row label="Consent text (shown under every submit button)"><textarea rows={3} className={`${input} py-2`} {...register('consentText')} /></Row>
        <Row label="Zero-spam privacy note"><textarea rows={2} className={`${input} py-2`} {...register('privacyNote')} /></Row>
        <p className="text-2xs text-ink-muted">Change the consent version whenever the consent text changes, so each enquiry records which wording the visitor saw.</p>
      </section>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={formState.isSubmitting} className="btn-primary min-h-[40px] px-4">Save settings</button>
        <Note />
      </div>
    </form>
  );
}
