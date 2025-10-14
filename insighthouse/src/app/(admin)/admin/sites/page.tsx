import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { DeleteSiteButton } from "./_components/DeleteSiteButton";

export default async function SitesPage() {
  const session = await getSession();
  let sites: Array<{
    id: string;
    name: string;
    siteKey: string;
    domains: Array<{ isPrimary: boolean; host: string }>;
  }> = [];
  let dbAvailable = true;
  try {
    sites = await prisma.site.findMany({
      where: { userId: session?.userId },
      include: { domains: true },
    });
  } catch {
    dbAvailable = false;
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sites</h1>
        <Link className="text-sm underline" href="/admin/sites/new">
          Novo Site
        </Link>
      </div>
      {!dbAvailable && (
        <div className="text-sm text-red-600">
          Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL e rode
          as migrações.
        </div>
      )}
      <div className="grid gap-3">
        {sites.map((s) => (
          <div key={s.id} className="border rounded p-3 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">{s.siteKey}</div>
                <div className="text-xs text-gray-600">
                  Primário: {s.domains.find((d) => d.isPrimary)?.host || "-"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Link className="underline" href={`/admin/sites/${s.id}/edit`}>
                  Editar
                </Link>
                <DeleteSiteButton siteId={s.id} />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <Link className="underline" href={`/admin/install`}>
                Configuração
              </Link>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <div className="text-sm text-gray-600">Nenhum site ainda.</div>
        )}
      </div>
    </div>
  );
}


