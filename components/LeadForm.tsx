'use client';

import { FormEvent, useState } from 'react';
import { Property } from '@/lib/types';
import { saveEnquiry } from '@/lib/enquiries';

const CONFIRMATION = 'Thanks — we will call you back within one working day. Your enquiry is saved on this device for now.';

export function LeadForm({ property }: { property?: Pick<Property, 'id' | 'projectName'> | null }) {
  const [message, setMessage] = useState(property ? `I would like to book a site visit for ${property.projectName}.` : 'I would like to discuss a property.');
  const [sent, setSent] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enquiry = {
      name: String(form.get('name') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      message: String(form.get('message') || '').trim(),
      ...(property ? { propertyId: property.id, propertyName: property.projectName } : {}),
    };
    try {
      saveEnquiry(enquiry);
      setSent(true);
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  };

  if (sent) return <div role="status" className="rounded-2xl border border-[#B7E4C7] bg-[#F0FDF4] p-4 text-sm leading-6 text-[#155E3B]">{CONFIRMATION}</div>;

  return <form onSubmit={submit} className="space-y-3">
    <label className="block text-sm font-medium">Name<input className="field-input mt-1" name="name" autoComplete="name" required /></label>
    <label className="block text-sm font-medium">Phone<input className="field-input mt-1" name="phone" type="tel" autoComplete="tel" inputMode="tel" required /></label>
    <label className="block text-sm font-medium">Message<textarea className="field-input mt-1 min-h-20 resize-y" name="message" value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
    <label className="flex items-start gap-2 text-xs leading-5 text-[#5B6470]"><input className="mt-1 h-4 w-4 shrink-0 accent-[#047857]" type="checkbox" name="consent" required /><span>I agree that EstateNav may contact me about this enquiry. My details will be saved on this device for now.</span></label>
    {saveFailed && <p role="alert" className="text-sm text-red-700">We could not save your enquiry on this device. Please check your browser storage and try again.</p>}
    <button type="submit" className="btn-primary w-full">Request a site visit</button>
    <p className="text-[11px] leading-4 text-[#66717B]">Your request stays on this device for now; it is not sent to a server.</p>
  </form>;
}
