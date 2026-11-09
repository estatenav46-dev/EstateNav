import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import { isAdminPreview } from '@/lib/admin';
import { dataSource } from '@/lib/data';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin | EstateNav' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminPreview()) {
    return (
      <main id="main" className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
        <p className="sheet-label">Restricted</p>
        <h1 className="mt-2 font-serif text-3xl">Admin is not available</h1>
        <p className="mt-2 text-ink-muted">Set NEXT_PUBLIC_ADMIN_PREVIEW=true to open the admin panel.</p>
      </main>
    );
  }
  return (
    <AdminAuthGate>
      <AdminShell dataSource={dataSource}>{children}</AdminShell>
    </AdminAuthGate>
  );
}
