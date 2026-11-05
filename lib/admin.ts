// Admin access. TODO(firebase-auth): replace with a verified Firebase session (Admin SDK
// verifySessionCookie) and a users/{uid}.role check for 'admin' | 'editor'.
export function isAdminPreview(): boolean {
  return process.env.NEXT_PUBLIC_ADMIN_PREVIEW === 'true';
}

export const ADMIN_ACTOR = 'admin-preview';
