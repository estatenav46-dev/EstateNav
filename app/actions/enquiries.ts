'use server';

import { enquiryInputSchema } from '@/lib/data/schemas';
import { getRepos } from '@/lib/data';
import { sendEnquiryEmailNotification } from '@/lib/email/emailjs';
import type { Property } from '@/lib/data/types';

export type EnquiryResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors: Partial<Record<string, string>> };

// Every lead form posts here. Validation runs again on the server; the stored record keeps
// the consent text and version the visitor saw. TODO(firebase): leads.create moves to the
// Admin SDK; clients never write enquiries directly.
export async function submitEnquiry(input: unknown): Promise<EnquiryResult> {
  const parsed = enquiryInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: 'Please check the highlighted fields.', fieldErrors };
  }
  const data = parsed.data;
  // Honeypot filled in: answer as if it worked, store nothing.
  if (data.website) return { ok: true, id: 'received' };

  const repos = getRepos();
  const settings = await repos.settings.get();
  const property = data.propertySlug ? await repos.properties.getBySlug(data.propertySlug) : null;
  const enquiry = await repos.leads.create({
    name: data.name,
    phone: `+91${data.phone}`,
    email: data.email,
    intent: data.intent,
    preferredDate: data.preferredDate,
    message: data.message,
    propertyId: property?.id ?? null,
    propertySlug: property?.slug ?? null,
    propertyTitle: property?.title ?? null,
    source: data.source,
    consentText: settings.consentText,
    consentVersion: data.consentVersion,
    consentAt: new Date().toISOString(),
    utm: data.utm,
  });

  // Send real-time email notification via EmailJS (non-blocking)
  sendEnquiryEmailNotification(enquiry).catch((err) => {
    console.error('[Enquiries] Failed to dispatch email notification:', err);
  });

  return { ok: true, id: enquiry.id };
}

/** Compare and shortlist views fetch full records for the ids kept in the browser. */
export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  const wanted = ids.slice(0, 24);
  const all = await getRepos().properties.list({ status: 'published' });
  return wanted.map((id) => all.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
}
