import { SettingsForm } from '@/components/admin/EntityForms';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Settings' };

export default async function AdminSettings() {
  const settings = await getRepos().settings.get();
  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="font-serif text-2xl">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
