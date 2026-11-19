import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAdminPreview } from '@/lib/admin';

export async function POST(req: Request) {
  // Only the in-site admin preview uploads from this app; the standalone admin signs its own.
  if (!isAdminPreview()) return NextResponse.json({ error: 'Uploads are not enabled on this site.' }, { status: 403 });
  try {
    const { folder, timestamp } = await req.json();
    if (typeof folder !== 'string' || !/^estatenav\/[a-z0-9/_-]{1,160}$/i.test(folder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    }
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!apiSecret || !apiKey) {
      return NextResponse.json({ error: 'Cloudinary server credentials missing' }, { status: 500 });
    }

    // Parameters must be sorted alphabetically
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return NextResponse.json({ signature, timestamp, apiKey });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}

