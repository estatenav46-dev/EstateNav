import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;

export function getAdminFirestore(): Firestore {
  if (firestoreDb) return firestoreDb;

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (privateKey) {
      // Clean up stringified newlines or quotes if needed
      privateKey = privateKey.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = initializeApp();
    }
  } else {
    adminApp = getApps()[0];
  }

  firestoreDb = getFirestore(adminApp);
  return firestoreDb;
}


/** Verifies visitors' Firebase ID tokens (wishlist, account features). */
export function getAdminAuth(): Auth {
  getAdminFirestore();
  return getAuth(adminApp ?? getApps()[0]);
}
