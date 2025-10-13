import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function SitesPage() {
  const session = await getSession();
  const sites = await prisma.site.findMany({ where: { userId: session?.userId }, include: { domains: true } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sites</h1>
        <Link className="text-sm underline" href="/admin/sites/new">New Site</Link>
      </div>
      <div className="grid gap-3">
        {sites.map((s) => (
          <div key={s.id} className="border rounded p-3 bg-white">
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-gray-600">{s.siteKey}</div>
            <div className="text-xs text-gray-600">Primary: {s.domains.find(d=>d.isPrimary)?.host || '-'}</div>
            <div className="mt-2 text-sm">
              <Link className="underline" href={`/admin/install`}>Installation</Link>
            </div>
          </div>
        ))}
        {sites.length === 0 && <div className="text-sm text-gray-600">No sites yet.</div>}
      </div>
    </div>
  );
}


