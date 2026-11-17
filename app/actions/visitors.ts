'use server';

import { getRepos } from '@/lib/data';
import { visitorIdSchema, visitorLeadSchema } from '@/lib/data/schemas';
import { allow } from '@/lib/rateLimit';

type Result = { ok: true } | { ok: false; message: string; field?: string };

// Welcome concierge: a visitor who has not signed in shares a few details (with consent).
export async function saveWelcomeLead(visitorId: string, input: unknown): Promise<Result> {
  const id = visitorIdSchema.safeParse(visitorId);
  if (!id.success) return { ok: false, message: 'Please refresh the page and try again.' };
  if (!allow(`lead:${id.data}`, 5, 60 * 60 * 1000)) return { ok: false, message: 'We already have your details. The advisor will be in touch.' };
  const parsed = visitorLeadSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue.message, field: String(issue.path[0] ?? '') };
  }
  if (parsed.data.website) return { ok: true }; // honeypot filled: quietly ignore bots
  try {
    await getRepos().visitors.saveLead(id.data, parsed.data);
    return { ok: true };
  } catch (error) {
    console.error('saveWelcomeLead failed', error);
    return { ok: false, message: 'We could not save that just now. Please try again in a moment.' };
  }
}
