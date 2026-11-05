import Link from 'next/link';
import { getRepos } from '@/lib/data';
import { INTENT_LABEL } from '@/lib/property';

export const metadata = { title: 'Overview' };

export default async function AdminOverview() {
  const repos = getRepos();
  const [properties, enquiries] = await Promise.all([repos.properties.list({ status: 'any' }), repos.leads.list()]);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const tiles = [
    { label: 'Published', value: properties.filter((p) => p.status === 'published').length, href: '/admin/properties?status=published' },
    { label: 'Drafts', value: properties.filter((p) => p.status === 'draft').length, href: '/admin/properties?status=draft' },
    { label: 'New enquiries this week', value: enquiries.filter((e) => e.status === 'new' && e.createdAt >= weekAgo).length, href: '/admin/enquiries?status=new' },
  ];
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl">Overview</h1>
      <ul className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="panel block p-4 hover:border-line-strong">
              <p className="text-ink-muted">{t.label}</p>
              <p className="mt-1 font-serif text-3xl">{t.value}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Recent enquiries</h2>
          <Link href="/admin/enquiries" className="text-accent-ink hover:underline">Open inbox</Link>
        </div>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="text-left text-2xs text-ink-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-2 font-normal">When</th>
                <th className="px-4 py-2 font-normal">Name</th>
                <th className="px-4 py-2 font-normal">Intent</th>
                <th className="px-4 py-2 font-normal">Property</th>
                <th className="px-4 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.slice(0, 6).map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 font-mono text-2xs">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-2.5">{e.name}</td>
                  <td className="px-4 py-2.5">{INTENT_LABEL[e.intent]}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{e.propertyTitle ?? '—'}</td>
                  <td className="px-4 py-2.5 capitalize">{e.status.replace('-', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
