import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { TypesChart } from "./_components/TypesChart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function fetchTypesData(siteKey: string) {
  try {
    const res = await fetch(
      `${process.env.SITE_URL}/api/insights/overview?site=${encodeURIComponent(
        siteKey
      )}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function TypesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { siteKey: true },
  });

  const data = site ? await fetchTypesData(site.siteKey) : null;

  // Calculate metrics from real data
  const totalSearches =
    data?.tipos?.reduce(
      (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
      0
    ) || 0;

  // Get top 3 types
  const topTypes = data?.tipos?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tipos de Imóveis</h1>
        <p className="text-muted-foreground">
          Tipos de imóveis mais buscados pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <TypesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topTypes.map((type: any[], index: number) => {
            const typeName = type[0] || "N/A";
            const typeCount = parseInt(type[1]) || 0;
            const typePercentage =
              totalSearches > 0
                ? ((typeCount / totalSearches) * 100).toFixed(1)
                : "0";

            const labels = [
              "mais buscado",
              "segundo mais buscado",
              "terceiro mais buscado",
            ];

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{typeName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(typePercentage) > 0
                      ? `${typePercentage}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typeCount > 0
                      ? `${labels[index]} (${typeCount} pesquisas)`
                      : "Aguardando dados"}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Fill with empty cards if less than 3 types */}
          {Array.from({ length: Math.max(0, 3 - topTypes.length) }).map(
            (_, i) => (
              <Card key={`empty-${i}`}>
                <CardHeader>
                  <CardTitle className="text-base">-</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando dados
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
