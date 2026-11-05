import { Suspense } from 'react';
import { EnquiriesInbox } from '@/components/admin/EnquiriesInbox';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Enquiries' };

export default async function AdminEnquiries() {
  const repos = getRepos();
  const [enquiries, settings] = await Promise.all([repos.leads.list(), repos.settings.get()]);
  return (
    <Suspense>
      <EnquiriesInbox enquiries={enquiries} advisorName={settings.agent.name} />
    </Suspense>
  );
}
