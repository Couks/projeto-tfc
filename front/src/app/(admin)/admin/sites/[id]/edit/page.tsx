import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { EditSiteForm } from './_components/EditSiteForm'
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) return null;
  const { id } = await params;
  const site = await prisma.site.findFirst({
    where: { id, userId: session.userId },
  });
  if (!site) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-red-600">Site not found.</div>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/sites">Back</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar Site</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/sites">Voltar</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <EditSiteForm
            site={{
              id: site.id,
              name: site.name,
              status: site.status as "active" | "inactive",
            }}
          />
                  </CardContent>
      </Card>
    </div>
  );
}


