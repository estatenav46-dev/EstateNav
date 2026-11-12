import { MarketSnapshotForm } from '@/components/admin/MarketForms';
import { getRepos } from '@/lib/data';

export const metadata = { title: 'Market data' };

export default async function AdminMarket() {
  const repos = getRepos();
  const [corridors, snapshots] = await Promise.all([repos.corridors.list(), repos.corridors.listMarketSnapshots()]);
  const blank = { id: '', corridorId: corridors[0]?.id ?? '', avgPricePerSqft: 0, yoyChangePct: 0, source: '', asOf: new Date().toISOString().slice(0, 10) };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Market data</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Corridor price figures shown in the home ticker and on the explore page. Add only figures you can cite: each one needs a source and an as-of date, and both are printed next to it on the site. With no figures here, the ticker stays hidden.
        </p>
      </div>
      <h2 className="text-sm font-semibold">Add a figure</h2>
      <MarketSnapshotForm snapshot={blank} corridors={corridors} isNew />
      <h2 className="pt-2 text-sm font-semibold">Published ({snapshots.length})</h2>
      {snapshots.length === 0 && <p className="text-sm text-ink-muted">Nothing published yet.</p>}
      {snapshots.map((s) => (
        <MarketSnapshotForm key={s.id} snapshot={s} corridors={corridors} />
      ))}
    </div>
  );
}
