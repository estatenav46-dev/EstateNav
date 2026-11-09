import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { folder, timestamp } = await req.json();
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

