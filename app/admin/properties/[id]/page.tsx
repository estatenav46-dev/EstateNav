import { notFound } from 'next/navigation';
import { PropertyEditor } from '@/components/admin/PropertyEditor';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Edit property' };

export default async function EditProperty({ params }: { params: { id: string } }) {
  const repos = getRepos();
  const [property, developers, corridors, hubs] = await Promise.all([repos.properties.getById(params.id), repos.developers.list(), repos.corridors.list(), repos.corridors.listOfficeHubs()]);
  if (!property) notFound();
  return <PropertyEditor key={property.updatedAt + property.id} initial={property} developers={developers} corridors={corridors} hubs={hubs} />;
}
