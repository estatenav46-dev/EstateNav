import { NextResponse, type NextRequest } from 'next/server';

// The old in-site admin (/admin) only exists with NEXT_PUBLIC_ADMIN_PREVIEW=true. Otherwise it is a
// plain 404, decided here because a layout cannot change the response status once it streams.
// The real admin is the separate EstateNav-admin app.
export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ADMIN_PREVIEW === 'true') return NextResponse.next();
  return NextResponse.rewrite(new URL('/__not-found', request.url), { status: 404 });
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
