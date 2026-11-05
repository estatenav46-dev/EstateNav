import { DeveloperForm } from '@/components/admin/EntityForms';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Developers' };

export default async function AdminDevelopers() {
  const developers = await getRepos().developers.list();
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">Developers</h1>
      <p className="text-ink-muted">Logos are stored for the record but never shown in the site header.</p>
      {developers.map((d) => <DeveloperForm key={d.id} developer={d} />)}
    </div>
  );
}
