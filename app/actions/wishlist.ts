'use server';

import { z } from 'zod';
import { getAdminAuth, getAdminFirestore } from '@/lib/data/adapters/firestore/admin';

// A signed-in visitor's wishlist lives on users/{uid}.shortlist. The caller proves who they are
// with their Firebase ID token; the uid always comes from the verified token, never the client.
const ids = z.array(z.string().min(1).max(120)).max(200);

async function uidFromToken(token: string): Promise<string> {
  const decoded = await getAdminAuth().verifyIdToken(z.string().min(20).parse(token));
  return decoded.uid;
}

export async function loadWishlist(token: string): Promise<string[]> {
  const uid = await uidFromToken(token);
  const snap = await getAdminFirestore().collection('users').doc(uid).get();
  const parsed = ids.safeParse(snap.data()?.shortlist ?? []);
  return parsed.success ? parsed.data : [];
}

export async function saveWishlist(token: string, list: string[]): Promise<{ ok: true }> {
  const uid = await uidFromToken(token);
  await getAdminFirestore()
    .collection('users')
    .doc(uid)
    .set({ shortlist: ids.parse(Array.from(new Set(list))), shortlistUpdatedAt: new Date().toISOString() }, { merge: true });
  return { ok: true };
}
