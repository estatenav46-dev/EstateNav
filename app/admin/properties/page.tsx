import { Suspense } from 'react';
import { PropertiesTable } from '@/components/admin/PropertiesTable';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Properties' };

export default async function AdminProperties() {
  const repos = getRepos();
  const [properties, corridors] = await Promise.all([repos.properties.list({ status: 'any' }), repos.corridors.list()]);
  return (
    <Suspense>
      <PropertiesTable properties={properties} corridors={corridors} />
    </Suspense>
  );
}
