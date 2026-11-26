import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import { isAdminPreview } from '@/lib/admin';
import { dataSource } from '@/lib/data';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin | EstateNav' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Without the preview flag the old in-site admin does not exist (a plain 404, no hint about how
  // to open it). The real admin is the separate EstateNav-admin app.
  if (!isAdminPreview()) notFound();
  return (
    <AdminAuthGate>
      <AdminShell dataSource={dataSource}>{children}</AdminShell>
    </AdminAuthGate>
  );
}
