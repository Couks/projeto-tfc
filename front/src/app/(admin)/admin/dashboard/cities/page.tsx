import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { CitiesChart } from "./_components/CitiesChart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function fetchCitiesData(siteKey: string) {
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

export default async function CitiesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { siteKey: true },
  });

  const data = site ? await fetchCitiesData(site.siteKey) : null;

  // Calculate real metrics from data
  const totalSearches =
    data?.cidades?.reduce(
      (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
      0
    ) || 0;

  const uniqueCities = data?.cidades?.length || 0;

  const topCity = data?.cidades?.[0]?.[0] || "N/A";
  const topCitySearches = data?.cidades?.[0]?.[1] || 0;
  const topCityPercentage =
    totalSearches > 0
      ? ((topCitySearches / totalSearches) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Top Cidades</h1>
        <p className="text-muted-foreground">
          Cidades com maior volume de pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Cidades Mais Pesquisadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CitiesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total de Pesquisas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSearches > 0 ? totalSearches.toLocaleString() : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalSearches > 0
                  ? "Pesquisas por cidade registradas"
                  : "Aguardando dados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidades Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueCities > 0 ? uniqueCities : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {uniqueCities > 0
                  ? "Cidades diferentes pesquisadas"
                  : "Aguardando dados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidade Líder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCity}</div>
              <p className="text-xs text-muted-foreground">
                {topCitySearches > 0
                  ? `${topCitySearches} pesquisas (${topCityPercentage}%)`
                  : "Aguardando dados"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
