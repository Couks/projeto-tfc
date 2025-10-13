import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function InstallPage() {
  const session = await getSession();
  const site = await prisma.site.findFirst({ where: { userId: session?.userId }, orderBy: { createdAt: 'desc' } });
  const base = process.env.SITE_URL || '';
  const loaderUrl = site ? `${base}/api/sdk/loader?site=${encodeURIComponent(site.siteKey)}` : '';
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Installation</h1>
      {site ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Paste this snippet on your website (GTM or HTML):</div>
          <pre className="p-3 bg-gray-50 border rounded text-sm overflow-auto">{`<script async src="${loaderUrl}"></script>`}</pre>
        </div>
      ) : (
        <div className="text-sm text-gray-600">Create a Site first.</div>
      )}
    </div>
  );
}


