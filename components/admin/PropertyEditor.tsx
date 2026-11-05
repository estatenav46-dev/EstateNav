'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors } from 'react-hook-form';
import type { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { checkSlug, saveProperty } from '@/app/actions/admin';
import { propertySchema } from '@/lib/data/schemas';
import type { Corridor, Developer, ImageRef, Lens, OfficeHub, Property, PublishStatus } from '@/lib/data/types';
import { LENS_LABEL } from '@/lib/property';
import { PropertyCard } from '@/components/property/PropertyCard';
import { VerificationLedger } from '@/components/property/VerificationLedger';
import { MediaUploader } from './MediaUploader';

const formSchema = propertySchema.omit({ createdAt: true, updatedAt: true, publishedAt: true, createdBy: true, updatedBy: true });
type Draft = z.infer<typeof formSchema>;

const SECTIONS = [
  ['basics', 'Basics'],
  ['location', 'Location'],
  ['configurations', 'Configurations'],
  ['possession', 'Possession'],
  ['verification', 'Verification & approvals'],
  ['features', 'Amenities & lenses'],
  ['media', 'Media'],
  ['sourced', 'Sourced metrics & commute'],
  ['seo', 'SEO'],
] as const;

const BANKS = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'LIC HFL', 'Bank of Baroda'];
const LENSES: Lens[] = ['first-home', 'upgrading', 'nri', 'senior', 'investor'];
const nullableNumber = { setValueAs: (v: unknown) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)) };
const nullableText = { setValueAs: (v: unknown) => (v === '' || v === undefined ? null : v) };
const slugify = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const EMPTY_IMAGE: ImageRef = { id: 'none', storagePath: '', url: '', alt: '', width: 1, height: 1, blurDataURL: '', order: 0 };

function blankProperty(developer?: Developer, corridor?: Corridor): Draft {
  const id = `p-${Date.now().toString(36)}`;
  return {
    id, slug: '', status: 'draft', featured: false, featuredRank: 99,
    segment: 'residential', transaction: 'sale', isNewLaunch: false, propertyType: 'apartment',
    title: '', tagline: '', description: '', highlights: [],
    developerId: developer?.id ?? '', developerName: developer?.name ?? '', corridorId: corridor?.id ?? '', corridorName: corridor?.name ?? '',
    locality: '', address: '', geo: null, geohash: null,
    configurations: [{ id: `${id}-c1`, label: '2 BHK', bhk: 2, carpetSqftMin: null, carpetSqftMax: null, superSqftMin: null, superSqftMax: null, priceMin: null, priceMax: null, floorPlanImageId: null }],
    bhkOptions: [2], priceMin: 1, priceMax: null, sizeMin: null, sizeMax: null, pricePerSqft: null, rentPerMonth: null,
    possession: { status: 'under-construction', date: null, label: '' },
    rera: { number: null, verifyUrl: 'https://rera.karnataka.gov.in/', registered: false },
    approvals: { khata: null, planAuthority: null, titleCheck: null, notes: '' },
    bankApprovals: [], amenities: [], lenses: [],
    media: { cover: EMPTY_IMAGE, gallery: [], floorPlans: [], brochure: null },
    metrics: null, commute: [],
    seo: { title: '', description: '', ogImageId: null },
  };
}

function flattenErrors(errors: FieldErrors, prefix = ''): string[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof (value as { message?: unknown }).message === 'string') return [`${path}: ${(value as { message: string }).message}`];
    return flattenErrors(value as FieldErrors, path);
  });
}

function Field({ label, hint, error, children, className = '' }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-ink-muted">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-2xs text-danger">{error}</span>}
    </label>
  );
}

const input = 'field min-h-[40px] text-sm';

