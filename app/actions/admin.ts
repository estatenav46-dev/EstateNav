'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { getRepos } from '@/lib/data';
import { corridorSchema, developerSchema, enquiryStatusSchema, propertySchema, publishStatusSchema, siteSettingsSchema } from '@/lib/data/schemas';
import type { Corridor, Developer, Enquiry, Property, PublishStatus, SiteSettings } from '@/lib/data/types';
import { ADMIN_ACTOR, isAdminPreview } from '@/lib/admin';

type Result<T> = { ok: true; data: T } | { ok: false; message: string; issues?: string[] };

function guard() {
  if (!isAdminPreview()) throw new Error('Admin preview is disabled.');
}

async function run<T>(fn: () => Promise<T>, tags: string[] = []): Promise<Result<T>> {
  try {
    guard();
    const data = await fn();
    tags.forEach((tag) => revalidateTag(tag));
    revalidatePath('/admin', 'layout');
    return { ok: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, message: 'Some fields need attention.', issues: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
    return { ok: false, message: error instanceof Error ? error.message : 'Something went wrong.' };
  }
}

const draftSchema = propertySchema.omit({ createdAt: true, updatedAt: true, publishedAt: true, createdBy: true, updatedBy: true });

export async function saveProperty(input: unknown, status: PublishStatus): Promise<Result<Property>> {
  return run(async () => {
    const draft = draftSchema.parse({ ...(input as object), status });
    const repos = getRepos();
    if (!(await repos.properties.isSlugAvailable(draft.slug, draft.id))) throw new Error(`The slug “${draft.slug}” is already used by another listing.`);
    return repos.properties.save(draft, ADMIN_ACTOR);
  }, ['properties']);
}

export async function checkSlug(slug: string, exceptId?: string): Promise<boolean> {
  guard();
  return getRepos().properties.isSlugAvailable(slug, exceptId);
}

export async function setPropertyStatus(id: string, status: PublishStatus): Promise<Result<Property>> {
  return run(() => getRepos().properties.setStatus(id, publishStatusSchema.parse(status), ADMIN_ACTOR), ['properties']);
}

export async function setPropertyFeatured(id: string, featured: boolean): Promise<Result<Property>> {
  return run(() => getRepos().properties.setFeatured(id, featured, ADMIN_ACTOR), ['properties']);
}

export async function duplicateProperty(id: string): Promise<Result<Property>> {
  return run(() => getRepos().properties.duplicate(id, ADMIN_ACTOR), ['properties']);
}

export async function updateEnquiry(id: string, patch: { status?: Enquiry['status']; notes?: string; assignedTo?: string | null }): Promise<Result<Enquiry>> {
  return run(() =>
    getRepos().leads.update(id, {
      ...(patch.status ? { status: enquiryStatusSchema.parse(patch.status) } : {}),
      ...(patch.notes !== undefined ? { notes: z.string().max(2000).parse(patch.notes) } : {}),
      ...(patch.assignedTo !== undefined ? { assignedTo: patch.assignedTo } : {}),
    }),
  );
}

export async function saveDeveloper(input: unknown): Promise<Result<Developer>> {
  return run(() => getRepos().developers.save(developerSchema.parse(input)), ['catalogue', 'properties']);
}

export async function saveCorridor(input: unknown): Promise<Result<Corridor>> {
  return run(() => getRepos().corridors.save(corridorSchema.parse(input)), ['catalogue', 'properties']);
}

export async function saveSettings(input: unknown): Promise<Result<SiteSettings>> {
  return run(() => getRepos().settings.save(siteSettingsSchema.parse(input)), ['settings']);
}
