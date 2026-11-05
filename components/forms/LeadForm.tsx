'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { MessageCircle } from 'lucide-react';
import { submitEnquiry } from '@/app/actions/enquiries';
import { leadFieldsSchema } from '@/lib/data/schemas';
import type { EnquiryIntent, EnquirySource } from '@/lib/data/types';
import { whatsAppLink } from '@/lib/contact';
import { INTENT_LABEL } from '@/lib/property';
import { Stamp } from './Stamp';

export type ConsentInfo = { text: string; version: string; privacyNote: string };

type Props = {
  consent: ConsentInfo;
  source: EnquirySource;
  whatsapp: string;
  advisorName: string;
  property?: { slug: string; title: string } | null;
  intent?: EnquiryIntent;
  intentChoices?: EnquiryIntent[];
  variant?: 'full' | 'compact' | 'inline';
  submitLabel?: string;
  messagePlaceholder?: string;
  defaultMessage?: string;
};

type Fields = z.input<typeof leadFieldsSchema>;


function readUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') };
    if (fresh.source || fresh.medium || fresh.campaign) {
      sessionStorage.setItem('estatenav:utm', JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(sessionStorage.getItem('estatenav:utm') || 'null') ?? { source: null, medium: null, campaign: null };
  } catch {
    return { source: null, medium: null, campaign: null };
  }
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {hint && <span className="ml-1 font-normal text-ink-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function LeadForm({ consent, source, whatsapp, advisorName, property, intent = 'site-visit', intentChoices, variant = 'full', submitLabel, messagePlaceholder, defaultMessage = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const [done, setDone] = useState<{ name: string; intent: EnquiryIntent } | null>(null);
  const [serverError, setServerError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({
    resolver: zodResolver(leadFieldsSchema),
    mode: 'onTouched',
    defaultValues: { name: '', phone: '', email: '', intent, preferredDate: '', message: defaultMessage, website: '' },
  });
  const chosen = watch('intent');
  useEffect(() => setValue('intent', intent), [intent, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError('');
    const result = await submitEnquiry({
      ...values,
      email: values.email || undefined,
      preferredDate: values.preferredDate || undefined,
      phone: values.phone,
      propertySlug: property?.slug ?? null,
      source,
      consentVersion: consent.version,
      utm: readUtm(),
    });
    if (result.ok) {
      setDone({ name: String(values.name).split(' ')[0], intent: values.intent as EnquiryIntent });
      return;
    }
    setServerError(result.message);
    for (const [field, message] of Object.entries(result.fieldErrors)) {
      if (message && field in values) setError(field as keyof Fields, { message });
    }
  });

  if (done) {
    const text = `Hi ${advisorName}, I've just registered a ${INTENT_LABEL[done.intent].toLowerCase()} request on EstateNav${property ? ` for ${property.title}` : ''}. My name is ${done.name}.`;
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-4 text-center">
        <Stamp />
        <div>
          <p className="font-serif text-2xl">Request registered</p>
          <p className="mt-1 text-sm text-ink-muted">{advisorName} will call you back. For a quicker reply, continue the conversation on WhatsApp.</p>
        </div>
        <a href={whatsAppLink(text, whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Continue on WhatsApp
        </a>
      </div>
    );
  }

  const describe = (name: keyof Fields) => (errors[name] ? `${uid}-${name}-error` : undefined);
  const full = variant === 'full';

  return (
    <form onSubmit={onSubmit} noValidate className={variant === 'inline' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-start' : 'space-y-4'}>
      {intentChoices && intentChoices.length > 1 && (
        <fieldset className={variant === 'inline' ? 'sm:col-span-2 lg:col-span-4' : ''}>
          <legend className="mb-2 text-sm font-medium">What do you need?</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {intentChoices.map((choice) => (
              <button key={choice} type="button" role="radio" aria-checked={chosen === choice} onClick={() => setValue('intent', choice, { shouldDirty: true })} className="chip min-h-[44px]">
                {INTENT_LABEL[choice]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Field id={`${uid}-name`} label="Name" error={errors.name?.message}>
        <input id={`${uid}-name`} className="field" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={describe('name')} {...register('name')} />
      </Field>

      <Field id={`${uid}-phone`} label="Mobile" error={errors.phone?.message}>
        <div className="flex">
          <span className="inline-flex min-h-[48px] items-center rounded-l-xl border border-r-0 border-line bg-surface-2 px-3 font-mono text-sm text-ink-muted">+91</span>
          <input id={`${uid}-phone`} type="tel" inputMode="numeric" autoComplete="tel-national" className="field rounded-l-none" aria-invalid={Boolean(errors.phone)} aria-describedby={describe('phone')} {...register('phone')} />
        </div>
      </Field>

      {(full || variant === 'inline') && (
        <Field id={`${uid}-email`} label="Email" hint="(optional)" error={errors.email?.message}>
          <input id={`${uid}-email`} type="email" autoComplete="email" className="field" aria-invalid={Boolean(errors.email)} aria-describedby={describe('email')} {...register('email')} />
        </Field>
      )}

      {full && chosen === 'site-visit' && (
        <Field id={`${uid}-date`} label="Preferred visit date" hint="(optional)" error={errors.preferredDate?.message}>
          <input id={`${uid}-date`} type="date" min={today} className="field" aria-describedby={describe('preferredDate')} {...register('preferredDate')} />
        </Field>
      )}

      {full && (
        <Field id={`${uid}-message`} label="Message" hint="(optional)" error={errors.message?.message}>
          <textarea id={`${uid}-message`} rows={3} className="field min-h-[96px] py-3" placeholder={messagePlaceholder ?? (property ? `Questions about ${property.title}` : 'Budget, preferred corridor, timeline')} {...register('message')} />
        </Field>
      )}

      <div className="hidden" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <div className={variant === 'inline' ? 'lg:pt-[30px]' : ''}>
        <p className={`mb-2 text-2xs text-ink-muted ${variant === 'inline' ? 'sr-only' : ''}`}>{consent.privacyNote}</p>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? 'Sending…' : submitLabel ?? (chosen === 'price-sheet' ? 'Get price sheet' : chosen === 'site-visit' ? 'Schedule site visit' : 'Send request')}
        </button>
      </div>
      {serverError && <p role="alert" className={`text-sm text-danger ${variant === 'inline' ? 'sm:col-span-2 lg:col-span-4' : ''}`}>{serverError}</p>}
      <p className={`text-2xs leading-relaxed text-ink-muted ${variant === 'inline' ? 'sm:col-span-2 lg:col-span-4' : ''}`}>
        {variant === 'inline' && <span className="mr-1 text-ink">{consent.privacyNote}</span>}
        {consent.text}
      </p>
    </form>
  );
}