export function PropertyEditor({ initial, developers, corridors, hubs }: { initial: Property | null; developers: Developer[]; corridors: Corridor[]; hubs: OfficeHub[] }) {
  const router = useRouter();
  const isNew = !initial;
  const defaults = useMemo<Draft>(() => {
    if (!initial) return blankProperty(developers[0], corridors[0]);
    const { createdAt: _c, updatedAt: _u, publishedAt: _p, createdBy: _cb, updatedBy: _ub, ...rest } = initial;
    return rest;
  }, [initial, developers, corridors]);

  const form = useForm<Draft>({ resolver: zodResolver(formSchema), defaultValues: defaults, mode: 'onBlur' });
  const { register, control, handleSubmit, setValue, getValues, reset, formState } = form;
  const { errors, isDirty, isSubmitting } = formState;
  const configs = useFieldArray({ control, name: 'configurations' });
  const commute = useFieldArray({ control, name: 'commute' });
  const values = useWatch({ control }) as Draft;
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [slugFree, setSlugFree] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string; issues?: string[] } | null>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout>>();

  // Slug follows the title until someone edits it by hand.
  useEffect(() => {
    if (!slugTouched && values.title !== undefined) setValue('slug', slugify(values.title), { shouldDirty: true });
  }, [values.title, slugTouched, setValue]);

  useEffect(() => {
    clearTimeout(slugTimer.current);
    const slug = values.slug;
    if (!slug) return setSlugFree(null);
    slugTimer.current = setTimeout(() => checkSlug(slug, values.id).then(setSlugFree).catch(() => setSlugFree(null)), 350);
  }, [values.slug, values.id]);

  // Denormalised query fields are derived from the configuration rows.
  const configKey = JSON.stringify(values.configurations ?? []);
  useEffect(() => {
    const rows = getValues('configurations') ?? [];
    const bhk = Array.from(new Set(rows.map((r) => r.bhk).filter((b): b is number => typeof b === 'number' && b > 0))).sort((a, b) => a - b);
    setValue('bhkOptions', bhk);
    const prices = rows.flatMap((r) => [r.priceMin, r.priceMax]).filter((n): n is number => typeof n === 'number' && n > 0);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setValue('priceMin', min);
      setValue('priceMax', max > min ? max : null);
    }
    const sizes = rows.flatMap((r) => [r.carpetSqftMin, r.carpetSqftMax, r.superSqftMin, r.superSqftMax]).filter((n): n is number => typeof n === 'number' && n > 0);
    if (sizes.length) {
      setValue('sizeMin', Math.min(...sizes));
      setValue('sizeMax', Math.max(...sizes) > Math.min(...sizes) ? Math.max(...sizes) : null);
    }
  }, [configKey, getValues, setValue]);

  // Unsaved-changes guard for reloads and in-app links.
  useEffect(() => {
    if (!isDirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (anchor && !anchor.getAttribute('target') && !window.confirm('You have unsaved changes. Leave without saving?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [isDirty]);

  const submit = (status: PublishStatus) =>
    handleSubmit(
      async (draft) => {
        setMessage(null);
        const result = await saveProperty(draft, status);
        if (!result.ok) {
          setMessage({ tone: 'error', text: result.message, issues: result.issues });
          return;
        }
        const { createdAt: _c, updatedAt: _u, publishedAt: _p, createdBy: _cb, updatedBy: _ub, ...saved } = result.data;
        reset(saved);
        setMessage({ tone: 'ok', text: status === 'published' ? 'Published. Public pages refresh within moments.' : 'Draft saved.' });
        if (isNew) router.replace(`/admin/properties/${saved.id}`);
        else router.refresh();
      },
      (errs) => setMessage({ tone: 'error', text: 'Some fields need attention.', issues: flattenErrors(errs) }),
    )();

  const preview = useMemo<Property | null>(() => {
    if (!values.media?.cover?.url) return null;
    return { ...(values as Draft), createdAt: '', updatedAt: '', publishedAt: null, createdBy: '', updatedBy: '', title: values.title || 'Untitled project' } as Property;
  }, [values]);

  const gallery = values.media?.gallery ?? [];
  const setGallery = (images: ImageRef[]) => {
    setValue('media.gallery', images, { shouldDirty: true, shouldValidate: true });
    const cover = getValues('media.cover');
    if (!images.some((img) => img.id === cover.id)) setValue('media.cover', images[0] ?? EMPTY_IMAGE, { shouldDirty: true });
    else setValue('media.cover', images.find((img) => img.id === cover.id)!, { shouldDirty: true });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[180px_minmax(0,1fr)_340px]">
      <nav aria-label="Editor sections" className="hidden xl:block">
        <ul className="sticky top-20 space-y-0.5">
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block rounded-lg px-3 py-2 text-ink-muted hover:bg-surface-2 hover:text-ink">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <form onSubmit={(e) => e.preventDefault()} className="min-w-0 space-y-6" noValidate>
        <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <h1 className="mr-auto font-serif text-xl">{isNew ? 'New property' : values.title || 'Edit property'}</h1>
          {isDirty && <span className="text-2xs text-ink-muted">Unsaved changes</span>}
          <button type="button" disabled={isSubmitting} onClick={() => submit('draft')} className="btn-secondary min-h-[40px] px-4" title={values.status === 'published' ? 'Takes the listing off the public site' : undefined}>
            {values.status === 'published' ? 'Move to draft' : 'Save draft'}
          </button>
          <button type="button" disabled={isSubmitting} onClick={() => submit('published')} className="btn-primary min-h-[40px] px-4">
            {values.status === 'published' ? 'Publish changes' : 'Publish'}
          </button>
        </div>
        {message && (
          <div role={message.tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 ${message.tone === 'error' ? 'border-danger text-danger' : 'border-accent-ink text-accent-ink'}`}>
            <p>{message.text}</p>
            {message.issues && (
              <ul className="mt-1 list-disc pl-5 text-2xs">
                {message.issues.slice(0, 8).map((i) => <li key={i}>{i}</li>)}
              </ul>
            )}
          </div>
        )}

        <section id="basics" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title?.message} className="sm:col-span-2">
              <input className={input} {...register('title')} />
            </Field>
            <Field label="Slug" hint={slugFree === false ? '— already in use' : slugFree ? '— available' : undefined} error={errors.slug?.message}>
              <input className={`${input} font-mono`} {...register('slug', { onChange: () => setSlugTouched(true) })} aria-invalid={slugFree === false} />
            </Field>
            <Field label="Developer">
              <select className={input} value={values.developerId} onChange={(e) => { const d = developers.find((x) => x.id === e.target.value); setValue('developerId', d?.id ?? '', { shouldDirty: true }); setValue('developerName', d?.name ?? '', { shouldDirty: true }); }}>
                {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Segment">
              <select className={input} {...register('segment')}>
                <option value="residential">Residential</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
            <Field label="Transaction">
              <select className={input} {...register('transaction')}>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </Field>
            <Field label="Property type">
              <select className={input} {...register('propertyType')}>
                {['apartment', 'villa', 'row-house', 'plot', 'office', 'retail'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Featured rank" hint="(lower shows first)">
              <input type="number" className={input} {...register('featuredRank', { valueAsNumber: true })} />
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('featured')} className="h-4 w-4" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('isNewLaunch')} className="h-4 w-4" /> New launch</label>
            <Field label="Tagline" className="sm:col-span-2"><input className={input} {...register('tagline')} /></Field>
            <Field label="Description" hint="(markdown: paragraphs, - lists, **bold**)" className="sm:col-span-2">
              <textarea rows={5} className={`${input} py-2`} {...register('description')} />
            </Field>
            <Field label="Highlights" hint="(one per line)" className="sm:col-span-2">
              <Controller control={control} name="highlights" render={({ field }) => (
                <textarea rows={4} className={`${input} py-2`} value={field.value.join('\n')} onChange={(e) => field.onChange(e.target.value.split('\n').map((l) => l.trimStart()).filter((l, i, a) => l || i < a.length - 1))} onBlur={() => field.onChange(field.value.map((l) => l.trim()).filter(Boolean))} />
              )} />
            </Field>
          </div>
        </section>

        <section id="location" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Corridor">
              <select className={input} value={values.corridorId} onChange={(e) => { const c = corridors.find((x) => x.id === e.target.value); setValue('corridorId', c?.id ?? '', { shouldDirty: true }); setValue('corridorName', c?.name ?? '', { shouldDirty: true }); }}>
                {corridors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Locality" error={errors.locality?.message}><input className={input} {...register('locality')} /></Field>
            <Field label="Address" className="sm:col-span-2"><input className={input} {...register('address')} /></Field>
            <Controller control={control} name="geo" render={({ field }) => (
              <>
                <Field label="Latitude" hint="(optional)"><input type="number" step="any" className={input} value={field.value?.lat ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : { lat: Number(e.target.value), lng: field.value?.lng ?? 0 })} /></Field>
                <Field label="Longitude" hint="(optional)"><input type="number" step="any" className={input} value={field.value?.lng ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : { lat: field.value?.lat ?? 0, lng: Number(e.target.value) })} /></Field>
              </>
            )} />
          </div>
        </section>

        <section id="configurations" className="panel scroll-mt-32 space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Configurations</h2>
            <button type="button" onClick={() => configs.append({ id: `${values.id}-c${Date.now().toString(36)}`, label: '', bhk: null, carpetSqftMin: null, carpetSqftMax: null, superSqftMin: null, superSqftMax: null, priceMin: null, priceMax: null, floorPlanImageId: null })} className="btn-secondary min-h-[36px] px-3">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add row
            </button>
          </div>
          <div className="space-y-3">
            {configs.fields.map((row, i) => (
              <fieldset key={row.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-4">
                <legend className="sr-only">Configuration {i + 1}</legend>
                <Field label="Label" error={errors.configurations?.[i]?.label?.message}><input className={input} {...register(`configurations.${i}.label`)} /></Field>
                <Field label="BHK"><input type="number" step="0.5" className={input} {...register(`configurations.${i}.bhk`, nullableNumber)} /></Field>
                <Field label={values.segment === 'plot' ? 'Plot sq.ft min' : 'Carpet min'}><input type="number" className={input} {...register(`configurations.${i}.carpetSqftMin`, nullableNumber)} /></Field>
                <Field label={values.segment === 'plot' ? 'Plot sq.ft max' : 'Carpet max'}><input type="number" className={input} {...register(`configurations.${i}.carpetSqftMax`, nullableNumber)} /></Field>
                <Field label="Super min"><input type="number" className={input} {...register(`configurations.${i}.superSqftMin`, nullableNumber)} /></Field>
                <Field label="Super max"><input type="number" className={input} {...register(`configurations.${i}.superSqftMax`, nullableNumber)} /></Field>
                <Field label="Price min (₹)"><input type="number" className={input} {...register(`configurations.${i}.priceMin`, nullableNumber)} /></Field>
                <div className="flex items-end gap-2">
                  <Field label="Price max (₹)" className="flex-1"><input type="number" className={input} {...register(`configurations.${i}.priceMax`, nullableNumber)} /></Field>
                  <button type="button" onClick={() => configs.remove(i)} disabled={configs.fields.length === 1} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-surface-2 disabled:opacity-30" aria-label={`Remove configuration ${i + 1}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </fieldset>
            ))}
          </div>
          <div className="grid gap-3 rounded-xl bg-surface-2 p-3 sm:grid-cols-4">
            <p className="text-2xs text-ink-muted sm:col-span-4">Derived for search (filled from rows when they carry values; otherwise set here):</p>
            <Field label="BHK options"><input readOnly className={`${input} bg-surface-2`} value={(values.bhkOptions ?? []).join(', ') || '—'} /></Field>
            <Field label="Price from (₹)" error={errors.priceMin?.message}><input type="number" className={input} {...register('priceMin', { valueAsNumber: true })} /></Field>
            <Field label="Price to (₹)"><input type="number" className={input} {...register('priceMax', nullableNumber)} /></Field>
            <Field label="₹ per sq.ft"><input type="number" className={input} {...register('pricePerSqft', nullableNumber)} /></Field>
            <Field label="Size from (sq.ft)"><input type="number" className={input} {...register('sizeMin', nullableNumber)} /></Field>
            <Field label="Size to (sq.ft)"><input type="number" className={input} {...register('sizeMax', nullableNumber)} /></Field>
            <Field label="Rent per month (₹)" hint="(rent only)"><input type="number" className={input} {...register('rentPerMonth', nullableNumber)} /></Field>
          </div>
        </section>

        <section id="possession" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Possession</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Status">
              <select className={input} {...register('possession.status')}>
                <option value="ready">Ready</option>
                <option value="under-construction">Under construction</option>
                <option value="pre-launch">Pre-launch</option>
              </select>
            </Field>
            <Field label="Date" hint="(optional)"><input type="date" className={input} {...register('possession.date', nullableText)} /></Field>
            <Field label="Label" error={errors.possession?.label?.message}><input className={input} placeholder="December 2027" {...register('possession.label')} /></Field>
          </div>
        </section>

        <section id="verification" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Verification &amp; approvals</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="K-RERA project number" hint="(leave empty if not registered)"><input className={`${input} font-mono`} {...register('rera.number', nullableText)} /></Field>
            <Field label="Verify URL"><input className={input} {...register('rera.verifyUrl', nullableText)} /></Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" {...register('rera.registered')} className="h-4 w-4" /> Registration checked on the K-RERA portal</label>
            <Field label="Khata">
              <select className={input} {...register('approvals.khata', nullableText)}>
                <option value="">Not on record</option>
                <option value="A">A-Khata</option>
                <option value="B">B-Khata</option>
                <option value="E">E-Khata</option>
              </select>
            </Field>
            <Field label="Plan authority">
              <select className={input} {...register('approvals.planAuthority', nullableText)}>
                <option value="">Not on record</option>
                {['BBMP', 'BDA', 'BMRDA', 'BIAAPA'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Title / Kaveri check">
              <select className={input} {...register('approvals.titleCheck', nullableText)}>
                <option value="">Not on record</option>
                <option value="clear">Clear</option>
                <option value="pending">Pending</option>
              </select>
            </Field>
            <Field label="Notes"><input className={input} {...register('approvals.notes')} /></Field>
            <Controller control={control} name="bankApprovals" render={({ field }) => (
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 text-sm font-medium">Bank approvals</legend>
                <div className="flex flex-wrap gap-1.5">
                  {BANKS.map((bank) => (
                    <button key={bank} type="button" className="chip min-h-[36px] text-2xs" aria-pressed={field.value.includes(bank)} onClick={() => field.onChange(field.value.includes(bank) ? field.value.filter((b) => b !== bank) : [...field.value, bank])}>{bank}</button>
                  ))}
                </div>
              </fieldset>
            )} />
          </div>
        </section>

        <section id="features" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Amenities &amp; lenses</h2>
          <Field label="Amenities" hint="(comma separated)">
            <Controller control={control} name="amenities" render={({ field }) => (
              <input className={input} defaultValue={field.value.join(', ')} onBlur={(e) => field.onChange(e.target.value.split(',').map((a) => a.trim()).filter(Boolean))} />
            )} />
          </Field>
          <Controller control={control} name="lenses" render={({ field }) => (
            <fieldset>
              <legend className="mb-1 text-sm font-medium">Buyer lenses</legend>
              <div className="flex flex-wrap gap-1.5">
                {LENSES.map((lens) => (
                  <button key={lens} type="button" className="chip min-h-[36px] text-2xs" aria-pressed={field.value.includes(lens)} onClick={() => field.onChange(field.value.includes(lens) ? field.value.filter((l) => l !== lens) : [...field.value, lens])}>{LENS_LABEL[lens]}</button>
                ))}
              </div>
            </fieldset>
          )} />
        </section>

        <section id="media" className="panel scroll-mt-32 space-y-6 p-5">
          <h2 className="font-medium">Media</h2>
          <MediaUploader
            label="Gallery"
            images={gallery}
            onChange={setGallery}
            storagePath={`properties/${values.id}/gallery`}
            coverId={values.media?.cover?.id}
            onSetCover={(img) => setValue('media.cover', img, { shouldDirty: true, shouldValidate: true })}
            errors={errors.media?.cover ? 'Upload at least one photo with alt text and set it as the cover.' : errors.media?.gallery ? 'Every photo needs alt text.' : undefined}
          />
          <MediaUploader label="Floor plans" images={values.media?.floorPlans ?? []} onChange={(images) => setValue('media.floorPlans', images, { shouldDirty: true })} storagePath={`properties/${values.id}/floorplans`} />
          <p className="text-2xs text-ink-muted">TODO(client): real renders and photos must come from the developer with usage rights.</p>
        </section>

        <section id="sourced" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">Sourced metrics &amp; commute</h2>
          <p className="text-2xs text-ink-muted">Numbers here appear on the site only with a source and an as-of date.</p>
          <Controller control={control} name="metrics" render={({ field }) => (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4" checked={field.value !== null} onChange={(e) => field.onChange(e.target.checked ? { grossYield: 1, source: '', asOf: new Date().toISOString().slice(0, 10) } : null)} /> Publish a gross rental yield
              </label>
              {field.value && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Gross yield (%)"><input type="number" step="0.1" className={input} value={field.value.grossYield} onChange={(e) => field.onChange({ ...field.value!, grossYield: Number(e.target.value) })} /></Field>
                  <Field label="Source" error={errors.metrics?.source?.message}><input className={input} value={field.value.source} onChange={(e) => field.onChange({ ...field.value!, source: e.target.value })} /></Field>
                  <Field label="As of"><input type="date" className={input} value={field.value.asOf} onChange={(e) => field.onChange({ ...field.value!, asOf: e.target.value })} /></Field>
                </div>
              )}
            </div>
          )} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Commute bands</p>
              <button type="button" onClick={() => commute.append({ hubId: hubs[0]?.id ?? '', peakMins: 45, offPeakMins: 25, source: '', asOf: new Date().toISOString().slice(0, 10) })} className="btn-secondary min-h-[36px] px-3">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add hub
              </button>
            </div>
            {commute.fields.map((row, i) => (
              <fieldset key={row.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-6">
                <legend className="sr-only">Commute {i + 1}</legend>
                <Field label="Hub" className="sm:col-span-2">
                  <select className={input} {...register(`commute.${i}.hubId`)}>
                    {hubs.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </Field>
                <Field label="Off-peak min"><input type="number" className={input} {...register(`commute.${i}.offPeakMins`, { valueAsNumber: true })} /></Field>
                <Field label="Peak min"><input type="number" className={input} {...register(`commute.${i}.peakMins`, { valueAsNumber: true })} /></Field>
                <Field label="Source" error={errors.commute?.[i]?.source?.message}><input className={input} {...register(`commute.${i}.source`)} /></Field>
                <div className="flex items-end gap-2">
                  <Field label="As of" className="flex-1"><input type="date" className={input} {...register(`commute.${i}.asOf`)} /></Field>
                  <button type="button" onClick={() => commute.remove(i)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-surface-2" aria-label={`Remove commute ${i + 1}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section id="seo" className="panel scroll-mt-32 space-y-4 p-5">
          <h2 className="font-medium">SEO</h2>
          <Field label="Title" hint={`(${values.seo?.title?.length ?? 0}/60)`}><input className={input} {...register('seo.title')} /></Field>
          <Field label="Description" hint={`(${values.seo?.description?.length ?? 0}/160)`}><textarea rows={3} className={`${input} py-2`} {...register('seo.description')} /></Field>
        </section>
      </form>

      <aside aria-label="Live preview" className="hidden xl:block">
        <div className="sticky top-20 space-y-4">
          <p className="sheet-label">Live preview</p>
          {preview ? <PropertyCard property={preview} /> : <div className="panel p-6 text-ink-muted">Add a cover photo to preview the card.</div>}
          {preview && (
            <div className="panel space-y-3 p-4">
              <p className="sheet-label">Quick view</p>
              <p className="font-serif text-xl">{preview.title}</p>
              <VerificationLedger property={preview} summary notes={false} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
