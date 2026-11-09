import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  const path = request.nextUrl.searchParams.get('path');
  const secret = request.nextUrl.searchParams.get('secret');

  const configuredSecret = process.env.REVALIDATION_SECRET;
  if (configuredSecret && secret !== configuredSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (tag) {
    revalidateTag(tag);
  }
  if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    tag: tag || null,
    path: path || null,
    now: new Date().toISOString(),
  });
}

