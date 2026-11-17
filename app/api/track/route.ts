import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepos } from '@/lib/data';
import { visitorEventSchema, visitorIdSchema } from '@/lib/data/schemas';
import { allow } from '@/lib/rateLimit';

// Receives batches of browsing signals from visitors who accepted personalisation cookies
// (see lib/ui/visitor.ts). Accepts sendBeacon text bodies as well as JSON.
const bodySchema = z.object({ vid: visitorIdSchema, events: z.array(visitorEventSchema).min(1).max(30) });

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > 24_000) return new NextResponse(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  if (!allow(`track:${parsed.data.vid}`, 20, 60_000)) return new NextResponse(null, { status: 429 });
  try {
    await getRepos().visitors.recordEvents(parsed.data.vid, parsed.data.events);
  } catch (error) {
    console.error('track failed', error);
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
