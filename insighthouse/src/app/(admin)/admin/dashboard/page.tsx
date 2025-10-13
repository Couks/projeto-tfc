import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function fetchTopCities(siteKey: string) {
  const res = await fetch(`${process.env.SITE_URL}/api/insights/top-cidades?site=${encodeURIComponent(siteKey)}`, { cache: 'no-store' });
  if (!res.ok) return [] as Array<{ cidade: string; total: number }>;
  const data = await res.json();
  // Expecting PostHog query shape: { results: [[cidade, total], ...], columns: ['cidade','total'] }
  const rows = Array.isArray(data.results) ? data.results : [];
  return rows.map((r: any[]) => ({ cidade: r[0], total: r[1] }));
}

export default async function DashboardPage() {
  const session = await getSession();
  const site = await prisma.site.findFirst({ where: { userId: session?.userId }, orderBy: { createdAt: 'desc' } });
  const rows = site ? await fetchTopCities(site.siteKey) : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Top Cities</h1>
      <div className="overflow-hidden rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">City</th>
              <th className="text-left px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: { cidade: string; total: number }, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{r.cidade}</td>
                <td className="px-3 py-2">{r.total}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-3 py-4 text-gray-500" colSpan={2}>No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


