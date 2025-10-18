import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { PurposesChart } from "./_components/PurposesChart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function fetchPurposesData(siteKey: string) {
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

export default async function PurposesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { siteKey: true },
  });

  const data = site ? await fetchPurposesData(site.siteKey) : null;

  // Calculate metrics from real data
  const totalSearches =
    data?.finalidade?.reduce(
      (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
      0
    ) || 0;

  // Get top 3 purposes
  const topPurposes = data?.finalidade?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finalidades</h1>
        <p className="text-muted-foreground">
          Finalidades mais buscadas pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Finalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <PurposesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPurposes.map((purpose: any[], index: number) => {
            const purposeName = purpose[0] || "N/A";
            const purposeCount = parseInt(purpose[1]) || 0;
            const purposePercentage =
              totalSearches > 0
                ? ((purposeCount / totalSearches) * 100).toFixed(1)
                : "0";

            const labels = [
              "mais buscada",
              "segunda mais buscada",
              "terceira mais buscada",
            ];

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{purposeName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(purposePercentage) > 0
                      ? `${purposePercentage}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {purposeCount > 0
                      ? `${labels[index]} (${purposeCount} pesquisas)`
                      : "Aguardando dados"}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Fill with empty cards if less than 3 purposes */}
          {Array.from({ length: Math.max(0, 3 - topPurposes.length) }).map(
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
