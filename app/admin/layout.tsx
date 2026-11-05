import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { isAdminPreview } from '@/lib/admin';
import { dataSource } from '@/lib/data';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin | EstateNav' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// AdminGuard: preview access only while NEXT_PUBLIC_ADMIN_PREVIEW=true.
// TODO(firebase-auth): require a signed-in Google account with role admin or editor.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminPreview()) {
    return (
      <main id="main" className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
        <p className="sheet-label">Restricted</p>
        <h1 className="mt-2 font-serif text-3xl">Admin is not available</h1>
        <p className="mt-2 text-ink-muted">Set NEXT_PUBLIC_ADMIN_PREVIEW=true to open the mock-backed admin preview. Sign-in with roles arrives with Firebase.</p>
      </main>
    );
  }
  return <AdminShell dataSource={dataSource}>{children}</AdminShell>;
}
