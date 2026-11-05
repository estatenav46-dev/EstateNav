import { PropertyEditor } from '@/components/admin/PropertyEditor';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'New property' };

export default async function NewProperty() {
  const repos = getRepos();
  const [developers, corridors, hubs] = await Promise.all([repos.developers.list(), repos.corridors.list(), repos.corridors.listOfficeHubs()]);
  return <PropertyEditor initial={null} developers={developers} corridors={corridors} hubs={hubs} />;
}
