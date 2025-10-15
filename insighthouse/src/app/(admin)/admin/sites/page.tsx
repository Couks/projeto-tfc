import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { DeleteSiteButton } from "./_components/DeleteSiteButton";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Pencil } from "lucide-react";

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
        <Button asChild size="sm">
          <Link href="/admin/sites/new">Novo Site</Link>
        </Button>
      </div>
      {!dbAvailable && (
        <div className="text-sm text-red-600">
          Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL e rode
          as migrações.
        </div>
      )}
      <div className="grid gap-3">
        {sites.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {s.siteKey}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Primário: {s.domains.find((d) => d.isPrimary)?.host || "-"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label="Edit site"
                    title="Edit site"
                  >
                    <Link href={`/admin/sites/${s.id}/edit`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <DeleteSiteButton siteId={s.id} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Link className="underline" href={`/admin/install`}>
                  Configuração
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {sites.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Nenhum site ainda.
          </div>
        )}
      </div>
    </div>
  );
}


