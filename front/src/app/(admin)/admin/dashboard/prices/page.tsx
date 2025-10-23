import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { PricesChart } from "./_components/PricesChart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function fetchPricesData(siteKey: string) {
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

export default async function PricesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { siteKey: true },
  });

  const data = site ? await fetchPricesData(site.siteKey) : null;

  // Calculate metrics from real data (sale prices)
  const totalSearches =
    data?.preco_venda_ranges?.reduce(
      (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
      0
    ) || 0;

  // Get top 3 price ranges
  const topPrices = data?.preco_venda_ranges?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Faixas de Preço</h1>
        <p className="text-muted-foreground">
          Faixas de preço mais utilizadas nas pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa de Preço (Venda)</CardTitle>
          </CardHeader>
          <CardContent>
            <PricesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPrices.map((price: any[], index: number) => {
            const priceRange = price[0] || "N/A";
            const priceCount = parseInt(price[1]) || 0;
            const pricePercentage =
              totalSearches > 0
                ? ((priceCount / totalSearches) * 100).toFixed(1)
                : "0";

            const labels = [
              "mais popular",
              "segunda mais popular",
              "terceira mais popular",
            ];

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{priceRange}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(pricePercentage) > 0
                      ? `${pricePercentage}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {priceCount > 0
                      ? `${labels[index]} (${priceCount} pesquisas)`
                      : "Aguardando dados"}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Fill with empty cards if less than 3 price ranges */}
          {Array.from({ length: Math.max(0, 3 - topPrices.length) }).map(
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
