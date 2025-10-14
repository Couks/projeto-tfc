import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function InstallPage() {
  const session = await getSession();
  let site: { siteKey: string } | null = null;
  let dbAvailable = true;
  try {
    site = await prisma.site.findFirst({
      where: { userId: session?.userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    dbAvailable = false;
  }
  const base = process.env.SITE_URL || "";
  const loaderUrl = site
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(site.siteKey)}`
    : "";
  return (
    <div className="space-y-4">
      {!dbAvailable && (
        <div className="text-sm text-red-600">
          Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL e rode
          as migrações.
        </div>
      )}
      <h1 className="text-xl font-semibold">Instalação</h1>
      {site ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Cole este snippet no seu site (GTM ou HTML):
          </div>
          <pre className="p-3 bg-gray-50 border rounded text-sm overflow-auto">{`<script async src="${loaderUrl}"></script>`}</pre>
        </div>
      ) : (
        <div className="text-sm text-gray-600">Crie um Site primeiro.</div>
      )}
    </div>
  );
}


