import { CorridorForm } from '@/components/admin/EntityForms';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Corridors' };

export default async function AdminCorridors() {
  const corridors = await getRepos().corridors.list();
  return (
    <div className="space-y-3">
      <h1 className="font-serif text-2xl">Corridors</h1>
      {corridors.map((c) => <CorridorForm key={c.id} corridor={c} />)}
    </div>
  );
}
